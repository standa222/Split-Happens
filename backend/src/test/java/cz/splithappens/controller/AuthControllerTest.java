package cz.splithappens.controller;

import cz.splithappens.dto.request.LoginRequestDto;
import cz.splithappens.model.User;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.security.JwtUtil;
import cz.splithappens.security.TokenBlacklist;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenBlacklist tokenBlacklist;

    private User testUser;
    private final String rawPassword = "password123";

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setEmail("auth-test@mail.com");
        testUser.setPasswordHash(passwordEncoder.encode(rawPassword));
        testUser.setFirstName("Auth");
        testUser.setLastName("Test");
        userRepository.save(testUser);
    }

    @Test
    void login_validCredentials_returnsTokenAndUser() throws Exception {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail(testUser.getEmail());
        request.setPassword(rawPassword);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.user.email").value(testUser.getEmail()));
    }

    @Test
    void login_invalidPassword_returnsUnauthorized() throws Exception {
        LoginRequestDto request = new LoginRequestDto();
        request.setEmail(testUser.getEmail());
        request.setPassword("wrong-password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_validToken_blacklistsTokenAndReturnsOk() throws Exception {
        String token = jwtUtil.generateToken(testUser);

        mockMvc.perform(post("/api/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().isOk());

        assertThat(tokenBlacklist.isTokenBlacklisted(token)).isTrue();
    }

    @Test
    void logout_noHeader_returnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void logout_invalidTokenFormat_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }
}