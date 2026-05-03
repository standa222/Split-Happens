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

    @Schema(description = "Total spending per user (participants only) in the group's default currency. This sums only negative transaction items for EXPENSE transactions.")
    private List<UserSpendingDto> spendingByUser;

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
    @Schema(description = "Aggregated spending for a user")
    public static class UserSpendingDto {
        @Schema(description = "User identifier")
        private Long userId;

        @Schema(description = "Total amount spent by the user in the group's default currency (sum of negative items, returned as positive value)")
        private BigDecimal total;
    }
}


