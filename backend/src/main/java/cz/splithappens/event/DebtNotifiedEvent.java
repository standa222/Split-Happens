package cz.splithappens.event;

import cz.splithappens.model.Debt;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;

public record DebtNotifiedEvent(Debt debt, Group group, User actor) {
}
