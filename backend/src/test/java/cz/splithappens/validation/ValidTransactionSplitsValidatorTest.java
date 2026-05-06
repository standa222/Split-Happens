package cz.splithappens.validation;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionSplitCreateDto;
import cz.splithappens.model.enums.TransactionSplitMode;
import jakarta.validation.ConstraintValidatorContext;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ValidTransactionSplitsValidatorTest {

    @InjectMocks
    private ValidTransactionSplitsValidator validator;

    @Mock
    private ConstraintValidatorContext context;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder violationBuilder;

    @Mock
    private ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext nodeBuilder;

    @Test
    void isValid_fixedModeCorrectSum_returnsTrue() {
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setTotalAmount(new BigDecimal("100.00"));
        dto.setPaidByMode(TransactionSplitMode.FIXED);
        dto.setPaidBy(List.of(
                split(new BigDecimal("60.00")),
                split(new BigDecimal("40.00"))
        ));
        dto.setSplitBetweenMode(TransactionSplitMode.FIXED);
        dto.setSplitBetween(List.of(split(new BigDecimal("100.00"))));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isTrue();
    }

    @Test
    void isValid_percentageModeCorrectSum_returnsTrue() {
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setPaidByMode(TransactionSplitMode.PERCENTAGE);
        dto.setPaidBy(List.of(
                split(new BigDecimal("50")),
                split(new BigDecimal("50"))
        ));
        dto.setSplitBetweenMode(TransactionSplitMode.PERCENTAGE);
        dto.setSplitBetween(List.of(split(new BigDecimal("100"))));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isTrue();
    }

    @Test
    void isValid_fixedSumMismatch_returnsFalseAndAddsViolation() {
        setupViolationMocks();
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setTotalAmount(new BigDecimal("100.00"));
        dto.setPaidByMode(TransactionSplitMode.FIXED);
        dto.setPaidBy(List.of(split(new BigDecimal("50.00"))));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isFalse();
        verify(context).buildConstraintViolationWithTemplate("Sum of fixed amounts in paidBy must equal totalAmount");
    }

    @Test
    void isValid_percentageSumWrong_returnsFalse() {
        setupViolationMocks();
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setPaidByMode(TransactionSplitMode.PERCENTAGE);
        dto.setPaidBy(List.of(split(new BigDecimal("99"))));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isFalse();
        verify(context).buildConstraintViolationWithTemplate("Sum of percentage values in paidBy must be 100");
    }

    @Test
    void isValid_negativeValue_returnsFalse() {
        setupViolationMocks();
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setPaidByMode(TransactionSplitMode.FIXED);
        dto.setPaidBy(List.of(split(new BigDecimal("-10.00"))));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isFalse();
        verify(context).buildConstraintViolationWithTemplate("filledValue must be > 0");
    }

    @Test
    void isValid_nullFilledValue_returnsFalse() {
        setupViolationMocks();
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setPaidByMode(TransactionSplitMode.FIXED);
        TransactionSplitCreateDto split = new TransactionSplitCreateDto();
        dto.setPaidBy(List.of(split));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isFalse();
        verify(context).buildConstraintViolationWithTemplate("filledValue must be provided");
    }

    @Test
    void isValid_nullMode_returnsFalse() {
        setupViolationMocks();
        TransactionCreateDto dto = new TransactionCreateDto();
        dto.setPaidBy(List.of(split(new BigDecimal("10.00"))));

        boolean result = validator.isValid(dto, context);

        assertThat(result).isFalse();
        verify(context).buildConstraintViolationWithTemplate("Split mode must be provided");
    }

    private static TransactionSplitCreateDto split(BigDecimal value) {
        TransactionSplitCreateDto s = new TransactionSplitCreateDto();
        s.setFilledValue(value);
        return s;
    }

    private void setupViolationMocks() {
        when(context.buildConstraintViolationWithTemplate(anyString())).thenReturn(violationBuilder);
        when(violationBuilder.addPropertyNode(anyString())).thenReturn(nodeBuilder);
    }
}
