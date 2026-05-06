package cz.splithappens.event;

import cz.splithappens.model.User;

public record RejectedFriendRequestEvent(User frSender, User frReceiver) {
}
