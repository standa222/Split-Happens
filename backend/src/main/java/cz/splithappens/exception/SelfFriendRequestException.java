package cz.splithappens.exception;

public class SelfFriendRequestException extends BadRequestException {
    public SelfFriendRequestException() {
        super("FRIEND_REQUEST_SELF", "Cannot create a friend request to self");
    }
}

