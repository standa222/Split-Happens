package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import cz.splithappens.model.enums.ExpenseCategory;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregated statistics for a group")
public class GroupStatisticsDto {

    @Schema(description = "Total spending grouped by expense category (only EXPENSE transactions).")
    private List<CategorySpendingDto> spendingByCategory;

    @Schema(description = "Monthly spending trend (only EXPENSE transactions).")
    private List<MonthlySpendingDto> monthlyTrend;

    @Schema(description = "Per-user statistics in the group's default currency. Includes spending (participants only), paying (payers only), and a spending-to-paying ratio.")
    private List<UserStatsDto> userStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Aggregated spending for a single category")
    public static class CategorySpendingDto {
        private ExpenseCategory category;
        private BigDecimal total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Aggregated spending for a month")
    public static class MonthlySpendingDto {
        @Schema(description = "Month the spending belongs to", example = "2026-05")
        private YearMonth month;

        @Schema(description = "Total amount spent during the month")
        private BigDecimal total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Per-user spending and paying totals with a spending-to-paying ratio")
    public static class UserStatsDto {
        @Schema(description = "User identifier")
        private Long userId;

        @Schema(description = "Total amount spent by the user in the group's default currency (participants only; stored as positive number)")
        private BigDecimal spending;

        @Schema(description = "Total amount paid by the user in the group's default currency (payers only; stored as positive number)")
        private BigDecimal paying;

        @Schema(description = "Spending-to-paying ratio for the user (spending / paying). Null if paying is 0.")
        private Double spendingToPayingRatio;
    }
}


