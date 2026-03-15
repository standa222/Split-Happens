package cz.splithappens.service.impl;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.mapper.TransactionMapper;
import cz.splithappens.model.Group;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.TransactionItem;
import cz.splithappens.model.User;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.TransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private static final Logger logger = LoggerFactory.getLogger(TransactionServiceImpl.class);

    private final TransactionRepository transactionRepository;
    private final GroupRepository groupRepository;
    private final TransactionMapper transactionMapper;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TransactionDto createTransaction(TransactionCreateDto createDto) {
        logger.info("Creating transaction with title '{}' for group ID {}", createDto.getTitle(), createDto.getGroupId());
        logger.info("Transaction details: totalAmount={}, transactionType={}, paidBy={}, splitBetween{}",
                createDto.getTotalAmount(), createDto.getTransactionType(), createDto.getPaidBy(), createDto.getSplitBetween());

        Group group = groupRepository.findById(createDto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception

        Transaction transaction = transactionMapper.toEntity(createDto);
        List<TransactionItem> items = createTransactionsItems(createDto, transaction);

        transaction.setItems(items);
        transaction.setGroup(group);

        Transaction response = transactionRepository.save(transaction);

        // TODO recalculate group balances and debts

        return transactionMapper.toDto(response);
    }

    @Override
    @Transactional
    public List<TransactionDto> getGroupTransactions(Long groupId) {
        return transactionRepository.findByGroupId(groupId).stream()
                .map(transactionMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public TransactionDto getTransactionById(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found")); // TODO: Custom exception
        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDto updateTransaction(Long transactionId, TransactionCreateDto updateDto) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found")); // TODO: Custom exception

        transaction.setTitle(updateDto.getTitle());
//        transaction.setItems(updateDto.getItems().stream()
//                .map(transactionMapper::toItemEntity)
//                .toList());
        transaction.setTotalAmount(updateDto.getTotalAmount());

        // TODO recalculate group balances and debts

        return transactionMapper.toDto(transactionRepository.save(transaction));
    }

    @Override
    @Transactional
    public void deleteTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found")); // TODO: Custom exception
        transactionRepository.delete(transaction);

        // TODO recalculate group balances and debts
    }

    private List<TransactionItem> createTransactionsItems(TransactionCreateDto createDto, Transaction transaction) {
        List<TransactionItem> result = new ArrayList<>();

        result.addAll(extractItems(createDto.getPaidBy(), transaction, true, createDto.getTotalAmount()));
        result.addAll(extractItems(createDto.getSplitBetween(), transaction, false, createDto.getTotalAmount()));

        return result;
    }

    private List<TransactionItem> extractItems(List<TransactionSplitCreateDto> splits, Transaction transaction, boolean positiveBalance, BigDecimal totalAmount) {
        if (splits.isEmpty()) {
            throw new RuntimeException("Transaction must have at least one payer and at least one participant"); // TODO: Custom exception
        }

        if (splits.getFirst().getFixed() != null) {
            return splits.stream().map(split -> {
                User user = userRepository.findById(split.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found!")); // TODO Custom exception
                return new TransactionItem(user, transaction, positiveBalance ? split.getFixed() : split.getFixed().negate());
            })
            .toList();
        }
        if (splits.getFirst().getPartial() != null) {
            int totalParts = splits.stream()
                    .map(TransactionSplitCreateDto::getPartial)
                    .reduce(0, Integer::sum);
            return splits.stream().map(split -> {
                User user = userRepository.findById(split.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found!")); // TODO Custom exception
                BigDecimal balance = totalAmount.multiply(BigDecimal.valueOf(split.getPartial())).divide(BigDecimal.valueOf(totalParts));
                return new TransactionItem(user, transaction, positiveBalance ? balance : balance.negate());
            })
            .toList();
        }
        if (splits.getFirst().getPercentage() != null) {
            return splits.stream()
                    .map(split -> {
                        User user = userRepository.findById(split.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found!")); // TODO Custom exception
                        BigDecimal balance = totalAmount.multiply(BigDecimal.valueOf(split.getPercentage())).divide(BigDecimal.valueOf(100));
                        return new TransactionItem(user, transaction, positiveBalance ? balance : balance.negate());
                    })
                    .toList();
        }
        throw new RuntimeException("invalid splits"); // TODO custom exception
    }
}
