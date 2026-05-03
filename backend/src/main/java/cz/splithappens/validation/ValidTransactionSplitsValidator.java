package cz.splithappens.validation;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.model.enums.TransactionSplitMode;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;
import java.util.List;

public class ValidTransactionSplitsValidator implements ConstraintValidator<ValidTransactionSplits, TransactionCreateDto> {
    @Override
    public boolean isValid(TransactionCreateDto value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        boolean ok = true;
        context.disableDefaultConstraintViolation();

        ok &= validateSplitList("paidBy", value.getPaidByMode(), value.getPaidBy(), value.getTotalAmount(), context);
        ok &= validateSplitList("splitBetween", value.getSplitBetweenMode(), value.getSplitBetween(), value.getTotalAmount(), context);

        return ok;
    }

    private boolean validateSplitList(
            String fieldName,
            TransactionSplitMode mode,
            List<TransactionSplitCreateDto> splits,
            BigDecimal totalAmount,
            ConstraintValidatorContext context
    ) {
        if (splits == null || splits.isEmpty()) {
            return true;
        }

        if (mode == null) {
            addViolation(context, fieldName, "Split mode must be provided");
            return false;
        }

        BigDecimal fixedSum = BigDecimal.ZERO;
        int percentageSum = 0;

        for (int i = 0; i < splits.size(); i++) {
            TransactionSplitCreateDto split = splits.get(i);
            if (split == null) {
                addViolation(context, fieldName, "Split item must not be null");
                return false;
            }

            BigDecimal filled = split.getFilledValue();
            if (filled == null) {
                addViolation(context, fieldName + "[" + i + "]", "filledValue must be provided");
                return false;
            }

            if (filled.compareTo(BigDecimal.ZERO) <= 0) {
                addViolation(context, fieldName + "[" + i + "]", "filledValue must be > 0");
                return false;
            }

            if (mode == TransactionSplitMode.FIXED) {
                fixedSum = fixedSum.add(filled);
            } else if (mode == TransactionSplitMode.PERCENTAGE) {
                percentageSum += filled.intValue();
            }
        }

        if (mode == TransactionSplitMode.FIXED) {
            if (totalAmount == null) {
                return true;
            }
            if (fixedSum.compareTo(totalAmount) != 0) {
                addViolation(context, fieldName, "Sum of fixed amounts in " + fieldName + " must equal totalAmount");
                return false;
            }
        }

        if (mode == TransactionSplitMode.PERCENTAGE) {
            if (percentageSum != 100) {
                addViolation(context, fieldName, "Sum of percentage values in " + fieldName + " must be 100");
                return false;
            }
        }

        return true;
    }


    private void addViolation(ConstraintValidatorContext context, String property, String message) {
        context.buildConstraintViolationWithTemplate(message)
                .addPropertyNode(property)
                .addConstraintViolation();
    }
}

