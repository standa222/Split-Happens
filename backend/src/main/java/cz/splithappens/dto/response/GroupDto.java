package cz.splithappens.dto.response;

import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.PermissionMode;
import lombok.Getter;

import java.util.List;

@Getter
public class GroupDto {
    private Long id;
    private String name;
    private String defaultCurrency;
    private PermissionMode mode;
    private GroupType type;
    private List<UserDto> members;
}
