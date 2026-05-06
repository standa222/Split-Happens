package cz.splithappens.mapper;

import cz.splithappens.dto.response.NotificationDto;
import cz.splithappens.model.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDto toDto(Notification notification);
}
