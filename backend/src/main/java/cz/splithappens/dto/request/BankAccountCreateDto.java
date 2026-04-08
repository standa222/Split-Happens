package cz.splithappens.dto.request;

import lombok.Data;

@Data
public class BankAccountCreateDto {
    private String prefix;
    private String accountNumber;
    private String bankCode;
}
