package cz.splithappens.exception;

public class FriendAlreadyExistsException extends ConflictException {
    public FriendAlreadyExistsException(Long friendId) {
        super("ALREADY_FRIENDS", "Users are already friends" + (friendId != null ? ": " + friendId : ""));
    }
}

