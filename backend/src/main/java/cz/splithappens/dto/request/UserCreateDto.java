package cz.splithappens.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(name = "UserCreate", description = "Payload for user registration.")
public class UserCreateDto {
    @NotBlank
    @Schema(description = "First name.", example = "Jan")
    private String firstName;

    @NotBlank
    @Schema(description = "Last name.", example = "Novák")
    private String lastName;

    @NotBlank
    @Email
    @Schema(description = "Email address.", example = "jan.novak@example.com")
    private String email;

    @NotBlank
    @Size(min = 6, max = 255)
    @Schema(description = "Password.", minLength = 6)
    private String password;

    @Valid
    @Schema(description = "Optional bank account details.", nullable = true)
    private BankAccountCreateDto bankAccount;
}
