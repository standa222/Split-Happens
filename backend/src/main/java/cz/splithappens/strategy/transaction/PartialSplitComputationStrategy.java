package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.exception.BadRequestException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

public class PartialSplitComputationStrategy implements SplitComputationStrategy {
    @Override
    public List<BigDecimal> computeAmounts(List<TransactionSplitCreateDto> splits, BigDecimal totalAmount) {
        BigDecimal totalParts = splits.stream()
                .map(TransactionSplitCreateDto::getFilledValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalParts.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("INVALID_PARTIAL_SPLIT", "Total parts must be greater than 0");
        }

        return getAmounts(splits, totalAmount, totalParts);
    }

    private List<BigDecimal> getAmounts(List<TransactionSplitCreateDto> splits, BigDecimal totalAmount, BigDecimal totalParts) {
        List<BigDecimal> computedAmounts = new ArrayList<>();
        BigDecimal runningSum = BigDecimal.ZERO;

        for (int i = 0; i < splits.size() - 1; i++) {
            BigDecimal amount = totalAmount
                    .multiply(splits.get(i).getFilledValue())
                    .divide(totalParts, 2, RoundingMode.HALF_UP);

            computedAmounts.add(amount);
            runningSum = runningSum.add(amount);
        }

        BigDecimal lastAmount = totalAmount.subtract(runningSum);
        computedAmounts.add(lastAmount);
        return computedAmounts;
    }
}

