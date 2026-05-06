package cz.splithappens.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ProblemDetail> handleApiException(ApiException e, HttpServletRequest request) {
        // 4xx -> warn, 5xx -> error
        if (e.getStatus().is4xxClientError()) {
            logger.warn("API error: {} {} -> {} {}", request.getMethod(), request.getRequestURI(), e.getStatus(), e.getMessage());
        } else {
            logger.error("API error: {} {} -> {} {}", request.getMethod(), request.getRequestURI(), e.getStatus(), e.getMessage(), e);
        }

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(e.getStatus(), e.getMessage());
        pd.setTitle(e.getStatus().getReasonPhrase());
        pd.setProperty("errorCode", e.getErrorCode());
        pd.setProperty("timestamp", OffsetDateTime.now());
        pd.setProperty("path", request.getRequestURI());
        return ResponseEntity.status(e.getStatus()).body(pd);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleMethodArgumentNotValid(MethodArgumentNotValidException e, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        pd.setTitle("Bad Request");
        pd.setProperty("errorCode", "VALIDATION_ERROR");
        pd.setProperty("timestamp", OffsetDateTime.now());
        pd.setProperty("path", request.getRequestURI());

        List<Map<String, Object>> errors = e.getBindingResult().getFieldErrors().stream()
                .map(this::toFieldError)
                .toList();
        pd.setProperty("errors", errors);

        logger.warn("Validation error: {} {} -> {}", request.getMethod(), request.getRequestURI(), errors);
        return ResponseEntity.badRequest().body(pd);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(ConstraintViolationException e, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        pd.setTitle("Bad Request");
        pd.setProperty("errorCode", "VALIDATION_ERROR");
        pd.setProperty("timestamp", OffsetDateTime.now());
        pd.setProperty("path", request.getRequestURI());
        pd.setProperty("violations", e.getConstraintViolations().stream()
                .map(v -> Map.of(
                        "path", String.valueOf(v.getPropertyPath()),
                        "message", v.getMessage()
                ))
                .toList());

        logger.warn("Constraint violation: {} {} -> {}", request.getMethod(), request.getRequestURI(), e.getMessage());
        return ResponseEntity.badRequest().body(pd);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleException(Exception e, HttpServletRequest request) {
        logger.error("Unexpected error: {} {}", request.getMethod(), request.getRequestURI(), e);

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        pd.setTitle("Internal Server Error");
        pd.setProperty("errorCode", "INTERNAL_ERROR");
        pd.setProperty("timestamp", OffsetDateTime.now());
        pd.setProperty("path", request.getRequestURI());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(pd);
    }

    @ExceptionHandler({AccessDeniedException.class, AuthorizationDeniedException.class})
    public ResponseEntity<ProblemDetail> handleAccessDeniedException(Exception ex) throws Exception {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied");
        pd.setTitle("Forbidden");
        pd.setProperty("errorCode", "ACCESS_DENIED");
        pd.setProperty("timestamp", OffsetDateTime.now());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(pd);
    }

    private Map<String, Object> toFieldError(FieldError fe) {
        Map<String, Object> map = new HashMap<>();
        map.put("field", fe.getField());
        map.put("message", fe.getDefaultMessage());
        map.put("rejectedValue", fe.getRejectedValue());
        return map;
    }
}

