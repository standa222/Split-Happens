package cz.splithappens.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionItemCreateDto {
    private Long userId;
    private Long transactionId;
    private BigDecimal balanceChange; // Positive for payers, negative for participants
}
