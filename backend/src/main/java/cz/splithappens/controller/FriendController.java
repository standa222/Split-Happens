package cz.splithappens.controller;

import cz.splithappens.dto.request.FriendRequestCreateDto;
import cz.splithappens.dto.response.FriendDto;
import cz.splithappens.dto.response.FriendRequestDto;
import cz.splithappens.security.CustomUserDetails;
import cz.splithappens.service.FriendService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Friends", description = "Friends & friend requests")
public class FriendController {

    private final FriendService friendService;

    @PostMapping("/api/friend-requests")
    @Operation(summary = "Send friend request")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Friend request created"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "409", description = "Already friends or request exists")
    })
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<FriendRequestDto> createFriendRequest(
            @RequestBody @Valid FriendRequestCreateDto dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(friendService.createFriendRequest(dto.getReceiverUserId(), userDetails.getUser()));
    }

    @GetMapping("/api/friend-requests/incoming")
    @Operation(summary = "Get incoming friend requests")
    public ResponseEntity<List<FriendRequestDto>> getIncoming(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(friendService.getIncomingRequests(userDetails.getUser()));
    }

    @GetMapping("/api/friend-requests/outgoing")
    @Operation(summary = "Get outgoing friend requests")
    public ResponseEntity<List<FriendRequestDto>> getOutgoing(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(friendService.getOutgoingRequests(userDetails.getUser()));
    }

    @PostMapping("/api/friend-requests/{requestId}/accept")
    @Operation(summary = "Accept friend request", description = "Accepts the request and creates a FRIEND group with exactly 2 members")
    public ResponseEntity<FriendRequestDto> accept(
            @PathVariable Long requestId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendService.acceptFriendRequest(requestId, userDetails.getUser()));
    }

    @PostMapping("/api/friend-requests/{requestId}/reject")
    @Operation(summary = "Reject friend request")
    public ResponseEntity<FriendRequestDto> reject(
            @PathVariable Long requestId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(friendService.rejectFriendRequest(requestId, userDetails.getUser()));
    }

    @GetMapping("/api/friends")
    @Operation(summary = "Get my friends")
    public ResponseEntity<List<FriendDto>> getMyFriends(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(friendService.getMyFriends(userDetails.getUser()));
    }
}

