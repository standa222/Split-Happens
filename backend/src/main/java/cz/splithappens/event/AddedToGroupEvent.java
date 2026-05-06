package cz.splithappens.event;

import cz.splithappens.model.Group;
import cz.splithappens.model.User;

import java.util.List;

public record AddedToGroupEvent(Group group, User addedBy, List<User> addedUsers) {
}
