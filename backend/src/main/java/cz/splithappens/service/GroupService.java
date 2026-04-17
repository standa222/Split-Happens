package cz.splithappens.service;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface GroupService {
    GroupDto createGroup(GroupCreateDto createDto, User user);
    List<GroupLightDto> getUserGroups(User user);
    GroupDto getGroupDetails(Long groupId, User user);
    GroupDto updateGroup(Long groupId, GroupCreateDto updateDto, User user);
    void leaveGroup(Long groupId, User user);
    byte[] getGroupImage(Long groupId);
    void uploadGroupImage(Long groupId, MultipartFile imageData) throws IOException;
}
