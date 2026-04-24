package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.exception.BadRequestException;

import java.math.BigDecimal;
import java.util.List;

public class FixedSplitComputationStrategy implements SplitComputationStrategy {
    @Override
    public List<BigDecimal> computeAmounts(List<TransactionSplitCreateDto> splits, BigDecimal totalAmount) {
        BigDecimal sum = splits.stream()
                .map(TransactionSplitCreateDto::getFilledValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalAmount != null && sum.compareTo(totalAmount) != 0) {
            throw new BadRequestException("INVALID_FIXED_SPLIT", "Sum of fixed amounts must equal totalAmount");
        }

        return splits.stream()
                .map(TransactionSplitCreateDto::getFilledValue)
                .toList();
    }
}

