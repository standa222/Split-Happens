package cz.splithappens.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
@Schema(name = "BankAccountCreate", description = "Bank account details used when creating or updating a user's bank account.")
public class BankAccountCreateDto {
    @Schema(description = "Optional account prefix (Czech format).", example = "19", nullable = true)
    @Pattern(regexp = "\\d{0,6}", message = "prefix must contain up to 6 digits")
    private String prefix;

    @Schema(description = "Bank account number (without prefix).", example = "1234567890")
    @NotBlank
    @Pattern(regexp = "\\d{1,16}", message = "accountNumber must contain 1 to 16 digits")
    private String accountNumber;

    @Schema(description = "Bank code.", example = "0800")
    @NotBlank
    @Pattern(regexp = "\\d{4}", message = "bankCode must contain 4 digits")
    private String bankCode;
}
