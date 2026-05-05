package cz.splithappens.service;

import cz.splithappens.dto.response.NotificationDto;
import cz.splithappens.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<NotificationDto> getMyNotifications(User currentUser, Pageable pageable);

    Integer getMyUnreadCount(User currentUser);
}

