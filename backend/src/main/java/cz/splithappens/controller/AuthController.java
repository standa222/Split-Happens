package cz.splithappens.controller;

import cz.splithappens.dto.request.LoginRequestDto;
import cz.splithappens.dto.response.LoginResponseDto;
import cz.splithappens.exception.InvalidCredentialsException;
import cz.splithappens.mapper.UserMapper;
import cz.splithappens.model.User;
import cz.splithappens.security.JwtUtil;
import cz.splithappens.security.TokenBlacklist;
import cz.splithappens.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "auth", description = "Authentication operations")
public class AuthController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final TokenBlacklist tokenBlacklist;

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticate a user and return a JWT token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful login", content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid credentials")
    })
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto loginRequest) {
        Optional<User> userOpt = userService.findByEmail(loginRequest.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(loginRequest.getPassword(), userOpt.get().getPassword())) {
            throw new InvalidCredentialsException();
        }

        return ResponseEntity.ok(new LoginResponseDto(
                jwtUtil.generateToken(userOpt.get()),
                userMapper.toDto(userOpt.get())
        ));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user", description = "Invalidate the user's JWT token")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful logout"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid token")
    })
    public ResponseEntity<Void> logout(@RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        // Extract the token from the header
        String token = authorizationHeader.substring(7); // Remove "Bearer " prefix

        try {
            // Parse the token to retrieve claims
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(jwtUtil.getKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            // Get the token's expiration date
            Date expiration = claims.getExpiration();

            // Add the token to the blacklist
            tokenBlacklist.blacklistToken(token, expiration);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            // Log the exception if needed
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}
