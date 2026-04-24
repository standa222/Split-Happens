package cz.splithappens.strategy.transaction;

import cz.splithappens.model.enums.TransactionSplitMode;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class SplitComputationStrategyFactory {
    private final Map<TransactionSplitMode, SplitComputationStrategy> strategies = new EnumMap<>(TransactionSplitMode.class);

    public SplitComputationStrategyFactory() {
        strategies.put(TransactionSplitMode.FIXED, new FixedSplitComputationStrategy());
        strategies.put(TransactionSplitMode.PERCENTAGE, new PercentageSplitComputationStrategy());
        strategies.put(TransactionSplitMode.PARTIAL, new PartialSplitComputationStrategy());
    }

    public SplitComputationStrategy get(TransactionSplitMode mode) {
        return strategies.get(mode);
    }
}

