package cz.splithappens.config;

import cz.splithappens.model.User;
import cz.splithappens.security.CustomUserDetails;
import cz.splithappens.security.JwtAuthFilter;
import cz.splithappens.security.JwtUtil;
import cz.splithappens.security.TokenBlacklist;
import cz.splithappens.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;
    @Value("${APP_CORS_ALLOWED_ORIGINS:}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(
                auth -> auth
                    .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll() // Allow unauthenticated access to auth endpoints
                    .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // allow unauthenticated access to user registration
                    .requestMatchers("/v3/api-docs/**","/swagger-ui/**", "/swagger-ui.html").permitAll() // Allow unauthenticated access to Swagger UI
                    .anyRequest().authenticated() // Require authentication for all other endpoints
            )
            // Handle unauthorized access
            .exceptionHandling(ehc -> ehc
                    .authenticationEntryPoint(
                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            // Disable CSRF (since we're using JWT)
            .csrf(AbstractHttpConfigurer::disable)
            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Set frame options to same origin
            .headers(headers -> headers
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            // Disable form login as we're using JWT
            .formLogin(AbstractHttpConfigurer::disable)
            // Disable default logout handling
            .logout(AbstractHttpConfigurer::disable)
            // Add JWT filter before UsernamePasswordAuthenticationFilter
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);;
        return http.build();
    }

    @Bean
    public JwtAuthFilter jwtAuthenticationFilter() {
        return new JwtAuthFilter(jwtUtil, userService, tokenBlacklist);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> originsList = new ArrayList<>();

        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
            originsList.addAll(Arrays.asList(allowedOrigins.split(",")));
        }
        originsList.add("http://localhost:*");
        originsList.add("https://localhost:*");

        configuration.setAllowedOriginPatterns(originsList);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of(HttpHeaders.LOCATION));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return email -> {
            User user = userService.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
            return new CustomUserDetails(user, user.getAuthorities());
        };
    }
}
