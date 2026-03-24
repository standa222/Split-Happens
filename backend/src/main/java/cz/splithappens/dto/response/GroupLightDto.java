package cz.splithappens.dto.response;

import cz.splithappens.model.enums.Currency;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class GroupLightDto {
    private Long id;
    private String name;
    private Currency defaultCurrency;
    private List<DebtDto> userDebts;
    private OffsetDateTime lastActivity;
}
