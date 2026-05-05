package cz.splithappens.service;

import cz.splithappens.model.Notification;
import cz.splithappens.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    Page<Notification> getMyNotifications(User currentUser, Pageable pageable);

    long getMyUnreadCount(User currentUser);
}

