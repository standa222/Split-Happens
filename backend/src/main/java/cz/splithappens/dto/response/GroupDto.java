package cz.splithappens.dto.response;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.PermissionMode;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "Group", description = "Detailed group representation including members, debts and transactions.")
public class GroupDto {
    @Schema(description = "Group identifier.", example = "5")
    private Long id;

    @Schema(description = "Group name.", example = "Ski trip")
    private String name;

    @Schema(description = "Default currency used by the group.", example = "CZK")
    private Currency defaultCurrency;

    @Schema(description = "Permission mode defining who can add/edit expenses.")
    private PermissionMode permissionMode;

    @Schema(description = "Group type.")
    private GroupType groupType;

    @Schema(description = "List of debts within the group.")
    private List<DebtDto> debts;

    @Schema(description = "Group members.")
    private List<UserDto> members;

    @Schema(description = "Transactions (expenses/settlements) in the group.")
    private List<TransactionDto> transactions;
}
