package cz.splithappens.exception;

public class FriendRequestForbiddenException extends ForbiddenException {
    public FriendRequestForbiddenException(Long id) {
        super("FRIEND_REQUEST_FORBIDDEN", "Not allowed to update friend request" + (id != null ? ": " + id : ""));
    }
}

