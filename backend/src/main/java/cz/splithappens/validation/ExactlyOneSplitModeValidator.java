package cz.splithappens.validation;

import cz.splithappens.dto.request.TransactionSplitCreateDto;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.ArrayList;
import java.util.List;

public class ExactlyOneSplitModeValidator implements ConstraintValidator<ExactlyOneSplitMode, TransactionSplitCreateDto> {

    @Override
    public boolean isValid(TransactionSplitCreateDto value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }

        int setCount = 0;
        if (value.getFixed() != null) setCount++;
        if (value.getPartial() != null) setCount++;
        if (value.getPercentage() != null) setCount++;

        if (setCount == 1) {
            return true;
        }

        context.disableDefaultConstraintViolation();

        List<String> messages = new ArrayList<>();
        if (setCount == 0) {
            messages.add("One of fixed, partial or percentage must be provided");
        } else {
            messages.add("Only one of fixed, partial or percentage can be provided");
        }

        // Attach the violation to the object rather than an individual field.
        for (String msg : messages) {
            context.buildConstraintViolationWithTemplate(msg).addConstraintViolation();
        }

        return false;
    }
}

