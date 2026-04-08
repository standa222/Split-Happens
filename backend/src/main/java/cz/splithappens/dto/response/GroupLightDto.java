package cz.splithappens.dto.response;

import cz.splithappens.model.enums.Currency;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Schema(name = "GroupLight", description = "Lightweight group representation for group listings.")
public class GroupLightDto {
    @Schema(description = "Group identifier.", example = "5")
    private Long id;

    @Schema(description = "Group name.", example = "Ski trip")
    private String name;

    @Schema(description = "Default currency used by the group.", example = "CZK")
    private Currency defaultCurrency;

    @Schema(description = "Current user's debts summary for this group.")
    private List<DebtDto> userDebts;

    @Schema(description = "Timestamp of the last activity in the group.", example = "2026-04-08T12:34:56+02:00")
    private OffsetDateTime lastActivity;
}
