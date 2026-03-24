package cz.splithappens.dto.response;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class TransactionDto {
    private Long id;
    private String title;
    private BigDecimal totalAmount;
    private OffsetDateTime createdAt;
    private TransactionType transactionType;
    private List<TransactionItemDto> items;
    private Currency currency;
}
