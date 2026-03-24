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
import cz.splithappens.service.SettlementEngine;
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
    private final SettlementEngine settlementEngine;

    @Override
    @Transactional
    public TransactionDto createTransaction(TransactionCreateDto createDto) {
        // TODO distinguish between expense and payment types and validate accordingly (e.g. payment must have exactly 2 splits, one positive and one negative)
        Group group = groupRepository.findById(createDto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception

        Transaction transaction = transactionMapper.toEntity(createDto);
        List<TransactionItem> items = createTransactionsItems(createDto, transaction);

        transaction.setItems(items);
        transaction.setGroup(group);

        Transaction response = transactionRepository.save(transaction);
        settlementEngine.calculateDebts(group.getId()); // TODO should only be done if type is expense, not payment
        group.updateLastActivity();
        return transactionMapper.toDto(response);
    }

    @Override
    @Transactional
    public List<TransactionDto> getGroupTransactions(Long groupId) {
        return transactionRepository.findByGroupIdOrderByCreatedAtDesc(groupId).stream()
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
        // TODO - update items (maybe just delete all and create new ones)
//        transaction.setItems(updateDto.getItems().stream()
//                .map(transactionMapper::toItemEntity)
//                .toList());
        transaction.setTotalAmount(updateDto.getTotalAmount());

        Transaction newTransaction = transactionRepository.save(transaction);
        settlementEngine.calculateDebts(transaction.getGroup().getId());
        transaction.getGroup().updateLastActivity();
        return transactionMapper.toDto(newTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found")); // TODO: Custom exception
        transactionRepository.delete(transaction);
        transaction.getGroup().updateLastActivity();
        settlementEngine.calculateDebts(transaction.getGroup().getId());
    }

    private List<TransactionItem> createTransactionsItems(TransactionCreateDto createDto, Transaction transaction) {
        List<TransactionItem> result = new ArrayList<>();

        result.addAll(extractItems(createDto.getPaidBy(), transaction, true, createDto.getTotalAmount()));
        result.addAll(extractItems(createDto.getSplitBetween(), transaction, false, createDto.getTotalAmount()));

        return result;
    }

    private List<TransactionItem> extractItems(List<TransactionSplitCreateDto> splits, Transaction transaction, boolean positiveBalance, BigDecimal totalAmount) {
        if (splits == null || splits.isEmpty()) {
            throw new RuntimeException("Transaction must have at least one payer and at least one participant"); // TODO: Custom exception
        }

        List<Long> userIds = splits.stream()
                .map(TransactionSplitCreateDto::getUserId)
                .distinct()
                .toList();

        java.util.Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(java.util.stream.Collectors.toMap(User::getId, u -> u));

        if (usersById.size() != userIds.size()) {
            List<Long> missing = userIds.stream()
                    .filter(id -> !usersById.containsKey(id))
                    .toList();
            throw new RuntimeException("User not found: " + missing);
        }

        boolean fixedMode = splits.stream().allMatch(s -> s.getFixed() != null);
        boolean partialMode = splits.stream().allMatch(s -> s.getPartial() != null);
        boolean percentageMode = splits.stream().allMatch(s -> s.getPercentage() != null);

        int modes = (fixedMode ?1 :0) + (partialMode ?1 :0) + (percentageMode ?1 :0);
        if (modes !=1) {
            throw new RuntimeException("Invalid splits: use exactly one split mode");
        }

        if (fixedMode) {
            return splits.stream()
                    .map(split -> {
                        BigDecimal amount = split.getFixed();
                        return new TransactionItem(
                                usersById.get(split.getUserId()),
                                transaction,
                                positiveBalance ? amount : amount.negate()
                        );
                    })
                    .toList();
        }

        if (partialMode) {
            int totalParts = splits.stream()
                    .map(TransactionSplitCreateDto::getPartial)
                    .reduce(0, Integer::sum);

            if (totalParts <=0) {
                throw new RuntimeException("Total parts must be greater than0");
            }

            return splits.stream()
                    .map(split -> {
                        BigDecimal amount = totalAmount .multiply(BigDecimal.valueOf(split.getPartial()))
                                .divide(BigDecimal.valueOf(totalParts),2, java.math.RoundingMode.HALF_UP);

                        return new TransactionItem(
                                usersById.get(split.getUserId()),
                                transaction,
                                positiveBalance ? amount : amount.negate()
                        );
                    })
                    .toList();
        }

        return splits.stream()
                .map(split -> {
                    BigDecimal amount = totalAmount .multiply(BigDecimal.valueOf(split.getPercentage()))
                            .divide(BigDecimal.valueOf(100),2, java.math.RoundingMode.HALF_UP);

                    return new TransactionItem(
                            usersById.get(split.getUserId()),
                            transaction,
                            positiveBalance ? amount : amount.negate()
                    );
                })
                .toList();
    }
}
