package cz.splithappens.dto.request;

import cz.splithappens.model.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TransactionCreateDto {
    private String title;
//    private Category category; TODO categories
    private Long groupId;
    private BigDecimal totalAmount;
    private String currency; // Code of the currency, e.g. "USD", "EUR"
    private TransactionType transactionType;
    private List<TransactionSplitCreateDto> paidBy;
    private List<TransactionSplitCreateDto> splitBetween;
}

