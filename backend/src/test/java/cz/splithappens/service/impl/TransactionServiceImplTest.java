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
import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.SettlementEngine;
import cz.splithappens.strategy.transaction.SplitComputationStrategy;
import cz.splithappens.strategy.transaction.SplitComputationStrategyFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private GroupRepository groupRepository;
    @Mock private TransactionMapper transactionMapper;
    @Mock private UserRepository userRepository;
    @Mock private SettlementEngine settlementEngine;
    @Mock private SplitComputationStrategyFactory strategyFactory;
    @Mock private SplitComputationStrategy mockStrategy;
    @Mock private ApplicationEventPublisher eventPublisher;

    @InjectMocks private TransactionServiceImpl transactionService;
    @Captor private ArgumentCaptor<Transaction> transactionCaptor;

    private static final Long G_ID = 1L;
    private Group testGroup;
    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        testGroup = Group.builder()
                .id(G_ID)
                .name("Test Group")
                .build();

        user1 = user(1L);
        user2 = user(2L);
    }

    @ParameterizedTest
    @EnumSource(value = TransactionSplitMode.class, names = {"FIXED", "PERCENTAGE", "PARTIAL"})
    void createTransaction_variousModes_computesCorrectAmounts(TransactionSplitMode mode) {
        when(groupRepository.findById(G_ID)).thenReturn(Optional.of(testGroup));
        when(userRepository.findAllById(any())).thenReturn(List.of(user1, user2));
        when(strategyFactory.get(mode)).thenReturn(mockStrategy);
        when(mockStrategy.computeAmounts(anyList(), any())).thenReturn(List.of(new BigDecimal("60.00"), new BigDecimal("40.00")));

        TransactionCreateDto dto = createBaseDto(mode);
        dto.setPaidBy(List.of(split(1L, "60"), split(2L, "40")));
        dto.setSplitBetween(List.of(split(1L, "60"), split(2L, "40")));

        when(transactionMapper.toEntity(dto)).thenReturn(new Transaction());
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(transactionMapper.toDto(any())).thenReturn(new TransactionDto());

        transactionService.createTransaction(dto, null);

        verify(transactionRepository).save(transactionCaptor.capture());
        Transaction saved = transactionCaptor.getValue();

        assertItem(saved, 1L, "60.00", "60", true);
        assertItem(saved, 2L, "-40.00", "40", false);
        verify(settlementEngine).calculateDebts(G_ID);
    }

    @Test
    void createTransaction_groupNotFound_throws() {
        TransactionCreateDto dto = createBaseDto(TransactionSplitMode.FIXED);
        when(groupRepository.findById(anyLong())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.createTransaction(dto, null))
                .isInstanceOf(GroupNotFoundException.class);
    }

    @Test
    void createTransaction_currencyMismatch_throwsBadRequest() {
        testGroup.setDefaultCurrency(Currency.EUR);
        when(groupRepository.findById(G_ID)).thenReturn(Optional.of(testGroup));

        TransactionCreateDto dto = createBaseDto(TransactionSplitMode.FIXED);
        dto.setCurrency(Currency.CZK);

        assertThatThrownBy(() -> transactionService.createTransaction(dto, null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createTransaction_emptySplits_throwsBadRequest() {
        when(groupRepository.findById(G_ID)).thenReturn(Optional.of(testGroup));

        TransactionCreateDto dto = createBaseDto(TransactionSplitMode.FIXED);
        dto.setPaidBy(List.of());
        dto.setSplitBetween(List.of());

        assertThatThrownBy(() -> transactionService.createTransaction(dto, null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createTransaction_unsupportedSplitMode_throwsBadRequest() {
        when(groupRepository.findById(G_ID)).thenReturn(Optional.of(testGroup));

        TransactionCreateDto dto = createBaseDto(null);
        dto.setPaidBy(List.of(split(1L, "60"), split(2L, "40")));
        dto.setSplitBetween(List.of(split(1L, "60"), split(2L, "40")));

        assertThatThrownBy(() -> transactionService.createTransaction(dto, null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void createTransaction_userInSplitsNotFound_throws() {
        when(groupRepository.findById(G_ID)).thenReturn(Optional.of(testGroup));
        when(userRepository.findAllById(any())).thenReturn(List.of(user1)); // missing user 2

        TransactionCreateDto dto = createBaseDto(TransactionSplitMode.FIXED);
        dto.setPaidBy(List.of(split(1L, "60"), split(2L, "40")));
        dto.setSplitBetween(List.of(split(1L, "60"), split(2L, "40")));

        assertThatThrownBy(() -> transactionService.createTransaction(dto, null))
                .isInstanceOf(UserNotFoundException.class);
    }

    @Test
    void getGroupTransactions_mapsUsingMapper() {
        Transaction tx1 = new Transaction();
        Transaction tx2 = new Transaction();
        TransactionDto dto1 = new TransactionDto();
        TransactionDto dto2 = new TransactionDto();

        when(transactionRepository.findByGroupIdOrderByCreatedAtDesc(G_ID)).thenReturn(List.of(tx1, tx2));
        when(transactionMapper.toDto(tx1)).thenReturn(dto1);
        when(transactionMapper.toDto(tx2)).thenReturn(dto2);

        List<TransactionDto> result = transactionService.getGroupTransactions(G_ID);

        assertThat(result).containsExactly(dto1, dto2);
        verify(transactionRepository).findByGroupIdOrderByCreatedAtDesc(G_ID);
        verify(transactionMapper).toDto(tx1);
        verify(transactionMapper).toDto(tx2);
        verifyNoInteractions(settlementEngine);
    }

    @Test
    void getTransactionById_happyPath_returnsMappedDto() {
        long txId = 10L;
        Transaction tx = new Transaction();
        TransactionDto dto = new TransactionDto();
        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(transactionMapper.toDto(tx)).thenReturn(dto);

        TransactionDto result = transactionService.getTransactionById(txId);

        assertThat(result).isSameAs(dto);
        verify(transactionRepository).findById(txId);
        verify(transactionMapper).toDto(tx);
        verifyNoInteractions(settlementEngine);
    }

    @Test
    void getTransactionById_notFound_throws() {
        long txId = 404L;
        when(transactionRepository.findById(txId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.getTransactionById(txId))
                .isInstanceOf(TransactionNotFoundException.class);

        verify(transactionRepository).findById(txId);
        verify(transactionMapper, never()).toDto(any(Transaction.class));
        verifyNoInteractions(settlementEngine);
    }

    @Test
    void updateTransaction_notFound_throws() {
        long txId = 999L;
        when(transactionRepository.findById(txId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.updateTransaction(txId, createBaseDto(TransactionSplitMode.FIXED)))
                .isInstanceOf(TransactionNotFoundException.class);

        verify(transactionRepository).findById(txId);
        verify(transactionRepository, never()).save(any());
        verifyNoInteractions(settlementEngine);
    }

    @Test
    void updateTransaction_happyPath_updatesFieldsAndTriggersSideEffects() {
        Long txId = 10L;
        Group spyGroup = spy(testGroup);
        Transaction existing = new Transaction();
        existing.setId(txId);
        existing.setGroup(spyGroup);
        existing.setItems(new ArrayList<>(List.of(createItem(999L, "1.00", true))));

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(existing));
        when(userRepository.findAllById(any())).thenReturn(List.of(user1, user2));
        when(strategyFactory.get(TransactionSplitMode.FIXED)).thenReturn(mockStrategy);
        when(mockStrategy.computeAmounts(anyList(), any()))
                .thenReturn(List.of(new BigDecimal("60.00"), new BigDecimal("40.00")))
                .thenReturn(List.of(new BigDecimal("50.00"), new BigDecimal("50.00")));
        when(transactionRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(transactionMapper.toDto(any())).thenReturn(new TransactionDto());

        TransactionCreateDto updateDto = createBaseDto(TransactionSplitMode.FIXED);
        updateDto.setTitle("Updated title");
        updateDto.setExpenseCategory(ExpenseCategory.COFFEE);
        updateDto.setPaidBy(List.of(split(1L, "60"), split(2L, "40")));
        updateDto.setSplitBetween(List.of(split(1L, "50"), split(2L, "50")));

        transactionService.updateTransaction(txId, updateDto);

        verify(transactionRepository).save(transactionCaptor.capture());
        Transaction saved = transactionCaptor.getValue();

        assertThat(saved.getTitle()).isEqualTo("Updated title");
        assertThat(saved.getExpenseCategory()).isEqualTo(ExpenseCategory.COFFEE);
        assertThat(saved.getItems()).hasSize(4);
        assertThat(saved.getItems()).noneMatch(i -> i.getUser().getId().equals(999L));

        assertItem(saved, 1L, "60.00", "60", true);
        assertItem(saved, 2L, "40.00", "40", true);
        assertItem(saved, 1L, "-50.00", "50", false);
        assertItem(saved, 2L, "-50.00", "50", false);

        verify(settlementEngine).calculateDebts(G_ID);
        verify(spyGroup).updateLastActivity();
    }

    @Test
    void deleteTransaction_notFound_throws() {
        long txId = 123L;
        when(transactionRepository.findById(txId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.deleteTransaction(txId))
                .isInstanceOf(TransactionNotFoundException.class);

        verify(transactionRepository).findById(txId);
        verify(transactionRepository, never()).delete(any());
        verifyNoInteractions(settlementEngine);
    }

    @Test
    void deleteTransaction_happyPath_deletesAndTriggersSideEffects() {
        long txId = 10L;
        Group spyGroup = spy(testGroup);
        Transaction tx = new Transaction();
        tx.setId(txId);
        tx.setGroup(spyGroup);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));

        transactionService.deleteTransaction(txId);

        verify(transactionRepository).delete(tx);
        verify(spyGroup).updateLastActivity();
        verify(settlementEngine).calculateDebts(G_ID);
    }

    private void assertItem(Transaction tx, Long userId, String balance, String filled, boolean isPositive) {
        TransactionItem item = tx.getItems().stream()
                .filter(i -> i.getUser().getId().equals(userId) && (isPositive ? i.getBalanceChange().signum() > 0 : i.getBalanceChange().signum() < 0))
                .findFirst()
                .orElseThrow();

        assertThat(item.getBalanceChange()).isEqualByComparingTo(balance);
        assertThat(item.getFilledValue()).isEqualByComparingTo(filled);
    }

    private TransactionCreateDto createBaseDto(TransactionSplitMode mode) {
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setGroupId(G_ID);
        dto.setTotalAmount(new BigDecimal("100.00"));
        dto.setCurrency(Currency.CZK);
        dto.setPaidByMode(mode);
        dto.setSplitBetweenMode(mode);
        return dto;
    }

    private User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private TransactionSplitCreateDto split(Long userId, String val) {
        TransactionSplitCreateDto s = new TransactionSplitCreateDto();
        s.setUserId(userId);
        s.setFilledValue(new BigDecimal(val));
        return s;
    }

    private TransactionItem createItem(Long userId, String balance, boolean isPositive) {
        TransactionItem item = new TransactionItem();
        item.setUser(user(userId));
        item.setBalanceChange(new BigDecimal(isPositive ? balance : "-" + balance));
        return item;
    }
}

