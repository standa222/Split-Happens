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
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.SettlementEngine;
import cz.splithappens.service.TransactionService;
import cz.splithappens.strategy.transaction.SplitComputationStrategy;
import cz.splithappens.strategy.transaction.SplitComputationStrategyFactory;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final GroupRepository groupRepository;
    private final TransactionMapper transactionMapper;
    private final UserRepository userRepository;
    private final SettlementEngine settlementEngine;
    private final SplitComputationStrategyFactory splitComputationStrategyFactory;

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
        transaction.setPaidByMode(updateDto.getPaidByMode());
        transaction.setSplitBetweenMode(updateDto.getSplitBetweenMode());
        transaction.getItems().clear();
        transaction.getItems().addAll(createTransactionsItems(updateDto, transaction));
//        transaction.setCurrency(updateDto.getCurrency());
        transaction.setExpenseCategory(updateDto.getExpenseCategory());

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

        result.addAll(extractItems(createDto.getPaidByMode(), createDto.getPaidBy(), transaction, true, createDto.getTotalAmount()));
        result.addAll(extractItems(createDto.getSplitBetweenMode(), createDto.getSplitBetween(), transaction, false, createDto.getTotalAmount()));

        return result;
    }

    private List<TransactionItem> extractItems(TransactionSplitMode mode,
                                              List<TransactionSplitCreateDto> splits,
                                              Transaction transaction,
                                              boolean positiveBalance,
                                              BigDecimal totalAmount) {

        Map<Long, User> usersById = validateInputAndLoadUsers(mode, splits);

        SplitComputationStrategy strategy = splitComputationStrategyFactory.get(mode);
        if (strategy == null) {
            throw new BadRequestException("UNSUPPORTED_SPLIT_MODE", "Unsupported split mode: " + mode);
        }

        List<BigDecimal> computedAmounts = strategy.computeAmounts(splits, totalAmount);
        if (computedAmounts.size() != splits.size()) {
            throw new IllegalStateException("Split strategy returned invalid number of computed amounts");
        }

        List<TransactionItem> items = new ArrayList<>(splits.size());
        for (int i = 0; i < splits.size(); i++) {
            TransactionSplitCreateDto split = splits.get(i);
            BigDecimal amount = computedAmounts.get(i);
            BigDecimal signed = positiveBalance ? amount : amount.negate();
            items.add(new TransactionItem(
                    usersById.get(split.getUserId()),
                    transaction,
                    signed,
                    signed, // TODO convert to default currency if needed
                    split.getFilledValue()
            ));
        }
        return items;
    }

    private Map<Long, User> validateInputAndLoadUsers(TransactionSplitMode mode, List<TransactionSplitCreateDto> splits) {
        if (splits == null || splits.isEmpty()) {
            throw new BadRequestException("EMPTY_SPLITS", "Transaction must have at least one payer and at least one participant");
        }

        if (mode == null) {
            throw new BadRequestException("EMPTY_SPLIT_MODE", "Split mode must be provided");
        }

        List<Long> userIds = splits.stream()
                .map(TransactionSplitCreateDto::getUserId)
                .distinct()
                .toList();

        Map<Long, User> usersById = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        if (usersById.size() != userIds.size()) {
            List<Long> missing = userIds.stream()
                    .filter(id -> !usersById.containsKey(id))
                    .toList();
            throw new UserNotFoundException("User not found: " + missing);
        }
        return usersById;
    }
}
