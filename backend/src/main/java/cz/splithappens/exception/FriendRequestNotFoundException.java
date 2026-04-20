package cz.splithappens.exception;

public class FriendRequestNotFoundException extends NotFoundException {
    public FriendRequestNotFoundException(Long id) {
        super("FRIEND_REQUEST_NOT_FOUND", "Friend request not found" + (id != null ? ": " + id : ""));
    }
}

