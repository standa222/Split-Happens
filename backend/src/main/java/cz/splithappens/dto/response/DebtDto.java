package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Schema(name = "Debt", description = "Represents a debt between two users.")
public class DebtDto {
    @Schema(description = "Debt identifier.", example = "10")
    private Long id;

    @Schema(description = "Amount owed from debtor to creditor. Currency is taken from group's default currency", example = "250.00")
    private BigDecimal amount;

    @Schema(description = "User who owes the money.")
    private UserDto debtor;

    @Schema(description = "User who should receive the money.")
    private UserDto creditor;
}
