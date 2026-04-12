package cz.splithappens.validation;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionSplitCreateDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

public class ValidTransactionSplitsValidator implements ConstraintValidator<ValidTransactionSplits, TransactionCreateDto> {

    private enum Mode {
        FIXED, PARTIAL, PERCENTAGE
    }

    @Override
    public boolean isValid(TransactionCreateDto value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        boolean ok = true;
        context.disableDefaultConstraintViolation();

        ok &= validateSplitList("paidBy", value.getPaidBy(), value.getTotalAmount(), context);
        ok &= validateSplitList("splitBetween", value.getSplitBetween(), value.getTotalAmount(), context);

        return ok;
    }

    private boolean validateSplitList(
            String fieldName,
            List<TransactionSplitCreateDto> splits,
            BigDecimal totalAmount,
            ConstraintValidatorContext context
    ) {
        if (splits == null || splits.isEmpty()) {
            // Let @NotEmpty / @NotNull handle this if present; otherwise accept.
            return true;
        }

        Mode mode = null;
        BigDecimal fixedSum = BigDecimal.ZERO;
        int percentageSum = 0;

        for (int i = 0; i < splits.size(); i++) {
            TransactionSplitCreateDto split = splits.get(i);
            if (split == null) {
                addViolation(context, fieldName, "Split item must not be null");
                return false;
            }

            Mode splitMode = detectMode(split);
            if (splitMode == null) {
                // ExactlyOneSplitMode validator should catch this; add fallback.
                addViolation(context, fieldName + "[" + i + "]", "Exactly one of fixed, partial or percentage must be provided");
                return false;
            }

            if (mode == null) {
                mode = splitMode;
            } else if (mode != splitMode) {
                addViolation(context, fieldName, "All splits in " + fieldName + " must use the same mode (fixed, partial or percentage)");
                return false;
            }

            if (splitMode == Mode.FIXED) {
                fixedSum = fixedSum.add(Objects.requireNonNull(split.getFixed()));
            } else if (splitMode == Mode.PERCENTAGE) {
                percentageSum += Objects.requireNonNull(split.getPercentage());
            }
        }

        if (mode == Mode.FIXED) {
            if (totalAmount == null) {
                // @NotNull should handle; we keep it valid here.
                return true;
            }
            if (fixedSum.compareTo(totalAmount) != 0) {
                addViolation(context, fieldName, "Sum of fixed amounts in " + fieldName + " must equal totalAmount");
                return false;
            }
        }

        if (mode == Mode.PERCENTAGE) {
            if (percentageSum != 100) {
                addViolation(context, fieldName, "Sum of percentage values in " + fieldName + " must be 100");
                return false;
            }
        }

        return true;
    }

    private Mode detectMode(TransactionSplitCreateDto split) {
        if (split.getFixed() != null) return Mode.FIXED;
        if (split.getPartial() != null) return Mode.PARTIAL;
        if (split.getPercentage() != null) return Mode.PERCENTAGE;
        return null;
    }

    private void addViolation(ConstraintValidatorContext context, String property, String message) {
        context.buildConstraintViolationWithTemplate(message)
                // Best-effort: propertyNode supports simple paths; for indexed paths we keep message only.
                .addPropertyNode(property)
                .addConstraintViolation();
    }
}

