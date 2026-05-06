package cz.splithappens.service.impl;

import cz.splithappens.dto.response.FriendDto;
import cz.splithappens.dto.response.FriendRequestDto;
import cz.splithappens.event.AcceptedFriendRequestEvent;
import cz.splithappens.event.ReceivedFriendRequestEvent;
import cz.splithappens.event.RejectedFriendRequestEvent;
import cz.splithappens.exception.*;
import cz.splithappens.mapper.FriendRequestMapper;
import cz.splithappens.mapper.UserMapper;
import cz.splithappens.model.FriendLink;
import cz.splithappens.model.FriendRequest;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.FriendRequestStatus;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.repository.*;
import cz.splithappens.service.FriendService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendServiceImpl implements FriendService {

    private final FriendRequestRepository friendRequestRepository;
    private final FriendRepository friendRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final FriendRequestMapper friendRequestMapper;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public FriendRequestDto createFriendRequest(Long receiverUserId, User currentUser) {
        if (receiverUserId == null) {
            throw new BadRequestException("FRIEND_REQUEST_RECEIVER_NULL", "receiverUserId is required");
        }
        if (Objects.equals(currentUser.getId(), receiverUserId)) {
            throw new SelfFriendRequestException();
        }

        if (friendRepository.existsByIdUserIdAndIdFriendId(currentUser.getId(), receiverUserId)) {
            throw new FriendAlreadyExistsException(receiverUserId);
        }

        Optional<FriendRequest> cross = friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(
                receiverUserId,
                currentUser.getId(),
                FriendRequestStatus.PENDING
        );
        if (cross.isPresent()) {
            return acceptFriendRequest(cross.get().getId(), currentUser);
        }

        if (friendRequestRepository.existsBySenderIdAndReceiverIdAndStatus(currentUser.getId(), receiverUserId, FriendRequestStatus.PENDING)) {
            throw new FriendRequestAlreadyExistsException(receiverUserId);
        }

        User receiver = userRepository.findById(receiverUserId)
                .orElseThrow(() -> new UserNotFoundException(receiverUserId));

        FriendRequest fr = new FriendRequest();
        fr.setSender(currentUser);
        fr.setReceiver(receiver);
        fr.setStatus(FriendRequestStatus.PENDING);
        fr.setCreatedAt(OffsetDateTime.now());

        eventPublisher.publishEvent(new ReceivedFriendRequestEvent(fr.getSender(), fr.getReceiver()));

        return friendRequestMapper.toDto(friendRequestRepository.save(fr));
    }

    @Override
    @Transactional
    public FriendRequestDto acceptFriendRequest(Long requestId, User currentUser) {
        FriendRequest fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new FriendRequestNotFoundException(requestId));

        if (!Objects.equals(fr.getReceiver().getId(), currentUser.getId())) {
            throw new FriendRequestForbiddenException(requestId);
        }
        if (fr.getStatus() != FriendRequestStatus.PENDING) {
            throw new FriendRequestInvalidStateException(requestId, fr.getStatus().name());
        }

        User a = fr.getSender();
        User b = fr.getReceiver();

        Optional<FriendLink> existing = friendRepository.findByIdUserIdAndIdFriendId(a.getId(), b.getId());
        Long groupId;
        if (existing.isPresent()) {
            groupId = existing.get().getGroupId();
        } else {
            groupId = ensureFriendGroup(a, b);
            upsertFriendLink(a.getId(), b.getId(), groupId);
            upsertFriendLink(b.getId(), a.getId(), groupId);
        }

        fr.setStatus(FriendRequestStatus.ACCEPTED);
        fr.setRespondedAt(OffsetDateTime.now());
        FriendRequest saved = friendRequestRepository.save(fr);

        eventPublisher.publishEvent(new AcceptedFriendRequestEvent(fr.getSender(), fr.getReceiver(), groupId));

        return friendRequestMapper.toDto(saved);
    }

    @Override
    @Transactional
    public FriendRequestDto rejectFriendRequest(Long requestId, User currentUser) {
        FriendRequest fr = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new FriendRequestNotFoundException(requestId));

        if (!Objects.equals(fr.getReceiver().getId(), currentUser.getId())) {
            throw new FriendRequestForbiddenException(requestId);
        }
        if (fr.getStatus() != FriendRequestStatus.PENDING) {
            throw new FriendRequestInvalidStateException(requestId, fr.getStatus().name());
        }

        fr.setStatus(FriendRequestStatus.REJECTED);
        fr.setRespondedAt(OffsetDateTime.now());

        eventPublisher.publishEvent(new RejectedFriendRequestEvent(fr.getSender(), fr.getReceiver()));

        return friendRequestMapper.toDto(friendRequestRepository.save(fr));
    }

    @Override
    @Transactional
    public List<FriendRequestDto> getIncomingRequests(User currentUser) {
        return friendRequestRepository
                .findByReceiverIdAndStatusOrderByCreatedAtDesc(currentUser.getId(), FriendRequestStatus.PENDING)
                .stream()
                .map(friendRequestMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<FriendRequestDto> getOutgoingRequests(User currentUser) {
        return friendRequestRepository
                .findBySenderIdAndStatusOrderByCreatedAtDesc(currentUser.getId(), FriendRequestStatus.PENDING)
                .stream()
                .map(friendRequestMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public List<FriendDto> getMyFriends(User currentUser) {
        List<FriendLink> links = friendRepository.findAllByIdUserId(currentUser.getId());
        if (links.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> friendIdToGroupId = links.stream()
                .collect(Collectors.toMap(l -> l.getId().getFriendId(), FriendLink::getGroupId));

        List<User> users = userRepository.findAllById(friendIdToGroupId.keySet());
        users.sort(Comparator.comparing(User::getLastName, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(User::getFirstName, Comparator.nullsLast(String::compareToIgnoreCase))
                .thenComparing(User::getId));

        return users.stream()
                .map(u -> new FriendDto(userMapper.toDto(u), friendIdToGroupId.get(u.getId())))
                .toList();
    }

    private void upsertFriendLink(Long userId, Long friendId, Long groupId) {
        FriendLink.FriendLinkId id = new FriendLink.FriendLinkId(userId, friendId);
        FriendLink link = new FriendLink();
        link.setId(id);
        link.setGroupId(groupId);
        friendRepository.save(link);
    }

    /**
     * Creates a GroupType.FRIEND group for the pair if it doesn't exist in DB.
     * We "reuse" by checking the existing friend link first (done by caller).
     */
    private Long ensureFriendGroup(User a, User b) {
        Group g = new Group();
        g.setName(a.getFirstName() + " & " + b.getFirstName());
        g.setGroupType(GroupType.FRIEND);
        g.setMembers(new LinkedHashSet<>(List.of(a, b)));
        g.updateLastActivity();
        return groupRepository.save(g).getId();
    }
}

