package cz.splithappens.service.impl;

import cz.splithappens.exception.DebtNotFoundException;
import cz.splithappens.exception.UserNotFoundException;
import cz.splithappens.model.Debt;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.TransactionItem;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.model.enums.TransactionType;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.DebtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DebtServiceImpl implements DebtService {
    private final TransactionRepository transactionRepository;
    private final DebtRepository debtRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void settleDebt(Long debtId) {
        Debt debt = debtRepository.findById(debtId)
                .orElseThrow(() -> new DebtNotFoundException(debtId));

        User debtor = userRepository.findById(debt.getDebtor().getId())
                .orElseThrow(() -> new UserNotFoundException(debt.getDebtor().getId()));
        User creditor = userRepository.findById(debt.getCreditor().getId())
                .orElseThrow(() -> new UserNotFoundException(debt.getCreditor().getId()));

        Transaction paymentTransaction = Transaction.builder()
                .group(debt.getGroup())
                .title("Payment")
                .totalAmount(debt.getAmount())
                .paidByMode(TransactionSplitMode.FIXED)
                .splitBetweenMode(TransactionSplitMode.FIXED)
                .transactionType(TransactionType.PAYMENT)
                .currency(debt.getGroup().getDefaultCurrency())
                .build();

        paymentTransaction.setItems(List.of(
                TransactionItem.builder()
                        .transaction(paymentTransaction)
                        .user(debtor)
                        .balanceChange(debt.getAmount())
                        .defaultCurrencyBalanceChange(debt.getAmount()) // TODO: Handle currency conversion if needed
                        .filledValue(debt.getAmount())
                        .build(),
                TransactionItem.builder()
                        .transaction(paymentTransaction)
                        .user(creditor)
                        .balanceChange(debt.getAmount().negate())
                        .defaultCurrencyBalanceChange(debt.getAmount().negate()) // TODO: Handle currency conversion if needed
                        .filledValue(debt.getAmount().negate())
                        .build()
        ));

        debt.getGroup().updateLastActivity();

        transactionRepository.save(paymentTransaction);
        debtRepository.delete(debt);
    }
}
