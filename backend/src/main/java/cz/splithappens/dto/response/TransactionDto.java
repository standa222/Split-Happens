package cz.splithappens.dto.response;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.model.enums.TransactionType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Schema(name = "Transaction", description = "A transaction (expense or settlement) recorded in a group.")
public class TransactionDto {
    @Schema(description = "Transaction identifier.", example = "100")
    private Long id;

    @Schema(description = "Transaction title.", example = "Dinner")
    private String title;

    @Schema(description = "Total amount of the transaction in the transaction currency.", example = "1200.50")
    private BigDecimal totalAmount;

    @Schema(description = "Creation timestamp.", example = "2026-04-08T12:34:56+02:00")
    private OffsetDateTime createdAt;

    @Schema(description = "Type of the transaction. Possible values: EXPENSE (for expenses) and SETTLEMENT (for settlements).")
    private TransactionType transactionType;

    @Schema(description = "Mode used for paidBy.")
    private TransactionSplitMode paidByMode;

    @Schema(description = "Mode used for splitBetween.")
    private TransactionSplitMode splitBetweenMode;

    @Schema(description = "Per-user balance changes for this transaction.")
    private List<TransactionItemDto> items;

    @Schema(description = "Currency of the transaction.", example = "CZK")
    private Currency currency;

    @Schema(description = "Category of the expense. Only applicable for transactions of type EXPENSE.")
    private ExpenseCategory expenseCategory;
}
