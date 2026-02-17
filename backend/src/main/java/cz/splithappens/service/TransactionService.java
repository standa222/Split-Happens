package cz.splithappens.service;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.response.TransactionDto;

import java.util.List;

public interface TransactionService {
    TransactionDto createTransaction(Long groupId, TransactionCreateDto createDto);
    List<TransactionDto> getGroupTransactions(Long groupId);
}

