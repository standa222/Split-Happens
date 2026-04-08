package cz.splithappens.dto.request;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.PermissionMode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "GroupCreate", description = "Payload for creating a new group.")
public class GroupCreateDto {
    @NotBlank
    @Schema(description = "Group name.", example = "Ski trip")
    private String name;

    @NotNull
    @Schema(description = "Default currency used by the group.", example = "CZK")
    private Currency defaultCurrency;

    @NotNull
    @Schema(description = "Permission mode defining who can edit expenses. Possible values: SOFT, HARD.")
    private PermissionMode permissionMode;

    @NotNull
    @Schema(description = "Group type. Possible values: GROUP, FRIEND (2 members only).")
    private GroupType groupType;

    @NotEmpty
    @Schema(description = "Ids of users to be added as group members.", example = "[1,2,3]")
    private List<Long> memberIds;
}
