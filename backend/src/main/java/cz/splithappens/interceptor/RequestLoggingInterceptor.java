package cz.splithappens.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class RequestLoggingInterceptor implements HandlerInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(RequestLoggingInterceptor.class);

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                             @NonNull Object handler) throws Exception {
        String params = request.getParameterMap().entrySet().stream()
                .map(entry -> entry.getKey() + "="
                        + maskSensitiveParam(entry.getKey(), entry.getValue()))
                .collect(Collectors.joining("&"));
        logger.info("Incoming request - Method: {}, URI: {}, Parameters: {}",
                request.getMethod(), request.getRequestURI(), params);
        return true;
    }

    private String maskSensitiveParam(String key, String[] values) {
        List<String> sensitiveParams = Arrays.asList("password", "token", "secret");
        if (sensitiveParams.contains(key.toLowerCase())) {
            return "*****";
        }
        return String.join(",", values);
    }
}
