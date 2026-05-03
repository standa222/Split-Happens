package cz.splithappens.controller;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.dto.response.GroupStatisticsDto;
import cz.splithappens.security.CustomUserDetails;
import cz.splithappens.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
@Tag(name = "Groups", description = "Collective expense contexts")
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    @Operation(summary = "Create a new group", description = "Creates a new group for collective expenses. The creator is automatically added as a member.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Group created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<GroupDto> createGroup(
            @RequestBody @Valid GroupCreateDto createDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(groupService.createGroup(createDto, userDetails.getUser()));
    }

    @GetMapping
    @Operation(summary = "Get my groups", description = "Returns a list of groups that the authenticated user is a member of")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<List<GroupLightDto>> getMyGroups(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(groupService.getUserGroups(userDetails.getUser()));
    }

    @GetMapping("/{groupId}")
    @Operation(summary = "Get group details", description = "Returns details of a specific group, including its members and transactions.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<GroupDto> getGroupDetails(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(groupService.getGroupDetails(groupId, userDetails.getUser()));
    }

    @GetMapping("/{groupId}/statistics")
    @Operation(summary = "Get group statistics", description = "Returns aggregated statistics for a specific group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successful operation"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<GroupStatisticsDto> getGroupStatistics(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(groupService.getGroupStatistics(groupId, userDetails.getUser()));
    }

    @PutMapping("/{groupId}")
    @Operation(summary = "Update group details", description = "Updates the details of an existing group, such as its name or members.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Group updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<GroupDto> updateGroup(
            @PathVariable Long groupId,
            @RequestBody @Valid GroupCreateDto updateDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(groupService.updateGroup(groupId, updateDto, userDetails.getUser()));
    }

    @GetMapping("/{groupId}/leave")
    @Operation(summary = "Leave a group", description = "Removes the authenticated user from the specified group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Left group successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<Void> leaveGroup(
            @PathVariable Long groupId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        groupService.leaveGroup(groupId, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{groupId}/image")
    @Operation(summary = "Get group image", description = "Retrieves the image associated with the specified group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Group image retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "Group exists but has no image"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<byte[]> getGroupImage(@PathVariable Long groupId) {
        byte[] imageData = groupService.getGroupImage(groupId);
        if (imageData == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, "image/webp")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400, public")
                .body(imageData);
    }

    @PostMapping("/{groupId}/image")
    @Operation(summary = "Upload group image", description = "Uploads a new image for the specified group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Group image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<Void> uploadGroupImage(@PathVariable Long groupId, @RequestParam("file") MultipartFile imageData) {
        try {
            groupService.uploadGroupImage(groupId, imageData);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
