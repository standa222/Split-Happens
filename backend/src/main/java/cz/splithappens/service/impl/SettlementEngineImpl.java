package cz.splithappens.service.impl;

import cz.splithappens.exception.GroupNotFoundException;
import cz.splithappens.model.*;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.service.SettlementEngine;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SettlementEngineImpl implements SettlementEngine {
    private final TransactionRepository transactionRepository;
    private final GroupRepository groupRepository;
    private final DebtRepository debtRepository;

    @Override
    @Transactional
    public void calculateDebts(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        debtRepository.deleteByGroupId(groupId);

        List<Transaction> transactions = transactionRepository.findByGroupId(groupId);
        Map<User, BigDecimal> balances = computeGroupBalances(transactions);

        List<UserBalance> debtors = new ArrayList<>();
        List<UserBalance> creditors = new ArrayList<>();
        divideMembers(balances, debtors, creditors);

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            recordDebt(debtors, creditors, group);
        }
    }

    private void recordDebt(List<UserBalance> debtors, List<UserBalance> creditors, Group group) {
        UserBalance d = debtors.removeLast();
        UserBalance c = creditors.removeLast();

        BigDecimal amount = d.getBalance().abs().min(c.getBalance());

        Debt debt = Debt.builder()
                .debtor(d.getUser())
                .group(group)
                .creditor(c.getUser())
                .amount(amount)
                .build();
        debtRepository.save(debt);

        d.setBalance(d.getBalance().add(amount));
        c.setBalance(c.getBalance().subtract(amount));

        if (d.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            insertSorted(debtors, d, Comparator.comparing(UserBalance::getBalance));
        }
        if (c.getBalance().compareTo(BigDecimal.ZERO) != 0) {
            insertSorted(creditors, c, Comparator.comparing(UserBalance::getBalance).reversed());
        }
    }

    private void divideMembers(Map<User, BigDecimal> balances, List<UserBalance> debtors, List<UserBalance> creditors) {
        for (Map.Entry<User, BigDecimal> entry : balances.entrySet()) {
            BigDecimal balance = entry.getValue();
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                debtors.add(new UserBalance(entry.getKey(), balance));
            } else if (balance.compareTo(BigDecimal.ZERO) > 0) {
                creditors.add(new UserBalance(entry.getKey(), balance));
            }
        }

        debtors.sort(Comparator.comparing(UserBalance::getBalance));
        creditors.sort(Comparator.comparing(UserBalance::getBalance).reversed());
    }

    private Map<User, BigDecimal> computeGroupBalances(List<Transaction> transactions) {
        Map<User, BigDecimal> balances = new HashMap<>();

        for (Transaction transaction : transactions) {
            for (TransactionItem item : transaction.getItems()) {
                User user = item.getUser();
                BigDecimal currentBalance = balances.getOrDefault(user, BigDecimal.ZERO);
                balances.put(user, currentBalance.add(item.getDefaultCurrencyBalanceChange()));
            }
        }
        return balances;
    }

    private void insertSorted(List<UserBalance> list, UserBalance item, Comparator<UserBalance> comparator) {
        int index = Collections.binarySearch(list, item, comparator);
        if (index < 0) {
            index = -(index + 1);
        }
        list.add(index, item);
    }

    @Getter
    @Setter
    @AllArgsConstructor
    private static class UserBalance {
        private User user;
        private BigDecimal balance;
    }
}
