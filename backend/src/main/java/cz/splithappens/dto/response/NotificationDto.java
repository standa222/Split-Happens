package cz.splithappens.dto.response;

import cz.splithappens.model.enums.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Map;

@Data
@Schema(name = "Notification", description = "User notification about important events in the system, such as new expenses or payments.")
public class NotificationDto {
    @Schema(description = "Notification identifier.", example = "10")
    private Long id;

    @Schema(description = "Indicates whether the notification has been read.", example = "false")
    private boolean read;

    @Schema(description = "Type of the notification, defining the message template and parameters.")
    private NotificationType notificationType;

    @Schema(description = "Parameters for the notification message template, such as creator name, group name, amount, etc.")
    private Map<String, String> messageParameters;

    @Schema(description = "Identifier of the target entity related to the notification, such as group ID.", example = "5")
    private Long targetId;
}
