package cz.splithappens.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ExactlyOneSplitModeValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ExactlyOneSplitMode {
    String message() default "Exactly one of fixed, partial or percentage must be provided";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}

