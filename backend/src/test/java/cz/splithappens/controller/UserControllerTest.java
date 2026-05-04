package cz.splithappens.controller;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.model.*;
import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.model.enums.TransactionType;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
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

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
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

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User testUser;
    private User deletedUser;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setEmail("test@mail.com");
        testUser.setPasswordHash("hashedpassword");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setProfileImage(new byte[]{1, 2, 3});
        userRepository.save(testUser);

        deletedUser = new User();
        deletedUser.setEmail("delete@mail.com");
        deletedUser.setPasswordHash("hashedpassword");
        deletedUser.setFirstName("Delete");
        deletedUser.setLastName("User");
        userRepository.save(deletedUser);
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

    @Test
    void deleteUser_hasDebts_returnsConflict() throws Exception {
        // arrange
        Group group = Group.builder()
                .name("Test Group")
                .members(Set.of(testUser, deletedUser))
                .build();
        groupRepository.save(group);

        Debt debt = Debt.builder()
                .amount(BigDecimal.valueOf(100))
                .debtor(deletedUser)
                .creditor(testUser)
                .group(group)
                .build();
        debtRepository.save(debt);

        testUser.setAdmin(true);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        // act + assert
        mockMvc.perform(delete("/api/users/{userId}", deletedUser.getId()))
                .andExpect(status().isConflict());
    }

    @Test
    void deleteUser_noDebts_returnsOk() throws Exception {
        // arrange
        testUser.setAdmin(true);
        userRepository.saveAndFlush(testUser);
        setAuthenticatedUser(testUser);

        Group group = Group.builder()
                .name("Group With Deleted Member")
                .members(new HashSet<>(Set.of(testUser, deletedUser)))
                .build();
        groupRepository.saveAndFlush(group);

        Transaction transaction = getTestTransaction(group);
        transactionRepository.saveAndFlush(transaction);

        // act
        mockMvc.perform(delete("/api/users/{userId}", deletedUser.getId()))
                .andExpect(status().isNoContent());

        // assert: user is deleted
        assertFalse(userRepository.findById(deletedUser.getId()).isPresent());

        // assert: deleted user is no longer a member of the group
        Group reloadedGroup = groupRepository.findById(group.getId()).orElseThrow();
        boolean stillMember = reloadedGroup.getMembers().stream()
                .anyMatch(u -> u.getId().equals(deletedUser.getId()));
        assertFalse(stillMember);

        // assert: transaction items for deleted user are NOT removed (to preserve transaction history), but user reference is set to null
        Transaction reloadedTransaction = transactionRepository.findById(transaction.getId()).orElseThrow();
        assertEquals(2, reloadedTransaction.getItems().size());
        assertEquals(1, reloadedTransaction.getItems().stream()
                .filter(item -> item.getUser() == null)
                .count());
    }

    private Transaction getTestTransaction(Group group) {
        Transaction transaction = Transaction.builder()
                .title("Test Transaction")
                .totalAmount(BigDecimal.valueOf(50))
                .group(group)
                .transactionType(TransactionType.EXPENSE)
                .paidByMode(TransactionSplitMode.FIXED)
                .splitBetweenMode(TransactionSplitMode.FIXED)
                .currency(Currency.CZK)
                .expenseCategory(ExpenseCategory.DINING)
                .build();

        List<TransactionItem> items = List.of(
                TransactionItem.builder()
                        .user(testUser)
                        .transaction(transaction)
                        .balanceChange(BigDecimal.valueOf(50))
                        .defaultCurrencyBalanceChange(BigDecimal.valueOf(50))
                        .filledValue(BigDecimal.valueOf(50))
                        .build(),
                TransactionItem.builder()
                        .user(deletedUser)
                        .transaction(transaction)
                        .balanceChange(BigDecimal.valueOf(-50))
                        .defaultCurrencyBalanceChange(BigDecimal.valueOf(-50))
                        .filledValue(BigDecimal.valueOf(50))
                        .build()
        );
        transaction.setItems(items);
        return transaction;
    }

    private void setAuthenticatedUser(User user) {
            CustomUserDetails userDetails = new CustomUserDetails(user, user.getAuthorities());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}