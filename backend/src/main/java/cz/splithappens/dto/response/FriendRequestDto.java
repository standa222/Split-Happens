package cz.splithappens.dto.response;

import cz.splithappens.model.enums.FriendRequestStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Schema(name = "FriendRequest", description = "Friend request")
public class FriendRequestDto {
    private Long id;
    private UserDto sender;
    private UserDto receiver;
    private FriendRequestStatus status;
    private OffsetDateTime createdAt;
    private OffsetDateTime respondedAt;
}

