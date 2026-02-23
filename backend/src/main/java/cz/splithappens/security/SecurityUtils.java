package cz.splithappens.security;

import cz.splithappens.model.User;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    public static User getCurrentUser() {
        final CustomUserDetails ud = getCurrentUserDetails();
        if (ud != null)
            return ud.getCustomer();
        return null;
    }

    public static CustomUserDetails getCurrentUserDetails() {
        final SecurityContext context = SecurityContextHolder.getContext();
        if (context.getAuthentication() != null && context.getAuthentication().getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) context.getAuthentication().getPrincipal();
        } else {
            return null;
        }
    }
}
