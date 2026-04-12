package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "BankAccount", description = "User's bank account details.")
public class BankAccountDto {
    @Schema(description = "Bank account identifier.", example = "1")
    private Long id;

    @Schema(description = "Optional account prefix (Czech format).", example = "19", nullable = true)
    private String prefix;

    @Schema(description = "Bank account number (without prefix).", example = "1234567890")
    private String accountNumber;

    @Schema(description = "Bank code.", example = "0800")
    private String bankCode;
}
