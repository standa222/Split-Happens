package cz.splithappens.security;

import cz.splithappens.model.User;
import cz.splithappens.service.UserService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final TokenBlacklist tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            // Extract JWT token from the Authorization header
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                // Check if the token is blacklisted
                if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                    // Token is blacklisted; respond with 401 Unauthorized
                    response.setStatus(HttpStatus.UNAUTHORIZED.value());
                    response.getWriter().write("Unauthorized: Token has been invalidated.");
                    return; // Stop further processing
                }

                // Parse the token to extract claims
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(jwtUtil.getKey())
                        .build()
                        .parseClaimsJws(jwt)
                        .getBody();

                String userId = claims.getSubject();

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    Optional<User> optionalUser = userService.findById(Long.parseLong(userId));
                    if (optionalUser.isPresent()) {
                        User user = optionalUser.get();
                        // Create user details and authentication token
                        CustomUserDetails userDetails = new CustomUserDetails(user, user.getAuthorities());
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, null, userDetails.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // Set the authentication in the security context
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
        } catch (Exception ex) {
            // Log the exception if needed
            logger.error("Could not set user authentication in security context", ex);
            // Respond with 401 Unauthorized
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return; // Stop further processing
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts the JWT token from the Authorization header.
     *
     * @param request The HTTP request.
     * @return The JWT token or null if not found.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7); // Remove "Bearer " prefix
        }
        return null;
    }
}
