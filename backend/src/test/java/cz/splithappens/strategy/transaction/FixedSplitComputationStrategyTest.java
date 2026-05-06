package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FixedSplitComputationStrategyTest {

    private final FixedSplitComputationStrategy strategy = new FixedSplitComputationStrategy();

    @Test
    void computeAmounts_returnsFilledValues_whenSumMatchesTotal() {
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "70.00"),
                split(2L, "30.00")
        );

        List<BigDecimal> result = strategy.computeAmounts(splits, new BigDecimal("100.00"));

        assertThat(result)
                .extracting(BigDecimal::toPlainString)
                .containsExactly("70.00", "30.00");
    }

    @Test
    void computeAmounts_throws_whenSumDoesNotMatchTotal() {
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "70.00"),
                split(2L, "20.00")
        );

        assertThatThrownBy(() -> strategy.computeAmounts(splits, new BigDecimal("100.00")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void computeAmounts_allowsNullTotalAmount_andReturnsFilledValues() {
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "70.00"),
                split(2L, "20.00")
        );

        List<BigDecimal> result = strategy.computeAmounts(splits, null);

        assertThat(result)
                .extracting(BigDecimal::toPlainString)
                .containsExactly("70.00", "20.00");
    }

    private static TransactionSplitCreateDto split(Long userId, String filledValue) {
        TransactionSplitCreateDto dto = new TransactionSplitCreateDto();
        dto.setUserId(userId);
        dto.setFilledValue(new BigDecimal(filledValue));
        return dto;
    }
}

