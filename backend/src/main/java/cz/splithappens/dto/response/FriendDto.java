package cz.splithappens.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
@Schema(name = "Friend", description = "Accepted friend + associated FRIEND group id")
public class FriendDto {
    private UserDto user;
    private Long friendGroupId;
}

