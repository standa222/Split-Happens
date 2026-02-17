package cz.splithappens.dto.request;

import java.math.BigDecimal;

public class TransactionItemCreateDto {
    private Long userId;
    private BigDecimal balanceChange; // Positive for payers, negative for participants
}
