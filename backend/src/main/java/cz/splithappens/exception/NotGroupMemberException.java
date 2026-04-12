package cz.splithappens.exception;

public class NotGroupMemberException extends ForbiddenException {
    public NotGroupMemberException(Long groupId) {
        super("NOT_GROUP_MEMBER", "User is not a member of the group" + (groupId != null ? ": " + groupId : ""));
    }
}

