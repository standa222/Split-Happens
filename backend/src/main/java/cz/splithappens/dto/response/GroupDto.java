package cz.splithappens.dto.response;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.PermissionMode;
import lombok.Data;

import java.util.List;

@Data
public class GroupDto {
    private Long id;
    private String name;
    private Currency defaultCurrency;
    private PermissionMode permissionMode;
    private GroupType groupType;
    private List<DebtDto> debts;
    private List<UserDto> members;
    private List<TransactionDto> transactions;
}
