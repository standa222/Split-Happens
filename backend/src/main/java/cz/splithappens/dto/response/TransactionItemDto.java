package cz.splithappens.dto.response;

import java.math.BigDecimal;

public class TransactionItemDto {
    private Long id;
    private UserDto user;
    private BigDecimal balanceChange; // Positive for payers, negative for participants
}
