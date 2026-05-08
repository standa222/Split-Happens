package cz.splithappens.service.impl;

import cz.splithappens.dto.response.NotificationDto;
import cz.splithappens.event.*;
import cz.splithappens.exception.ForbiddenException;
import cz.splithappens.exception.NotFoundException;
import cz.splithappens.mapper.NotificationMapper;
import cz.splithappens.model.Group;
import cz.splithappens.model.Notification;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.NotificationType;
import cz.splithappens.repository.NotificationRepository;
import cz.splithappens.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

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

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onExpenseAdded(ExpenseAddedEvent event) {
        Group group = event.group();
        List<Notification> toSave = new ArrayList<>();

        Map<String, String> params = new HashMap<>();
        params.put("creator", event.creator().getFirstName());
        params.put("group", event.group().getName());
        params.put("amount", event.transaction().getTotalAmount().toString());
        params.put("currency", event.transaction().getCurrency().toString());
        boolean isFriendGroup = event.group().getGroupType() == GroupType.FRIEND;

        for (User member : group.getMembers()) {
            if (member.getId().equals(event.creator().getId())) {
                continue;
            }
            toSave.add(Notification.builder()
                    .user(member)
                    .messageParameters(params)
                    .notificationType(isFriendGroup ? NotificationType.EXPENSE_ADDED_FRIEND : NotificationType.EXPENSE_ADDED)
                    .targetId(event.group().getId())
                    .read(false)
                    .build());
        }

        if (!toSave.isEmpty()) {
            notificationRepository.saveAll(toSave);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onDebtSettled(DebtSettledEvent event) {
        List<Notification> toSave = new ArrayList<>();

        Map<String, String> params = new HashMap<>();
        params.put("settler", event.settler().getFirstName());
        params.put("debtor", event.debtor().getFirstName());
        params.put("creditor", event.creditor().getFirstName());
        params.put("group", event.group().getName());
        params.put("amount", event.payment().getTotalAmount().toString());
        params.put("currency", event.payment().getCurrency().toString());
        boolean isFriendGroup = event.group().getGroupType() == GroupType.FRIEND;

        if (!event.settler().getId().equals(event.debtor().getId())) {
            toSave.add(Notification.builder()
                    .user(event.debtor())
                    .messageParameters(params)
                    .notificationType(isFriendGroup ? NotificationType.DEBT_SETTLED_FRIEND : NotificationType.DEBT_SETTLED)
                    .targetId(event.group().getId())
                    .build());
        }

        if (!event.settler().getId().equals(event.creditor().getId())) {
            toSave.add(Notification.builder()
                    .user(event.creditor())
                    .messageParameters(params)
                    .notificationType(NotificationType.DEBT_SETTLED)
                    .targetId(event.group().getId())
                    .build());
        }

        if (!toSave.isEmpty()) {
            notificationRepository.saveAll(toSave);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onAddedToGroup(AddedToGroupEvent event) {
        List<Notification> toSave = new ArrayList<>();

        Map<String, String> params = new HashMap<>();
        params.put("adder", event.addedBy().getFirstName());
        params.put("group", event.group().getName());

        for (User addedUser : event.addedUsers()) {
            if (addedUser.getId().equals(event.addedBy().getId())) {
                continue;
            }
            toSave.add(Notification.builder()
                    .user(addedUser)
                    .messageParameters(params)
                    .notificationType(NotificationType.ADDED_TO_GROUP)
                    .targetId(event.group().getId())
                    .build());
        }

        if (!toSave.isEmpty()) {
            notificationRepository.saveAll(toSave);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onReceivedFriendRequest(ReceivedFriendRequestEvent event) {
        Map<String, String> params = new HashMap<>();
        params.put("from", event.frSender().getFirstName());

        Notification notification = Notification.builder()
                .user(event.frReceiver())
                .messageParameters(params)
                .notificationType(NotificationType.RECEIVED_FRIEND_REQUEST)
                .build();

        notificationRepository.save(notification);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onAcceptedFriendRequest(AcceptedFriendRequestEvent event) {
        Map<String, String> params = new HashMap<>();
        params.put("from", event.frReceiver().getFirstName());

        Notification notification = Notification.builder()
                .user(event.frSender())
                .messageParameters(params)
                .notificationType(NotificationType.ACCEPTED_FRIEND_REQUEST)
                .targetId(event.friendGroupId())
                .build();

        notificationRepository.save(notification);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onRejectedFriendRequest(RejectedFriendRequestEvent event) {
        Map<String, String> params = new HashMap<>();
        params.put("from", event.frReceiver().getFirstName());

        Notification notification = Notification.builder()
                .user(event.frSender())
                .messageParameters(params)
                .notificationType(NotificationType.REJECTED_FRIEND_REQUEST)
                .build();

        notificationRepository.save(notification);
    }

    @EventListener
    public void onDebtNotified(DebtNotifiedEvent event) {
        Map<String, String> params = new HashMap<>();
        params.put("notifier", event.actor().getFirstName());
        params.put("creditor", event.debt().getCreditor().getFirstName());
        params.put("amount", event.debt().getAmount().toString());
        params.put("currency", event.debt().getGroup().getDefaultCurrency().toString());
        params.put("group", event.group().getName());
        boolean isFriendGroup = event.group().getGroupType() == GroupType.FRIEND;

        Notification notification = Notification.builder()
                .user(event.debt().getDebtor())
                .messageParameters(params)
                .notificationType(isFriendGroup ? NotificationType.DEBT_NOTIFIED_FRIEND : NotificationType.DEBT_NOTIFIED)
                .targetId(event.group().getId())
                .build();

        notificationRepository.save(notification);
    }
}

