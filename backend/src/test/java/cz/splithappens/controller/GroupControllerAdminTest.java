package cz.splithappens.controller;

import cz.splithappens.model.*;
import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.model.enums.TransactionType;
import cz.splithappens.repository.*;
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

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private DebtRepository debtRepository;

    @Autowired
    private TransactionItemRepository transactionItemRepository;

    private User testUser;
    private User testUser2;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setEmail("test@mail.com");
        testUser.setPasswordHash("hash");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        userRepository.save(testUser);

        testUser2 = new User();
        testUser2.setEmail("test2@mail.com");
        testUser2.setPasswordHash("hash2");
        testUser2.setFirstName("Test2");
        testUser2.setLastName("User");
        userRepository.save(testUser2);

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

    @Test
    void deleteGroupAdmin_groupHasDebts_returnsConflict() throws Exception {
        // arrange
        testUser.setAdmin(true);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        Group group = Group.builder()
                .name("Unsettled Group")
                .members(new HashSet<>(Set.of(testUser, testUser2)))
                .build();
        groupRepository.saveAndFlush(group);

        Debt debt = Debt.builder()
                .amount(java.math.BigDecimal.valueOf(10))
                .debtor(testUser)
                .creditor(testUser2)
                .group(group)
                .build();
        debtRepository.saveAndFlush(debt);

        // act + assert
        mockMvc.perform(delete("/api/groups/{groupId}", group.getId()))
                .andExpect(status().isConflict());

        assertThat(groupRepository.findById(group.getId())).isPresent();
    }

    @Test
    void deleteGroupAdmin_settledGroup_deletesGroupAndTransactions() throws Exception {
        // arrange
        testUser.setAdmin(true);
        userRepository.save(testUser);
        setAuthenticatedUser(testUser);

        Group group = Group.builder()
                .name("Settled Group")
                .members(new HashSet<>(Set.of(testUser, testUser2)))
                .build();
        groupRepository.saveAndFlush(group);

        Transaction transaction = getTestTransaction(group);
        transactionRepository.saveAndFlush(transaction);

        Long transactionId = transaction.getId();

        // act
        mockMvc.perform(delete("/api/groups/{groupId}", group.getId()))
                .andExpect(status().isNoContent());

        // assert: group deleted
        assertThat(groupRepository.findById(group.getId())).isEmpty();

        // assert: transactions deleted via DB cascade
        assertThat(transactionRepository.findById(transactionId)).isEmpty();
        assertThat(transactionItemRepository.findByUserId(testUser.getId())).isEmpty();
    }

    private void setAuthenticatedUser(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user, user.getAuthorities());
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
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
                        .user(testUser2)
                        .transaction(transaction)
                        .balanceChange(BigDecimal.valueOf(-50))
                        .defaultCurrencyBalanceChange(BigDecimal.valueOf(-50))
                        .filledValue(BigDecimal.valueOf(50))
                        .build()
        );
        transaction.setItems(items);
        return transaction;
    }
}


