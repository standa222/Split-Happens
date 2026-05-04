package cz.splithappens.exception;

public class GroupNotSettledException extends ConflictException {
    public GroupNotSettledException(Long groupId) {
        super("GROUP_NOT_SETTLED", "Group with existing debts cannot be deleted: " + groupId);
    }
}

