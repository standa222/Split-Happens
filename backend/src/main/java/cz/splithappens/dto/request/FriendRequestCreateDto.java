package cz.splithappens.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(name = "FriendRequestCreate", description = "Payload for creating a friend request")
public class FriendRequestCreateDto {
    @NotNull
    @Schema(description = "User id to send the friend request to", example = "42")
    private Long receiverUserId;
}

