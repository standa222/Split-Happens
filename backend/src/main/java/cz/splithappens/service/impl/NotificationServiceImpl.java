package cz.splithappens.service.impl;

import cz.splithappens.event.ExpenseAddedEvent;
import cz.splithappens.exception.GroupNotFoundException;
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

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getMyNotifications(User currentUser, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public long getMyUnreadCount(User currentUser) {
        return notificationRepository.countByUserIdAndReadFalse(currentUser.getId());
    }

    @EventListener
    @Transactional
    public void onExpenseAdded(ExpenseAddedEvent event) {
        Group group = event.group();
        List<Notification> toSave = new ArrayList<>();

        Map<String, String> params = new HashMap<>();
        params.put("actor", event.creator().getFirstName());
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

