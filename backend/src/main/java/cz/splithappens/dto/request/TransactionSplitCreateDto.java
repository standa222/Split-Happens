package cz.splithappens.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(name = "TransactionSplitCreate", description = "Split definition for a transaction. Mode is provided on the parent TransactionCreate DTO; this object only carries a userId and user-entered value.")
public class TransactionSplitCreateDto {
    @NotNull
    @Schema(description = "User id this split applies to.", example = "42")
    private Long userId;

    @NotNull
    @Schema(description = "User-entered value for the selected mode (fixed / percentage / partial).", example = "100.00")
    private BigDecimal filledValue;
}
