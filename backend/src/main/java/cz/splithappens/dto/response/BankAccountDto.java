package cz.splithappens.dto.response;

import lombok.Data;

@Data
public class BankAccountDto {
    private Long id;
    private String prefix;
    private String accountNumber;
    private String bankCode;
}
