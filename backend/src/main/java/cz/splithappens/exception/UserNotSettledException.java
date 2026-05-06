package cz.splithappens.exception;

public class UserNotSettledException extends ConflictException {
    public UserNotSettledException(Long userId) {
        super("USER_NOT_SETTLED", "User with existing debts cannot be deleted: " + userId);
    }
}
