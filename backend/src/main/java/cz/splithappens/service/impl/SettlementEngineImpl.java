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
        Map<User, BigDecimal> balances = new HashMap<>();

        for (User member : group.getMembers()) {
            balances.put(member, BigDecimal.ZERO);
        }

        for (Transaction transaction : transactions) {
            for (TransactionItem item : transaction.getItems()) {
                User user = item.getUser();
                BigDecimal currentBalance = balances.getOrDefault(user, BigDecimal.ZERO);
                balances.put(user, currentBalance.add(item.getDefaultCurrencyBalanceChange()));
            }
        }

        List<UserBalance> debtors = new ArrayList<>();
        List<UserBalance> creditors = new ArrayList<>();

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

        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            UserBalance d = debtors.removeLast();
            UserBalance c = creditors.removeLast();

            BigDecimal amount = d.getBalance().abs().min(c.getBalance());

            Debt debt = new Debt();
            debt.setDebtor(d.getUser());
            debt.setGroup(group);
            debt.setCreditor(c.getUser());
            debt.setAmount(amount);
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
