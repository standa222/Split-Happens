package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(name = "TransactionItem", description = "Per-user balance change entry for a transaction.")
public class TransactionItemDto {
    @Schema(description = "Transaction item identifier.", example = "1000")
    private Long id;

    @Schema(description = "User associated with this balance change.")
    private UserDto user;

    @Schema(description = "Balance change in the transaction currency (positive for payers, negative for participants).", example = "-300.00")
    private BigDecimal balanceChange; // Positive for payers, negative for participants

    @Schema(description = "Balance change converted to group's default currency.", example = "-300.00")
    private BigDecimal defaultCurrencyBalanceChange; // Balance change converted to group's default currency, used for easier balance calculations
}
