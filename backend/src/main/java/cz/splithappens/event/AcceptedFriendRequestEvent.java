package cz.splithappens.event;

import cz.splithappens.model.User;

public record AcceptedFriendRequestEvent(User frSender, User frReceiver, Long friendGroupId) {
}
