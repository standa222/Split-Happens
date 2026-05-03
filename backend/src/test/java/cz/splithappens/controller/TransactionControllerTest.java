package cz.splithappens.controller;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.model.*;
import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.model.enums.TransactionType;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private User testUser;
    private User testUser2;
    private Group testGroup;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setEmail("test@mail.com");
        testUser.setPasswordHash("hash");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        userRepository.save(testUser);

        testUser2 = new User();
        testUser2.setEmail("owner@mail.com");
        testUser2.setPasswordHash("hash");
        testUser2.setFirstName("Test2");
        testUser2.setLastName("User");
        userRepository.save(testUser2);

        testGroup = new Group();
        testGroup.setName("Test Group");
        testGroup.setDefaultCurrency(Currency.CZK);
        testGroup.setMembers(Set.of(testUser));
        groupRepository.save(testGroup);

        setAuthenticatedUser(testUser);
    }

    @Test
    void createTransaction_validFixedRequest_returnsCreated() throws Exception {
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setGroupId(testGroup.getId());
        dto.setTitle("Dinner");
        dto.setTotalAmount(new BigDecimal("100.00"));
        dto.setCurrency(Currency.CZK);
        dto.setPaidByMode(TransactionSplitMode.FIXED);
        dto.setSplitBetweenMode(TransactionSplitMode.FIXED);
        dto.setExpenseCategory(ExpenseCategory.ALCOHOL);
        dto.setTransactionType(TransactionType.EXPENSE);

        dto.setPaidBy(List.of(createSplitDto(testUser.getId(), "100.00")));
        dto.setSplitBetween(List.of(createSplitDto(testUser2.getId(), "100.00")));

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Dinner"))
                .andExpect(jsonPath("$.totalAmount").value(100.00));

        assertThat(transactionRepository.findByGroupId(testGroup.getId())).hasSize(1);
    }

    @Test
    void getTransactionDetails_existingTransaction_returnsDto() throws Exception {
        Transaction tx = new Transaction();
        tx.setGroup(testGroup);
        tx.setTitle("Coffee");
        tx.setTotalAmount(new BigDecimal("50.00"));
        tx.setCurrency(Currency.CZK);
        tx.setExpenseCategory(ExpenseCategory.COFFEE);
        tx.setTransactionType(TransactionType.EXPENSE);
        tx.setPaidByMode(TransactionSplitMode.FIXED);
        tx.setSplitBetweenMode(TransactionSplitMode.FIXED);
        transactionRepository.save(tx);

        mockMvc.perform(get("/api/transactions/{id}", tx.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Coffee"))
                .andExpect(jsonPath("$.totalAmount").value(50.00));
    }

    @Test
    void deleteTransaction_existingTransaction_returnsNoContent() throws Exception {
        Transaction tx = new Transaction();
        tx.setGroup(testGroup);
        tx.setTitle("To Delete");
        tx.setTotalAmount(new BigDecimal("10.00"));
        tx.setCurrency(Currency.CZK);
        tx.setExpenseCategory(ExpenseCategory.COFFEE);
        tx.setTransactionType(TransactionType.EXPENSE);
        tx.setPaidByMode(TransactionSplitMode.FIXED);
        tx.setSplitBetweenMode(TransactionSplitMode.FIXED);
        transactionRepository.save(tx);

        mockMvc.perform(delete("/api/transactions/{id}", tx.getId()))
                .andExpect(status().isNoContent());

        assertThat(transactionRepository.findById(tx.getId())).isEmpty();
    }

    @Test
    void createTransaction_invalidAmount_returnsBadRequestValidationError() throws Exception {
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setGroupId(testGroup.getId());
        dto.setTitle("Bad Transaction");
        dto.setTotalAmount(new BigDecimal("-50.00"));

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    void createTransaction_groupNotFound_returnsNotFound() throws Exception {
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setGroupId(999L);
        dto.setTitle("Nonexistent Group Transaction");
        dto.setTotalAmount(new BigDecimal("20.00"));
        dto.setCurrency(Currency.CZK);
        dto.setPaidByMode(TransactionSplitMode.FIXED);
        dto.setSplitBetweenMode(TransactionSplitMode.FIXED);
        dto.setExpenseCategory(ExpenseCategory.ALCOHOL);
        dto.setTransactionType(TransactionType.EXPENSE);

        dto.setPaidBy(List.of(createSplitDto(testUser.getId(), "20.00")));
        dto.setSplitBetween(List.of(createSplitDto(testUser2.getId(), "20.00")));

        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    private void setAuthenticatedUser(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user, List.of());
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private TransactionSplitCreateDto createSplitDto(Long userId, String value) {
        TransactionSplitCreateDto split = new TransactionSplitCreateDto();
        split.setUserId(userId);
        split.setFilledValue(new BigDecimal(value));
        return split;
    }
}
