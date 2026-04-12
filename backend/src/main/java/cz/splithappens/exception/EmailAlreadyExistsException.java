package cz.splithappens.exception;

public class EmailAlreadyExistsException extends BadRequestException {
    public EmailAlreadyExistsException(String email) {
        super("EMAIL_ALREADY_EXISTS", "Email already exists" + (email != null ? ": " + email : ""));
    }
}

