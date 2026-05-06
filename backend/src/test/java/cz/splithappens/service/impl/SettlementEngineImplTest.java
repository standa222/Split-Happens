package cz.splithappens.service.impl;

import cz.splithappens.exception.GroupNotFoundException;
import cz.splithappens.model.Debt;
import cz.splithappens.model.Group;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.TransactionItem;
import cz.splithappens.model.User;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SettlementEngineImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private DebtRepository debtRepository;

    @InjectMocks
    private SettlementEngineImpl settlementEngine;

    @Captor
    private ArgumentCaptor<Debt> debtCaptor;

    @Test
    void calculateDebts_groupNotFound_throwsAndDoesNotTouchDebtRepo() {
        long groupId = 123L;
        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> settlementEngine.calculateDebts(groupId))
                .isInstanceOf(GroupNotFoundException.class);

        verify(debtRepository, never()).deleteByGroupId(any());
        verify(debtRepository, never()).save(any());
        verify(transactionRepository, never()).findByGroupId(any());
    }

    @Test
    void calculateDebts_noTransactions_createsNoDebtsButClearsOldOnes() {
        long groupId = 1L;
        User a = user(1L);
        User b = user(2L);
        Group group = group(groupId, a, b);

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(transactionRepository.findByGroupId(groupId)).thenReturn(List.of());

        settlementEngine.calculateDebts(groupId);

        verify(debtRepository).deleteByGroupId(groupId);
        verify(debtRepository, never()).save(any());
    }

    @Test
    void calculateDebts_singleDebtorSingleCreditor_persistsSingleDebt() {
        long groupId = 1L;
        User debtor = user(1L);
        User creditor = user(2L);
        Group group = group(groupId, debtor, creditor);

        Transaction tx = transaction(
                item(debtor, "-10.00"),
                item(creditor, "10.00")
        );

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(transactionRepository.findByGroupId(groupId)).thenReturn(List.of(tx));
        when(debtRepository.save(any(Debt.class))).thenAnswer(inv -> inv.getArgument(0));

        settlementEngine.calculateDebts(groupId);

        verify(debtRepository).deleteByGroupId(groupId);
        verify(debtRepository, times(1)).save(debtCaptor.capture());

        Debt debt = debtCaptor.getValue();
        assertThat(debt.getGroup()).isSameAs(group);
        assertThat(debt.getDebtor()).isSameAs(debtor);
        assertThat(debt.getCreditor()).isSameAs(creditor);
        assertThat(debt.getAmount()).isEqualByComparingTo("10.00");
    }

    @Test
    void calculateDebts_oneDebtorTwoCreditors_splitsIntoTwoDebts() {
        long groupId = 1L;
        User debtor = user(1L);
        User c1 = user(2L);
        User c2 = user(3L);
        Group group = group(groupId, debtor, c1, c2);

        Transaction tx = transaction(
                item(debtor, "-10.00"),
                item(c1, "6.00"),
                item(c2, "4.00")
        );

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(transactionRepository.findByGroupId(groupId)).thenReturn(List.of(tx));
        when(debtRepository.save(any(Debt.class))).thenAnswer(inv -> inv.getArgument(0));

        settlementEngine.calculateDebts(groupId);

        verify(debtRepository).deleteByGroupId(groupId);
        verify(debtRepository, times(2)).save(debtCaptor.capture());

        assertThat(debtTuples(debtCaptor.getAllValues()))
                .containsExactlyInAnyOrder(
                        tuple(debtor.getId(), c1.getId(), "6.00"),
                        tuple(debtor.getId(), c2.getId(), "4.00")
                );
    }

    @Test
    void calculateDebts_twoDebtorsOneCreditor_createsTwoDebtsToSameCreditor() {
        long groupId = 1L;
        User d1 = user(1L);
        User d2 = user(2L);
        User creditor = user(3L);
        Group group = group(groupId, d1, d2, creditor);

        Transaction tx = transaction(
                item(d1, "-3.00"),
                item(d2, "-7.00"),
                item(creditor, "10.00")
        );

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(group));
        when(transactionRepository.findByGroupId(groupId)).thenReturn(List.of(tx));
        when(debtRepository.save(any(Debt.class))).thenAnswer(inv -> inv.getArgument(0));

        settlementEngine.calculateDebts(groupId);

        verify(debtRepository).deleteByGroupId(groupId);
        verify(debtRepository, times(2)).save(debtCaptor.capture());

        assertThat(debtTuples(debtCaptor.getAllValues()))
                .containsExactlyInAnyOrder(
                        tuple(d1.getId(), creditor.getId(), "3.00"),
                        tuple(d2.getId(), creditor.getId(), "7.00")
                );
    }

    private static User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private static Group group(Long id, User... members) {
        Group g = new Group();
        g.setId(id);
        Set<User> set = new LinkedHashSet<>(Arrays.asList(members));
        g.setMembers(set);
        return g;
    }

    private static Transaction transaction(TransactionItem... items) {
        Transaction t = new Transaction();
        List<TransactionItem> list = new ArrayList<>();
        for (TransactionItem i : items) {
            i.setTransaction(t);
            list.add(i);
        }
        t.setItems(list);
        return t;
    }

    private static TransactionItem item(User user, String defaultCurrencyBalanceChange) {
        TransactionItem i = new TransactionItem();
        i.setUser(user);
        i.setDefaultCurrencyBalanceChange(new BigDecimal(defaultCurrencyBalanceChange));
        i.setBalanceChange(new BigDecimal(defaultCurrencyBalanceChange));
        return i;
    }

    private static List<String> debtTuples(List<Debt> debts) {
        return debts.stream()
                .map(d -> tuple(d.getDebtor().getId(), d.getCreditor().getId(), d.getAmount().toPlainString()))
                .toList();
    }

    private static String tuple(Long debtorId, Long creditorId, String amount) {
        return debtorId + "->" + creditorId + ":" + amount;
    }
}

