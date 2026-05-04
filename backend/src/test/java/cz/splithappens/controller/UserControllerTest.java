package cz.splithappens.controller;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.model.User;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setEmail("test@mail.com");
        testUser.setPasswordHash("hashedpassword");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setProfileImage(new byte[]{1, 2, 3});
        userRepository.save(testUser);
    }

    @Test
    void createUser_validRequest_returnsOk() throws Exception {
        // arrange
        UserCreateDto dto = new UserCreateDto();
        String email = "test@example.com";
        dto.setEmail(email);
        dto.setPassword("password123");
        dto.setFirstName("Test");
        dto.setLastName("User");

        // act
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("test@example.com"));

        // assert
        User createdUser = userRepository.findByEmail(email).orElse(null);
        assertNotNull(createdUser);
        assertEquals(email, createdUser.getEmail());
        assertEquals("Test", createdUser.getFirstName());
        assertEquals("User", createdUser.getLastName());
    }

    @Test
    void createUser_invalidRequest_triggersExceptionHandler() throws Exception {
        UserCreateDto dto = new UserCreateDto();
        dto.setEmail("invalid-email");

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    @WithMockUser
    void searchUsers_returnsList() throws Exception {
        mockMvc.perform(get("/api/users")
                        .param("query", "test")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getUserImage_returnsBytesAndHeaders() throws Exception {
        byte[] content = new byte[]{1, 2, 3};
        setAuthenticatedUser(testUser);

        mockMvc.perform(get("/api/users/{userId}/image", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/webp"))
                .andExpect(header().exists("Cache-Control"))
                .andExpect(content().bytes(content));
    }

    @Test
    void uploadUserImage_withAuthenticatedUser_returnsOk() throws Exception {
        setAuthenticatedUser(testUser);
        MockMultipartFile file = new MockMultipartFile("file", "test.jpg", "image/jpeg", "image-content".getBytes());

        mockMvc.perform(multipart("/api/users/image")
                        .file(file))
                .andExpect(status().isOk());
    }

    @Test
    void getAllUsersAdmin_asNonAdmin_returnsForbidden() throws Exception {
        // arrange
        testUser.setAdmin(false);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        // act + assert
        mockMvc.perform(get("/api/users/admin")
                        .param("limit", "10"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllUsersAdmin_asAdmin_returnsOk() throws Exception {
        // arrange
        testUser.setAdmin(true);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        // act + assert
        mockMvc.perform(get("/api/users/admin")
                        .param("limit", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    private void setAuthenticatedUser(User user) {
            CustomUserDetails userDetails = new CustomUserDetails(user, user.getAuthorities());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}