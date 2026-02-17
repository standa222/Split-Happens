package cz.splithappens.service;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;

import java.util.List;

public interface GroupService {
    GroupDto createGroup(GroupCreateDto createDto, Long creatorId);
    void addMember(Long groupId, Long userId);
    List<GroupDto> getUserGroups(Long userId);
}
