package cz.splithappens.dto.response;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DebtDto {
    private Long id;
    private BigDecimal amount;
    private UserDto debtor;
    private UserDto creditor;
}
