package cz.splithappens.exception;

public class FriendRequestInvalidStateException extends ConflictException {
    public FriendRequestInvalidStateException(Long id, String state) {
        super("FRIEND_REQUEST_INVALID_STATE", "Friend request is not in a valid state" + (id != null ? ": " + id : "") + (state != null ? " (status=" + state + ")" : ""));
    }
}

