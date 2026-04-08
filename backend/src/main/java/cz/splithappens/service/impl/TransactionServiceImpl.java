package cz.splithappens.service.impl;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.exception.BadRequestException;
import cz.splithappens.exception.GroupNotFoundException;
import cz.splithappens.exception.TransactionNotFoundException;
import cz.splithappens.exception.UserNotFoundException;
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
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
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
                .orElseThrow(() -> new GroupNotFoundException(createDto.getGroupId()));

        if (!group.getDefaultCurrency().equals(createDto.getCurrency())) { // TODO: allow different currency but calculate exchange rate
            throw new BadRequestException("INVALID_TRANSACTION_CURRENCY", "Transaction currency must match group default currency");
        }

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
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));
        return transactionMapper.toDto(transaction);
    }

    @Override
    @Transactional
    public TransactionDto updateTransaction(Long transactionId, TransactionCreateDto updateDto) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));
        transaction.setTitle(updateDto.getTitle());
        transaction.setTotalAmount(updateDto.getTotalAmount());
        transaction.getItems().clear();
        transaction.getItems().addAll(createTransactionsItems(updateDto, transaction));
        transaction.setCurrency(updateDto.getCurrency());

        Transaction newTransaction = transactionRepository.save(transaction);
        settlementEngine.calculateDebts(transaction.getGroup().getId());
        transaction.getGroup().updateLastActivity();
        return transactionMapper.toDto(newTransaction);
    }

    @Override
    @Transactional
    public void deleteTransaction(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException(transactionId));
        transactionRepository.delete(transaction);
        transaction.getGroup().updateLastActivity();
        settlementEngine.calculateDebts(transaction.getGroup().getId());
    }

    private List<TransactionItem> createTransactionsItems(TransactionCreateDto createDto, Transaction transaction) {
        // TODO calculate exchange rates if transaction currency is different from group default currency
        List<TransactionItem> result = new ArrayList<>();

        result.addAll(extractItems(createDto.getPaidBy(), transaction, true, createDto.getTotalAmount()));
        result.addAll(extractItems(createDto.getSplitBetween(), transaction, false, createDto.getTotalAmount()));

        return result;
    }

    private List<TransactionItem> extractItems(List<TransactionSplitCreateDto> splits, Transaction transaction, boolean positiveBalance, BigDecimal totalAmount) {
        if (splits == null || splits.isEmpty()) {
            throw new BadRequestException("EMPTY_SPLITS", "Transaction must have at least one payer and at least one participant");
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
            throw new UserNotFoundException("User not found: " + missing);
        }

        boolean fixedMode = splits.stream().allMatch(s -> s.getFixed() != null);
        boolean partialMode = splits.stream().allMatch(s -> s.getPartial() != null);

        if (fixedMode) {
            return splits.stream()
                    .map(split -> {
                        BigDecimal amount = split.getFixed();
                        return new TransactionItem(
                                usersById.get(split.getUserId()),
                                transaction,
                                positiveBalance ? amount : amount.negate(),
                                positiveBalance ? amount : amount.negate() // TODO convert to default currency if needed
                        );
                    })
                    .toList();
        }

        if (partialMode) {
            int totalParts = splits.stream()
                    .map(TransactionSplitCreateDto::getPartial)
                    .reduce(0, Integer::sum);

            if (totalParts <=0) {
                throw new BadRequestException("INVALID_PARTIAL_SPLIT", "Total parts must be greater than 0");
            }

            return splits.stream()
                    .map(split -> {
                        BigDecimal amount = totalAmount .multiply(BigDecimal.valueOf(split.getPartial()))
                                .divide(BigDecimal.valueOf(totalParts),2, java.math.RoundingMode.HALF_UP);

                        return new TransactionItem(
                                usersById.get(split.getUserId()),
                                transaction,
                                positiveBalance ? amount : amount.negate(),
                                positiveBalance ? amount : amount.negate() // TODO convert to default currency if needed
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
                            positiveBalance ? amount : amount.negate(),
                            positiveBalance ? amount : amount.negate() // TODO convert to default currency if needed
                    );
                })
                .toList();
    }
}
