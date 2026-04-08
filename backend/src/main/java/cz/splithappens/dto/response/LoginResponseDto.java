package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(name = "LoginResponse", description = "Response returned after successful authentication.")
public class LoginResponseDto {
    @Schema(description = "JWT access token.", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;

    @Schema(description = "Authenticated user details.")
    private UserDto user;
}
