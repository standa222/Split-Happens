package cz.splithappens.exception;

public class FriendRequestAlreadyExistsException extends ConflictException {
    public FriendRequestAlreadyExistsException(Long receiverId) {
        super("FRIEND_REQUEST_ALREADY_EXISTS", "Friend request already exists" + (receiverId != null ? " (receiverId=" + receiverId + ")" : ""));
    }
}

