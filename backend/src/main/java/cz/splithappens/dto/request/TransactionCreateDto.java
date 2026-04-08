package cz.splithappens.dto.request;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.TransactionType;
import cz.splithappens.validation.ValidTransactionSplits;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@ValidTransactionSplits
@Schema(name = "TransactionCreate", description = "Create a new transaction (expense/settlement) including who paid and how it is split.")
public class TransactionCreateDto {
    @NotBlank
    @Schema(description = "Transaction title.", example = "Dinner")
    private String title;
//    private Category category; TODO categories
    @NotNull
    @Schema(description = "Group id where the transaction is created.", example = "5")
    private Long groupId;

    @NotNull
    @Positive
    @Schema(description = "Total transaction amount.", example = "1200.50")
    private BigDecimal totalAmount;

    @NotNull
    @Schema(description = "Currency of the transaction.", example = "CZK")
    private Currency currency;

    @NotNull
    @Schema(description = "Transaction type. Possible values: EXPENSE (for expenses) and PAYMENT (for settlements).")
    private TransactionType transactionType;

    @NotEmpty
    @Valid
    @Schema(description = "List of splits describing who paid. All items must use the same mode.")
    private List<TransactionSplitCreateDto> paidBy;

    @NotEmpty
    @Valid
    @Schema(description = "List of splits describing how the amount is split between users. All items must use the same mode.")
    private List<TransactionSplitCreateDto> splitBetween;
}

