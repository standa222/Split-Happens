package cz.splithappens.security;

import cz.splithappens.model.User;
import cz.splithappens.service.UserService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.security.Key;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserService userService;

    @Mock
    private TokenBlacklist tokenBlacklist;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthFilter jwtAuthFilter;

    private Key testKey;
    private String validToken;

    @BeforeEach
    void setUp() {
        // Clear security context before each test
        SecurityContextHolder.clearContext();

        // Create a real key and token for the parser logic to work
        testKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        validToken = Jwts.builder()
                .setSubject("1")
                .signWith(testKey)
                .compact();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_validToken_setsAuthentication() throws Exception {
        // arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + validToken);
        MockHttpServletResponse response = new MockHttpServletResponse();

        User user = new User();
        user.setId(1L);
        user.setEmail("test@mail.com");
        user.setPasswordHash("dummy-password-hash");

        when(jwtUtil.getKey()).thenReturn(testKey);
        when(tokenBlacklist.isTokenBlacklisted(validToken)).thenReturn(false);
        when(userService.findById(1L)).thenReturn(Optional.of(user));

        // act
        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        // assert
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo("test@mail.com");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_blacklistedToken_returns401() throws Exception {
        // arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + validToken);
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(tokenBlacklist.isTokenBlacklisted(validToken)).thenReturn(true);

        // act
        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        // assert
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verifyNoInteractions(filterChain); // Chain should stop
    }

    @Test
    void doFilterInternal_invalidToken_returns401() throws Exception {
        // arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer invalid.token.payload");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // act
        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        // assert
        assertThat(response.getStatus()).isEqualTo(HttpServletResponse.SC_UNAUTHORIZED);
        verifyNoInteractions(filterChain);
    }

    @Test
    void doFilterInternal_noToken_continuesChain() throws Exception {
        // arrange
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        // act
        jwtAuthFilter.doFilterInternal(request, response, filterChain);

        // assert
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }
}