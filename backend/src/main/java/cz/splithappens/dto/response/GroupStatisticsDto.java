package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import cz.splithappens.model.enums.ExpenseCategory;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregated statistics for a group")
public class GroupStatisticsDto {

    @Schema(description = "Total spending grouped by expense category (only EXPENSE transactions).")
    private List<CategorySpendingDto> spendingByCategory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Aggregated spending for a single category")
    public static class CategorySpendingDto {
        private ExpenseCategory category;
        private BigDecimal total;
    }
}


