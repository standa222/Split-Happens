package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "User", description = "User representation returned by the API.")
public class UserDto {
    @Schema(description = "User identifier.", example = "42")
    private Long id;

    @Schema(description = "First name.", example = "Jan")
    private String firstName;

    @Schema(description = "Last name.", example = "Novák")
    private String lastName;

    @Schema(description = "Email address.", example = "jan.novak@example.com")
    private String email;

    @Schema(description = "User's bank account details (may be null if not provided).", nullable = true)
    private BankAccountDto bankAccount;
}
