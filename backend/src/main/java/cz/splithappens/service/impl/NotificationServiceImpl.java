package cz.splithappens.service.impl;

import cz.splithappens.dto.response.NotificationDto;
import cz.splithappens.event.ExpenseAddedEvent;
import cz.splithappens.exception.ForbiddenException;
import cz.splithappens.exception.GroupNotFoundException;
import cz.splithappens.exception.NotFoundException;
import cz.splithappens.mapper.NotificationMapper;
import cz.splithappens.model.Group;
import cz.splithappens.model.Notification;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.NotificationType;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.NotificationRepository;
import cz.splithappens.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDto> getMyNotifications(User currentUser, Pageable pageable) {
        return notificationRepository.findByUserId(currentUser.getId(), pageable)
                .map(notificationMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getMyUnreadCount(User currentUser) {
        return notificationRepository.countByUserIdAndReadFalse(currentUser.getId());
    }

    @Override
    public void markAllAsRead(User currentUser) {
        List<Notification> notifications = notificationRepository.findByUserId(currentUser.getId(), Pageable.unpaged()).getContent();
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void markAsRead(User currentUser, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("NOTIFICATION_NOT_FOUND", "Notification not found"));
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("OTHER_USER_NOTIFICATION", "Cannot mark notification as read: not owned by user");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @EventListener
    @Transactional
    public void onExpenseAdded(ExpenseAddedEvent event) {
        Group group = event.group();
        List<Notification> toSave = new ArrayList<>();

        Map<String, String> params = new HashMap<>();
        params.put("creator", event.creator().getFirstName());
        params.put("group", event.group().getName());
        params.put("amount", event.transaction().getTotalAmount().toString());

        for (User member : group.getMembers()) {
            if (member.getId().equals(event.creator().getId())) {
                continue;
            }
            toSave.add(Notification.builder()
                    .user(member)
                    .messageParameters(params)
                    .notificationType(NotificationType.EXPENSE_ADDED)
                    .targetId(event.group().getId())
                    .read(false)
                    .build());
        }

        if (!toSave.isEmpty()) {
            notificationRepository.saveAll(toSave);
        }
    }
}

