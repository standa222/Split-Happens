package cz.splithappens.service.impl;

import cz.splithappens.dto.response.FriendDto;
import cz.splithappens.dto.response.FriendRequestDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.exception.*;
import cz.splithappens.mapper.FriendRequestMapper;
import cz.splithappens.mapper.UserMapper;
import cz.splithappens.model.FriendLink;
import cz.splithappens.model.FriendRequest;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.FriendRequestStatus;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.repository.FriendRepository;
import cz.splithappens.repository.FriendRequestRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FriendServiceImplTest {

    @Mock private FriendRequestRepository friendRequestRepository;
    @Mock private FriendRepository friendRepository;
    @Mock private GroupRepository groupRepository;
    @Mock private UserRepository userRepository;
    @Mock private FriendRequestMapper friendRequestMapper;
    @Mock private UserMapper userMapper;

    @InjectMocks private FriendServiceImpl friendService;

    @Captor private ArgumentCaptor<FriendRequest> friendRequestCaptor;
    @Captor private ArgumentCaptor<Group> groupCaptor;
    @Captor private ArgumentCaptor<FriendLink> friendLinkCaptor;

    @Test
    void createFriendRequest_receiverNull_throwsBadRequest() {
        assertThatThrownBy(() -> friendService.createFriendRequest(null, user(1L)))
                .isInstanceOf(BadRequestException.class);

        verifyNoInteractions(friendRequestRepository, friendRepository, groupRepository, userRepository);
    }

    @Test
    void createFriendRequest_selfRequest_throws() {
        assertThatThrownBy(() -> friendService.createFriendRequest(1L, user(1L)))
                .isInstanceOf(SelfFriendRequestException.class);

        verifyNoInteractions(friendRequestRepository, friendRepository, groupRepository, userRepository);
    }

    @Test
    void createFriendRequest_alreadyFriends_throws() {
        User current = user(1L);
        when(friendRepository.existsByIdUserIdAndIdFriendId(1L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> friendService.createFriendRequest(2L, current))
                .isInstanceOf(FriendAlreadyExistsException.class);

        verify(friendRepository).existsByIdUserIdAndIdFriendId(1L, 2L);
        verifyNoInteractions(friendRequestRepository, groupRepository, userRepository);
    }

    @Test
    void createFriendRequest_existingPendingSameDirection_throws() {
        User current = user(1L);
        when(friendRepository.existsByIdUserIdAndIdFriendId(1L, 2L)).thenReturn(false);
        when(friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(2L, 1L, FriendRequestStatus.PENDING))
                .thenReturn(Optional.empty());
        when(friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(1L, 2L, FriendRequestStatus.PENDING))
                .thenReturn(true);

        assertThatThrownBy(() -> friendService.createFriendRequest(2L, current))
                .isInstanceOf(FriendRequestAlreadyExistsException.class);

        verify(friendRequestRepository).existsBySenderIdAndReceiverIdAndStatus(1L, 2L, FriendRequestStatus.PENDING);
        verify(friendRequestRepository, never()).save(any());
    }

    @Test
    void createFriendRequest_crossRequest_autoAccepts() {
        User current = user(1L);
        User other = user(2L);

        FriendRequest cross = new FriendRequest();
        cross.setId(10L);
        cross.setSender(other);
        cross.setReceiver(current);
        cross.setStatus(FriendRequestStatus.PENDING);

        when(friendRepository.existsByIdUserIdAndIdFriendId(1L, 2L)).thenReturn(false);
        when(friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(2L, 1L, FriendRequestStatus.PENDING))
                .thenReturn(Optional.of(cross));

        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(cross));
        when(friendRepository.findByIdUserIdAndIdFriendId(2L, 1L)).thenReturn(Optional.empty());

        // ensureFriendGroup
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> {
            Group g = inv.getArgument(0);
            g.setId(100L);
            return g;
        });
        when(friendRepository.save(any(FriendLink.class))).thenAnswer(inv -> inv.getArgument(0));
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        FriendRequestDto responseDto = new FriendRequestDto();
        when(friendRequestMapper.toDto(any(FriendRequest.class))).thenReturn(responseDto);

        FriendRequestDto result = friendService.createFriendRequest(2L, current);

        assertThat(result).isSameAs(responseDto);

        // should not create a new request, it should accept the cross request
        verify(friendRequestRepository, never()).save(argThat(fr -> fr.getId() == null));
        verify(groupRepository).save(any(Group.class));
        verify(friendRepository, times(2)).save(any(FriendLink.class));
        verify(friendRequestRepository).save(cross);
        assertThat(cross.getStatus()).isEqualTo(FriendRequestStatus.ACCEPTED);
    }

    @Test
    void createFriendRequest_happyPath_createsPendingRequest() {
        User current = user(1L);
        User receiver = user(2L);

        when(friendRepository.existsByIdUserIdAndIdFriendId(1L, 2L)).thenReturn(false);
        when(friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(2L, 1L, FriendRequestStatus.PENDING))
                .thenReturn(Optional.empty());
        when(friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(1L, 2L, FriendRequestStatus.PENDING))
                .thenReturn(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(receiver));

        FriendRequestDto dto = new FriendRequestDto();
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(friendRequestMapper.toDto(any(FriendRequest.class))).thenReturn(dto);

        FriendRequestDto result = friendService.createFriendRequest(2L, current);

        assertThat(result).isSameAs(dto);
        verify(friendRequestRepository).save(friendRequestCaptor.capture());

        FriendRequest saved = friendRequestCaptor.getValue();
        assertThat(saved.getSender()).isSameAs(current);
        assertThat(saved.getReceiver()).isSameAs(receiver);
        assertThat(saved.getStatus()).isEqualTo(FriendRequestStatus.PENDING);
        assertThat(saved.getCreatedAt()).isNotNull();

        verify(groupRepository, never()).save(any());
        verify(friendRepository, never()).save(any());
    }

    @Test
    void acceptFriendRequest_notFound_throws() {
        when(friendRequestRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> friendService.acceptFriendRequest(1L, user(1L)))
                .isInstanceOf(FriendRequestNotFoundException.class);

        verify(friendRequestRepository).findById(1L);
        verify(friendRequestRepository, never()).save(any());
    }

    @Test
    void acceptFriendRequest_notReceiver_throwsForbidden() {
        FriendRequest fr = new FriendRequest();
        fr.setId(1L);
        fr.setSender(user(2L));
        fr.setReceiver(user(3L));
        fr.setStatus(FriendRequestStatus.PENDING);
        when(friendRequestRepository.findById(1L)).thenReturn(Optional.of(fr));

        assertThatThrownBy(() -> friendService.acceptFriendRequest(1L, user(1L)))
                .isInstanceOf(FriendRequestForbiddenException.class);

        verify(friendRequestRepository, never()).save(any());
        verifyNoInteractions(groupRepository, friendRepository);
    }

    @Test
    void acceptFriendRequest_wrongState_throwsInvalidState() {
        FriendRequest fr = new FriendRequest();
        fr.setId(1L);
        fr.setSender(user(2L));
        fr.setReceiver(user(1L));
        fr.setStatus(FriendRequestStatus.ACCEPTED);
        when(friendRequestRepository.findById(1L)).thenReturn(Optional.of(fr));

        assertThatThrownBy(() -> friendService.acceptFriendRequest(1L, user(1L)))
                .isInstanceOf(FriendRequestInvalidStateException.class);

        verify(friendRequestRepository, never()).save(any());
        verifyNoInteractions(groupRepository, friendRepository);
    }

    @Test
    void acceptFriendRequest_happyPath_createsGroupAndFriendLinks_marksAccepted() {
        User sender = user(2L);
        sender.setFirstName("Alice");
        User receiver = user(1L);
        receiver.setFirstName("Bob");

        FriendRequest fr = new FriendRequest();
        fr.setId(10L);
        fr.setSender(sender);
        fr.setReceiver(receiver);
        fr.setStatus(FriendRequestStatus.PENDING);

        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(fr));
        when(friendRepository.findByIdUserIdAndIdFriendId(2L, 1L)).thenReturn(Optional.empty());

        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> {
            Group g = inv.getArgument(0);
            g.setId(777L);
            return g;
        });
        when(friendRepository.save(any(FriendLink.class))).thenAnswer(inv -> inv.getArgument(0));
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        FriendRequestDto mapped = new FriendRequestDto();
        when(friendRequestMapper.toDto(any(FriendRequest.class))).thenReturn(mapped);

        FriendRequestDto result = friendService.acceptFriendRequest(10L, receiver);

        assertThat(result).isSameAs(mapped);
        assertThat(fr.getStatus()).isEqualTo(FriendRequestStatus.ACCEPTED);
        assertThat(fr.getRespondedAt()).isNotNull();

        verify(groupRepository).save(groupCaptor.capture());
        Group createdGroup = groupCaptor.getValue();
        assertThat(createdGroup.getGroupType()).isEqualTo(GroupType.FRIEND);
        assertThat(createdGroup.getMembers()).containsExactlyInAnyOrder(sender, receiver);
        assertThat(createdGroup.getName()).contains("Alice").contains("Bob");

        verify(friendRepository, times(2)).save(friendLinkCaptor.capture());
        List<FriendLink> links = friendLinkCaptor.getAllValues();
        assertThat(links).hasSize(2);
        assertThat(links).allMatch(l -> l.getGroupId().equals(777L));
        assertThat(links).extracting(l -> l.getId().getUserId()).containsExactlyInAnyOrder(1L, 2L);
        assertThat(links).extracting(l -> l.getId().getFriendId()).containsExactlyInAnyOrder(1L, 2L);
    }

    @Test
    void acceptFriendRequest_whenAlreadyFriends_doesNotCreateGroupOrLinks_justMarksAccepted() {
        User sender = user(2L);
        User receiver = user(1L);

        FriendRequest fr = new FriendRequest();
        fr.setId(10L);
        fr.setSender(sender);
        fr.setReceiver(receiver);
        fr.setStatus(FriendRequestStatus.PENDING);

        FriendLink existing = new FriendLink();
        FriendLink.FriendLinkId id = new FriendLink.FriendLinkId(2L, 1L);
        existing.setId(id);
        existing.setGroupId(555L);

        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(fr));
        when(friendRepository.findByIdUserIdAndIdFriendId(2L, 1L)).thenReturn(Optional.of(existing));
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(friendRequestMapper.toDto(any(FriendRequest.class))).thenReturn(new FriendRequestDto());

        friendService.acceptFriendRequest(10L, receiver);

        verify(groupRepository, never()).save(any());
        verify(friendRepository, never()).save(any());
        verify(friendRequestRepository).save(fr);
        assertThat(fr.getStatus()).isEqualTo(FriendRequestStatus.ACCEPTED);
    }

    @Test
    void rejectFriendRequest_happyPath_marksRejected() {
        User sender = user(2L);
        User receiver = user(1L);

        FriendRequest fr = new FriendRequest();
        fr.setId(10L);
        fr.setSender(sender);
        fr.setReceiver(receiver);
        fr.setStatus(FriendRequestStatus.PENDING);

        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(fr));
        when(friendRequestRepository.save(any(FriendRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        FriendRequestDto mapped = new FriendRequestDto();
        when(friendRequestMapper.toDto(any(FriendRequest.class))).thenReturn(mapped);

        FriendRequestDto result = friendService.rejectFriendRequest(10L, receiver);

        assertThat(result).isSameAs(mapped);
        assertThat(fr.getStatus()).isEqualTo(FriendRequestStatus.REJECTED);
        assertThat(fr.getRespondedAt()).isNotNull();
    }

    @Test
    void rejectFriendRequest_forbidden_throws() {
        FriendRequest fr = new FriendRequest();
        fr.setId(10L);
        fr.setSender(user(2L));
        fr.setReceiver(user(3L));
        fr.setStatus(FriendRequestStatus.PENDING);

        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(fr));

        assertThatThrownBy(() -> friendService.rejectFriendRequest(10L, user(1L)))
                .isInstanceOf(FriendRequestForbiddenException.class);

        verify(friendRequestRepository, never()).save(any());
    }

    @Test
    void rejectFriendRequest_wrongState_throws() {
        FriendRequest fr = new FriendRequest();
        fr.setId(10L);
        fr.setSender(user(2L));
        fr.setReceiver(user(1L));
        fr.setStatus(FriendRequestStatus.ACCEPTED);

        when(friendRequestRepository.findById(10L)).thenReturn(Optional.of(fr));

        assertThatThrownBy(() -> friendService.rejectFriendRequest(10L, user(1L)))
                .isInstanceOf(FriendRequestInvalidStateException.class);

        verify(friendRequestRepository, never()).save(any());
    }

    @Test
    void getIncomingRequests_mapsDtos() {
        User current = user(1L);
        FriendRequest fr1 = new FriendRequest();
        fr1.setId(1L);
        FriendRequest fr2 = new FriendRequest();
        fr2.setId(2L);

        when(friendRequestRepository.findByReceiverIdAndStatusOrderByCreatedAtDesc(1L, FriendRequestStatus.PENDING))
                .thenReturn(List.of(fr1, fr2));
        FriendRequestDto dto1 = new FriendRequestDto();
        FriendRequestDto dto2 = new FriendRequestDto();
        when(friendRequestMapper.toDto(fr1)).thenReturn(dto1);
        when(friendRequestMapper.toDto(fr2)).thenReturn(dto2);

        List<FriendRequestDto> result = friendService.getIncomingRequests(current);

        assertThat(result).containsExactly(dto1, dto2);
    }

    @Test
    void getOutgoingRequests_mapsDtos() {
        User current = user(1L);
        FriendRequest fr1 = new FriendRequest();
        fr1.setId(1L);

        when(friendRequestRepository.findBySenderIdAndStatusOrderByCreatedAtDesc(1L, FriendRequestStatus.PENDING))
                .thenReturn(List.of(fr1));
        FriendRequestDto dto1 = new FriendRequestDto();
        when(friendRequestMapper.toDto(fr1)).thenReturn(dto1);

        List<FriendRequestDto> result = friendService.getOutgoingRequests(current);

        assertThat(result).containsExactly(dto1);
    }

    @Test
    void getMyFriends_whenNoLinks_returnsEmpty() {
        User current = user(1L);
        when(friendRepository.findAllByIdUserId(1L)).thenReturn(List.of());

        List<FriendDto> result = friendService.getMyFriends(current);

        assertThat(result).isEmpty();
        verifyNoInteractions(userRepository);
    }

    @Test
    void getMyFriends_happyPath_sortsAndMaps_withGroupIdFromLink() {
        User current = user(1L);

        FriendLink link1 = link(1L, 2L, 100L);
        FriendLink link2 = link(1L, 3L, 200L);
        when(friendRepository.findAllByIdUserId(1L)).thenReturn(List.of(link1, link2));

        User u2 = user(2L);
        u2.setFirstName("Charlie");
        u2.setLastName("Beta");
        User u3 = user(3L);
        u3.setFirstName("Alice");
        u3.setLastName("Alpha");

        when(userRepository.findAllById(any())).thenReturn(new java.util.ArrayList<>(List.of(u2, u3)));

        UserDto dto2 = new UserDto();
        dto2.setId(2L);
        UserDto dto3 = new UserDto();
        dto3.setId(3L);
        when(userMapper.toDto(u2)).thenReturn(dto2);
        when(userMapper.toDto(u3)).thenReturn(dto3);

        List<FriendDto> result = friendService.getMyFriends(current);

        // sorted by lastName/firstName -> u3 (Alpha) first then u2 (Beta)
        assertThat(result)
                .extracting(f -> f.getUser().getId())
                .containsExactly(3L, 2L);
        assertThat(result)
                .extracting(FriendDto::getFriendGroupId)
                .containsExactly(200L, 100L);
    }

    private static User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private static FriendLink link(Long userId, Long friendId, Long groupId) {
        FriendLink l = new FriendLink();
        l.setId(new FriendLink.FriendLinkId(userId, friendId));
        l.setGroupId(groupId);
        return l;
    }
}



