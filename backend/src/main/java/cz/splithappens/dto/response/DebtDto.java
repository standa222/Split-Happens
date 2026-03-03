package cz.splithappens.dto.response;

import lombok.Data;

@Data
public class DebtDto {
    private Long id;
    private Double amount;
    private UserDto debtor;
    private UserDto creditor;
}
