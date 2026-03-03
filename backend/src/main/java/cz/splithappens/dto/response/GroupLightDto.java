package cz.splithappens.dto.response;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class GroupLightDto {
    private Long id;
    private String name;
    private List<DebtDto> userDebts;
    private OffsetDateTime lastActivity;
}
