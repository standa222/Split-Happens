package cz.splithappens.controller;

import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.Currency;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class GroupControllerAdminTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setEmail("test@mail.com");
        testUser.setPasswordHash("hash");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        userRepository.save(testUser);

        Group g = new Group();
        g.setName("Test Group");
        g.setDefaultCurrency(Currency.CZK);
        g.setMembers(Set.of(testUser));
        groupRepository.save(g);
    }

    @Test
    void getAllGroupsAdmin_asNonAdmin_returnsForbidden() throws Exception {
        testUser.setAdmin(false);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        mockMvc.perform(get("/api/groups/admin"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAllGroupsAdmin_asAdmin_returnsOk() throws Exception {
        testUser.setAdmin(true);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        mockMvc.perform(get("/api/groups/admin"))
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


