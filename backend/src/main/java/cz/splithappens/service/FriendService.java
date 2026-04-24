package cz.splithappens.service;

import cz.splithappens.dto.response.FriendDto;
import cz.splithappens.dto.response.FriendRequestDto;
import cz.splithappens.model.User;

import java.util.List;

public interface FriendService {
    FriendRequestDto createFriendRequest(Long receiverUserId, User currentUser);

    FriendRequestDto acceptFriendRequest(Long requestId, User currentUser);

    FriendRequestDto rejectFriendRequest(Long requestId, User currentUser);

    List<FriendRequestDto> getIncomingRequests(User currentUser);

    List<FriendRequestDto> getOutgoingRequests(User currentUser);

    List<FriendDto> getMyFriends(User currentUser);
}

