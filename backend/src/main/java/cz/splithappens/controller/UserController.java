package cz.splithappens.controller;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.security.CustomUserDetails;
import cz.splithappens.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for managing users, including registration.")
public class UserController {
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Register a new user", description = "Registers a new user with the provided email and password.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<UserDto> createUser(@RequestBody @Valid UserCreateDto createDto) {
        return ResponseEntity.ok(userService.createUser(createDto));
    }

    @GetMapping
    @Operation(summary = "Search users", description = "Finds users by name or email matching the query string.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users found successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid query parameter")
    })
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "20") int limit) {
        return ResponseEntity.ok(userService.searchUsers(query, limit));
    }

    @PutMapping
    @Operation(summary = "Update user profile", description = "Updates the user's profile information.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserDto> updateProfile(@RequestBody @Valid UserCreateDto updateDto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUser().getId(), updateDto));
    }
}
