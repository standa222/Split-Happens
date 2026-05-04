package cz.splithappens.exception;

public class AdminOnlyException extends ForbiddenException {
    public AdminOnlyException() {
        super("ADMIN_ONLY", "This endpoint is available to admin users only");
    }
}

