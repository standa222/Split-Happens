package cz.splithappens.dto.request;

import cz.splithappens.validation.ExactlyOneSplitMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
@ExactlyOneSplitMode
@Schema(name = "TransactionSplitCreate", description = "Split definition for a transaction. Exactly one of fixed, partial or percentage must be provided.")
public class TransactionSplitCreateDto {
    @NotNull
    @Schema(description = "User id this split applies to.", example = "42")
    private Long userId;

    @Positive
    @Schema(description = "Fixed amount for this user in transaction currency.", example = "100.00", nullable = true)
    private BigDecimal fixed;

    @Positive
    @Schema(description = "Partial units (relative weights) for this user.", example = "1", nullable = true)
    private Integer partial;

    @Min(1)
    @Max(100)
    @Schema(description = "Percentage share for this user.", example = "25", nullable = true)
    private Integer percentage;
}
