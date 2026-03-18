package cz.splithappens.dto.request;

import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.PermissionMode;
import lombok.Data;

import java.util.List;

@Data
public class GroupCreateDto {
    private String name;
    private String defaultCurrency;
    private PermissionMode permissionMode;
    private GroupType groupType;
    private List<Long> memberIds;
}
