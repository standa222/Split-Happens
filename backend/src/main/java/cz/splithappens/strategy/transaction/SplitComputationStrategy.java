package cz.splithappens.strategy.transaction;

import cz.splithappens.dto.request.TransactionSplitCreateDto;

import java.math.BigDecimal;
import java.util.List;

public interface SplitComputationStrategy {
    /**
     * @param splits userId + filledValue
     * @param totalAmount total amount of the transaction
     * @return computed amount per split (same order as input list)
     */
    List<BigDecimal> computeAmounts(List<TransactionSplitCreateDto> splits, BigDecimal totalAmount);
}

