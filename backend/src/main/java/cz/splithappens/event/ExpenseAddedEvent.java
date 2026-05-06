package cz.splithappens.event;

import cz.splithappens.model.Group;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.User;

public record ExpenseAddedEvent(Group group, Transaction transaction, User creator) {
}

