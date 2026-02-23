package cz.splithappens.config;

import cz.splithappens.security.JwtAuthFilter;
import cz.splithappens.security.JwtUtil;
import cz.splithappens.security.TokenBlacklist;
import cz.splithappens.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final TokenBlacklist tokenBlacklist;


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(
                auth -> auth
                    .requestMatchers("/api/auth/**").permitAll() // Allow unauthenticated access to auth endpoints
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

        // **Allowed Origin Patterns:** Allow any localhost with any port
        configuration.setAllowedOriginPatterns(List.of("http://localhost:*", "https://localhost:*"));

        // **Allowed Methods:** Specify only the necessary HTTP methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // **Allowed Headers:** Specify necessary headers
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        // **Exposed Headers:** Headers exposed to the client
        configuration.setExposedHeaders(List.of(HttpHeaders.LOCATION));

        // **Allow Credentials:** Set to true if your application requires credentials
        // (e.g., cookies)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
