package cz.splithappens.service.impl;

import cz.splithappens.event.DebtSettledEvent;
import cz.splithappens.exception.DebtNotFoundException;
import cz.splithappens.exception.UserNotFoundException;
import cz.splithappens.model.Debt;
import cz.splithappens.model.Group;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.TransactionItem;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.TransactionType;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DebtServiceImplTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private DebtRepository debtRepository;
    @Mock private UserRepository userRepository;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private DebtServiceImpl debtService;
    @Captor private ArgumentCaptor<Transaction> transactionCaptor;

    private static final Long D_ID = 1L;
    private static final BigDecimal AMOUNT = new BigDecimal("10.00");
    private User user1;
    private User user2;

    @BeforeEach
    void setup() {
        user1 = new User();
        user1.setId(1L);

        user2 = new User();
        user2.setId(2L);
    }

    @Test
    void settleDebt_happyPath_createsPaymentAndDeletesDebt() {
        Group group = spy(group(100L));
        Debt debt = createDebt(group, user1, user2);

        when(debtRepository.findById(D_ID)).thenReturn(Optional.of(debt));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
        when(transactionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        debtService.settleDebt(D_ID, user1);

        verify(group).updateLastActivity();
        verify(debtRepository).delete(debt);
        verify(transactionRepository).save(transactionCaptor.capture());

        Transaction saved = transactionCaptor.getValue();
        assertThat(saved.getTransactionType()).isEqualTo(TransactionType.PAYMENT);
        assertThat(saved.getTotalAmount()).isEqualByComparingTo(AMOUNT);

        assertBalance(saved, 1L, "10.00");
        assertBalance(saved, 2L, "-10.00");
        verify(eventPublisher).publishEvent(any(DebtSettledEvent.class));
    }

    @Test
    void settleDebt_debtNotFound_throws() {
        when(debtRepository.findById(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> debtService.settleDebt(404L, user1))
                .isInstanceOf(DebtNotFoundException.class);

        verifyNoInteractions(userRepository, transactionRepository, eventPublisher);
    }

    @Test
    void settleDebt_userNotFound_throws() {
        Debt debt = createDebt(group(100L), user1, user2);
        when(debtRepository.findById(D_ID)).thenReturn(Optional.of(debt));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> debtService.settleDebt(D_ID, user1))
                .isInstanceOf(UserNotFoundException.class);

        verify(transactionRepository, never()).save(any());
    }

    private void assertBalance(Transaction tx, Long userId, String expected) {
        TransactionItem item = tx.getItems().stream()
                .filter(i -> i.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow();
        assertThat(item.getBalanceChange()).isEqualByComparingTo(expected);
        assertThat(item.getTransaction()).isSameAs(tx);
    }

    private Debt createDebt(Group group, User debtor, User creditor) {
        return Debt.builder()
            .id(D_ID)
            .group(group)
            .amount(AMOUNT)
            .debtor(debtor)
            .creditor(creditor)
            .build();
    }

    private static Group group(Long id) {
        Group g = new Group();
        g.setId(id);
        return g;
    }
}