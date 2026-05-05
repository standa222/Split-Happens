package cz.splithappens.service.impl;

import cz.splithappens.event.ExpenseAddedEvent;
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

import java.math.BigDecimal;
import java.util.Set;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock private NotificationRepository notificationRepository;

    @InjectMocks private NotificationServiceImpl notificationService;

    private Group group;
    private User creator;
    private User member2;
    private User member3;

    @BeforeEach
    void setUp() {
        creator = user(1L, "actor@test.com");
        member2 = user(2L, "m2@test.com");
        member3 = user(3L, "m3@test.com");

        group = Group.builder()
                .id(10L)
                .name("Trip")
                .members(Set.of(creator, member2, member3))
                .build();
    }

    @Test
    void onExpenseAdded_persistsNotificationForAllMembersExceptActor() {
        Transaction transaction = new Transaction();
        transaction.setTotalAmount(BigDecimal.TEN);

        notificationService.onExpenseAdded(new ExpenseAddedEvent(group, transaction, creator));

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

    private static User user(Long id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setFirstName("F");
        u.setLastName("L");
        u.setPasswordHash("hash");
        return u;
    }
}
