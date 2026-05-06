package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PercentageSplitComputationStrategyTest {

    private final PercentageSplitComputationStrategy strategy = new PercentageSplitComputationStrategy();

    @Test
    void computeAmounts_returnsRoundedAmounts_whenSumIs100() {
        // total=10.00, 33% + 67% -> 3.30 and 6.70 (scale=2)
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "33"),
                split(2L, "67")
        );

        List<BigDecimal> result = strategy.computeAmounts(splits, new BigDecimal("10.00"));

        assertThat(result)
                .extracting(BigDecimal::toPlainString)
                .containsExactly("3.30", "6.70");
    }

    @Test
    void computeAmounts_throws_whenPercentageSumIsNot100() {
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "60"),
                split(2L, "30")
        );

        assertThatThrownBy(() -> strategy.computeAmounts(splits, new BigDecimal("100.00")))
                .isInstanceOf(BadRequestException.class);
    }

    private static TransactionSplitCreateDto split(Long userId, String filledValue) {
        TransactionSplitCreateDto dto = new TransactionSplitCreateDto();
        dto.setUserId(userId);
        dto.setFilledValue(new BigDecimal(filledValue));
        return dto;
    }
}

