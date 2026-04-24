package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.exception.BadRequestException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public class PercentageSplitComputationStrategy implements SplitComputationStrategy {
    @Override
    public List<BigDecimal> computeAmounts(List<TransactionSplitCreateDto> splits, BigDecimal totalAmount) {
        int percentageSum = splits.stream()
                .map(TransactionSplitCreateDto::getFilledValue)
                .mapToInt(BigDecimal::intValue)
                .sum();

        if (percentageSum != 100) {
            throw new BadRequestException("INVALID_PERCENTAGE_SPLIT", "Sum of percentage values must be 100");
        }

        return splits.stream()
                .map(split -> totalAmount
                        .multiply(split.getFilledValue())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP))
                .toList();
    }
}

