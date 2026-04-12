package cz.splithappens.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(name = "LoginRequest", description = "Login payload.")
public class LoginRequestDto {
    @NotBlank
    @Email
    @Schema(description = "User email.", example = "jan.novak@example.com")
    private String email;

    @NotBlank
    @Schema(description = "User password.")
    private String password;
}
