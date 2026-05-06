package cz.splithappens.event;

import cz.splithappens.model.Group;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.User;

public record DebtSettledEvent(Group group, Transaction payment, User settler, User debtor, User creditor) {
}
