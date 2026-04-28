package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.exception.BadRequestException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PartialSplitComputationStrategyTest {

    private final PartialSplitComputationStrategy strategy = new PartialSplitComputationStrategy();

    @Test
    void computeAmounts_splitsByParts_andLastGetsRemainder() {
        // total=100.00 parts=1,2,1 => 25.00, 50.00, 25.00
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "1"),
                split(2L, "2"),
                split(3L, "1")
        );

        List<BigDecimal> result = strategy.computeAmounts(splits, new BigDecimal("100.00"));

        assertThat(result)
                .extracting(BigDecimal::toPlainString)
                .containsExactly("25.00", "50.00", "25.00");

        // sum must match exactly due to remainder assigned to last
        BigDecimal sum = result.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(sum).isEqualByComparingTo("100.00");
    }

    @Test
    void computeAmounts_roundsFirstN_minus1_andLastGetsExactRemainder() {
        // total=10.00 parts=1,1,1 => amounts: 3.33, 3.33, 3.34
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "1"),
                split(2L, "1"),
                split(3L, "1")
        );

        List<BigDecimal> result = strategy.computeAmounts(splits, new BigDecimal("10.00"));

        assertThat(result)
                .extracting(BigDecimal::toPlainString)
                .containsExactly("3.33", "3.33", "3.34");

        BigDecimal sum = result.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        assertThat(sum).isEqualByComparingTo("10.00");
    }

    @Test
    void computeAmounts_throws_whenTotalPartsIsZeroOrNegative() {
        List<TransactionSplitCreateDto> splits = List.of(
                split(1L, "0"),
                split(2L, "0")
        );

        assertThatThrownBy(() -> strategy.computeAmounts(splits, new BigDecimal("10.00")))
                .isInstanceOf(BadRequestException.class);
    }

    private static TransactionSplitCreateDto split(Long userId, String filledValue) {
        TransactionSplitCreateDto dto = new TransactionSplitCreateDto();
        dto.setUserId(userId);
        dto.setFilledValue(new BigDecimal(filledValue));
        return dto;
    }
}

