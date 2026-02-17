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
    public TransactionDto createTransaction(Long groupId, TransactionCreateDto createDto) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception

        Transaction transaction = transactionMapper.toEntity(createDto);
        transaction.setGroup(group);

        Transaction response = transactionRepository.save(transaction);

        // TODO recalculate group balances and debts

        return transactionMapper.toDto(response);
    }

    @Override
    public List<TransactionDto> getGroupTransactions(Long groupId) {
        return transactionRepository.findByGroupId(groupId).stream()
                .map(transactionMapper::toDto)
                .toList();
    }
}
