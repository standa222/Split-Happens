package cz.splithappens.service;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.model.User;

import java.util.List;

public interface GroupService {
    GroupDto createGroup(GroupCreateDto createDto, User user);
    GroupDto addMembers(Long groupId, List<Long> userId);
    List<GroupLightDto> getUserGroups(User user);
    GroupDto getGroupDetails(Long groupId);
    GroupDto removeMember(Long groupId, Long userId);
}
