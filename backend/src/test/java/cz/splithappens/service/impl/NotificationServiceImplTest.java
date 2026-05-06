package cz.splithappens.service.impl;

import cz.splithappens.event.*;
import cz.splithappens.exception.DebtNotFoundException;
import cz.splithappens.exception.ForbiddenException;
import cz.splithappens.exception.NotFoundException;
import cz.splithappens.model.Group;
import cz.splithappens.model.Notification;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.NotificationType;
import cz.splithappens.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Set;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private NotificationRepository notificationRepository;

    @InjectMocks private NotificationServiceImpl notificationService;

    private Group group;
    private User actor;
    private User member2;
    private User member3;

    @BeforeEach
    void setUp() {
        actor = user(1L, "actor@test.com");
        member2 = user(2L, "m2@test.com");
        member3 = user(3L, "m3@test.com");

        group = Group.builder()
                .id(10L)
                .name("Trip")
                .members(Set.of(actor, member2, member3))
                .build();
    }

    @Test
    void markAllAsRead_marksAllUserNotificationsAsRead() {
        Notification n1 = notification(member2);
        Notification n2 = notification(member2);
        when(notificationRepository.findByUserId(member2.getId(), Pageable.unpaged()))
                .thenReturn(new PageImpl<>(List.of(n1, n2)));

        notificationService.markAllAsRead(member2);

        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
        verify(notificationRepository).saveAll(List.of(n1, n2));
    }

    @Test
    void markAsRead_validNotification_marksAsRead() {
        Notification notification = notification(member2);
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(member2, 100L);

        assertTrue(notification.isRead());
    }

    @Test
    void markAsRead_otherUserNotification_throwsForbidden() {
        Notification notification = notification(member2);
        when(notificationRepository.findById(100L)).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markAsRead(member3, 100L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    void markAsRead_notificationNotFound_throws() {
        when(notificationRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(member2, 404L))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void onExpenseAdded_persistsNotificationForAllMembersExceptActor() {
        Transaction transaction = new Transaction();
        transaction.setTotalAmount(BigDecimal.TEN);

        notificationService.onExpenseAdded(new ExpenseAddedEvent(group, transaction, actor));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> saved = captor.getValue();
        assertThat(saved).hasSize(2);

        assertThat(saved).allSatisfy(n -> {
            assertThat(n.getNotificationType()).isEqualTo(NotificationType.EXPENSE_ADDED);
            assertThat(n.getTargetId()).isEqualTo(10L);
            assertThat(n.isRead()).isFalse();
            assertThat(n.getUser().getId()).isIn(2L, 3L);
        });

        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    void onDebtSettled_persistsNotificationForBothParties() {
        Transaction payment = new Transaction();
        payment.setTotalAmount(BigDecimal.TEN);
        notificationService.onDebtSettled(new DebtSettledEvent(group, payment, actor, member2, member3));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> saved = captor.getValue();
        assertThat(saved).hasSize(2);

        assertThat(saved).allSatisfy(n -> {
            assertThat(n.getNotificationType()).isEqualTo(NotificationType.DEBT_SETTLED);
            assertThat(n.getTargetId()).isEqualTo(10L);
            assertThat(n.isRead()).isFalse();
            assertThat(n.getUser().getId()).isIn(2L, 3L);
        });

        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    void onDebtSettled_persistsNotificationCreditorOnly() {
        Transaction payment = new Transaction();
        payment.setTotalAmount(BigDecimal.TEN);
        notificationService.onDebtSettled(new DebtSettledEvent(group, payment, member2, member2, member3));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> saved = captor.getValue();
        assertThat(saved).hasSize(1);

        assertThat(saved).allSatisfy(n -> {
            assertThat(n.getNotificationType()).isEqualTo(NotificationType.DEBT_SETTLED);
            assertThat(n.getTargetId()).isEqualTo(10L);
            assertThat(n.isRead()).isFalse();
            assertThat(n.getUser().getId()).isIn(3L);
        });

        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    void onAddedToGroup_persistsNotificationForAddedUsers() {
        notificationService.onAddedToGroup(new AddedToGroupEvent(group, actor, List.of(actor, member2, member3)));

        ArgumentCaptor<List<Notification>> captor = ArgumentCaptor.forClass(List.class);
        verify(notificationRepository).saveAll(captor.capture());

        List<Notification> saved = captor.getValue();
        assertThat(saved).hasSize(2);

        assertThat(saved).allSatisfy(n -> {
            assertThat(n.getNotificationType()).isEqualTo(NotificationType.ADDED_TO_GROUP);
            assertThat(n.getTargetId()).isEqualTo(10L);
            assertThat(n.isRead()).isFalse();
            assertThat(n.getUser().getId()).isIn(2L, 3L);
        });

        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    void onReceivedFriendRequest_persistsNotificationForReceiver() {
        notificationService.onReceivedFriendRequest(new ReceivedFriendRequestEvent(actor, member2));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();

        assertThat(saved.getNotificationType()).isEqualTo(NotificationType.RECEIVED_FRIEND_REQUEST);
        assertThat(saved.isRead()).isFalse();
        assertNull(saved.getTargetId());
        assertThat(saved.getUser().getId()).isEqualTo(2L);

        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    void onAcceptedFriendRequest_persistsNotificationForSender() {
        notificationService.onAcceptedFriendRequest(new AcceptedFriendRequestEvent(actor, member2, 55L));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();

        assertThat(saved.getNotificationType()).isEqualTo(NotificationType.ACCEPTED_FRIEND_REQUEST);
        assertThat(saved.isRead()).isFalse();
        assertThat(saved.getTargetId()).isEqualTo(55L);
        assertThat(saved.getUser().getId()).isEqualTo(1L);

        verifyNoMoreInteractions(notificationRepository);
    }

    @Test
    void onRejectedFriendRequest_persistsNotificationForReceiver() {
        notificationService.onRejectedFriendRequest(new RejectedFriendRequestEvent(actor, member2));

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        Notification saved = captor.getValue();

        assertThat(saved.getNotificationType()).isEqualTo(NotificationType.REJECTED_FRIEND_REQUEST);
        assertThat(saved.isRead()).isFalse();
        assertNull(saved.getTargetId());
        assertThat(saved.getUser().getId()).isEqualTo(1L);

        verifyNoMoreInteractions(notificationRepository);
    }

    private static User user(Long id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setFirstName("F");
        u.setLastName("L");
        u.setPasswordHash("hash");
        return u;
    }

    private static Notification notification(User user) {
        return Notification.builder()
                .id(100L)
                .user(user)
                .notificationType(NotificationType.EXPENSE_ADDED)
                .build();
    }
}
