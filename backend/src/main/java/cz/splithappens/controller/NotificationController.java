package cz.splithappens.controller;

import cz.splithappens.dto.response.NotificationDto;
import cz.splithappens.security.CustomUserDetails;
import cz.splithappens.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notifications about important events in the system")
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notifications count", description = "Returns the count of unread notifications for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Integer> getUnreadCount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getMyUnreadCount(userDetails.getUser()));
    }

    @GetMapping
    @Operation(summary = "Get my notifications", description = "Returns a paginated list of notifications for the authenticated user, ordered by creation date descending")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Page<NotificationDto>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(userDetails.getUser(), pageable));
    }

    @PostMapping("/mark-read")
    @Operation(summary = "Mark all notifications as read", description = "Marks all notifications for the authenticated user as read")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successful operation"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/mark-read")
    @Operation(summary = "Mark a notification as read", description = "Marks a specific notification as read for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successful operation"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden - Notification does not belong to user"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> markAsRead(@AuthenticationPrincipal CustomUserDetails userDetails, @PathVariable Long id) {
        notificationService.markAsRead(userDetails.getUser(), id);
        return ResponseEntity.ok().build();
    }
}
