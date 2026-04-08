package cz.splithappens.exception;

public class UserNotFoundException extends NotFoundException {
    public UserNotFoundException(Long userId) {
        super("USER_NOT_FOUND", "User not found" + (userId != null ? ": " + userId : ""));
    }

    public UserNotFoundException(String message) {
        super("USER_NOT_FOUND", message);
    }
}

