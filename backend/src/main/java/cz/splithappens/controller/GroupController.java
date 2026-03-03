package cz.splithappens.controller;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.security.CustomUserDetails;
import cz.splithappens.service.GroupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
            @RequestBody GroupCreateDto createDto,
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
    public ResponseEntity<GroupDto> getGroupDetails(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupDetails(groupId));
    }

    @PostMapping("/{groupId}/members")
    @Operation(summary = "Add members to a group", description = "Adds one or more members to an existing group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Members added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group not found")
    })
    public ResponseEntity<GroupDto> addMembers(@PathVariable Long groupId, @RequestBody List<Long> userIds) {
        return ResponseEntity.ok(groupService.addMembers(groupId, userIds));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @Operation(summary = "Remove a member from a group", description = "Removes a member from an existing group.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Member removed successfully"),
            @ApiResponse(responseCode = "403", description = "Forbidden - User is not a member of the group"),
            @ApiResponse(responseCode = "404", description = "Group or user not found")
    })
    public ResponseEntity<GroupDto> removeMember(@PathVariable Long groupId, @PathVariable Long userId) {
        return ResponseEntity.ok(groupService.removeMember(groupId, userId));
    }
}
