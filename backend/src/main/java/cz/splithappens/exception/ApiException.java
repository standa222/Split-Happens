package cz.splithappens.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base class for application/domain exceptions that should be mapped to a specific HTTP status.
 */
@Getter
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    protected ApiException(HttpStatus status, String errorCode, String message) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }
}

