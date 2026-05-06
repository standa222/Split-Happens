package cz.splithappens.event;

import cz.splithappens.model.User;

public record ReceivedFriendRequestEvent(User frSender, User frReceiver) {
}
