package cz.splithappens.exception;

public class GroupNotFoundException extends NotFoundException {
    public GroupNotFoundException(Long groupId) {
        super("GROUP_NOT_FOUND", "Group not found" + (groupId != null ? ": " + groupId : ""));
    }
}

