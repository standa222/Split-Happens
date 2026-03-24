package cz.splithappens.dto.response;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionItemDto {
    private Long id;
    private UserDto user;
    private BigDecimal balanceChange; // Positive for payers, negative for participants
    private BigDecimal defaultCurrencyBalanceChange; // Balance change converted to group's default currency, used for easier balance calculations
}
