package cz.splithappens.service.impl;

import cz.splithappens.model.Debt;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.TransactionItem;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.TransactionType;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.DebtService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DebtServiceImpl implements DebtService {
    private static final Logger logger = LoggerFactory.getLogger(DebtServiceImpl.class);

    private final TransactionRepository transactionRepository;
    private final DebtRepository debtRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void settleDebt(Long debtId) {
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new RuntimeException("Debt not found")); // TODO: Custom exception

        User debtor = userRepository.findById(debt.getDebtor().getId())
                .orElseThrow(() -> new RuntimeException("Debtor not found")); // TODO: Custom exception
        User creditor = userRepository.findById(debt.getCreditor().getId())
                .orElseThrow(() -> new RuntimeException("Creditor not found")); // TODO: Custom exception

        Transaction paymentTransaction = Transaction.builder()
                .group(debt.getGroup())
                .title("Payment")
                .totalAmount(debt.getAmount())
                .transactionType(TransactionType.PAYMENT)
                .currency(debt.getGroup().getDefaultCurrency())
                .build();

        paymentTransaction.setItems(List.of(
                TransactionItem.builder()
                        .transaction(paymentTransaction)
                        .user(debtor)
                        .balanceChange(debt.getAmount())
                        .build(),
                TransactionItem.builder()
                        .transaction(paymentTransaction)
                        .user(creditor)
                        .balanceChange(debt.getAmount().negate())
                        .build()
        ));

        debt.getGroup().updateLastActivity();

        transactionRepository.save(paymentTransaction);
        debtRepository.delete(debt);
    }
}
