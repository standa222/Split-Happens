package cz.splithappens.service.impl;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.mapper.TransactionMapper;
import cz.splithappens.model.Group;
import cz.splithappens.model.Transaction;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.service.TransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    private final GroupRepository groupRepository;
    private final TransactionMapper transactionMapper;

    @Override
    @Transactional
    public TransactionDto createTransaction(TransactionCreateDto createDto) {
        Group group = groupRepository.findById(createDto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception

        Transaction transaction = transactionMapper.toEntity(createDto);
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
        transaction.setItems(updateDto.getItems().stream()
                .map(transactionMapper::toItemEntity)
                .toList());
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
}
