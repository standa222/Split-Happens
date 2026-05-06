package cz.splithappens.service;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.model.User;

import java.util.List;

public interface TransactionService {
    TransactionDto createTransaction(TransactionCreateDto createDto, User user);
    List<TransactionDto> getGroupTransactions(Long groupId);
    TransactionDto getTransactionById(Long transactionId);
    TransactionDto updateTransaction(Long transactionId, TransactionCreateDto updateDto);
    void deleteTransaction(Long transactionId);
    void deleteGroupTransactions(Long groupId);
}

