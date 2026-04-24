package cz.splithappens.service.impl;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.DebtDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.exception.GroupNotFoundException;
import cz.splithappens.exception.NotGroupMemberException;
import cz.splithappens.mapper.DebtMapper;
import cz.splithappens.mapper.GroupMapper;
import cz.splithappens.model.Debt;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.GroupService;
import cz.splithappens.service.TransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {
    private final TransactionService transactionService;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMapper groupMapper;
    private final DebtRepository debtRepository;
    private final DebtMapper debtMapper;

    @Override
    @Transactional
    public GroupDto createGroup(GroupCreateDto createDto, User user) {
        Group group = groupMapper.toEntity(createDto);
        List<User> members = userRepository.findAllById(createDto.getMemberIds());
        group.setMembers(new LinkedHashSet<>(members));
        group.setLastActivity(OffsetDateTime.now());
        return groupMapper.toDto(groupRepository.save(group), user);
    }

    @Override
    @Transactional
    public List<GroupLightDto> getUserGroups(User user) {
        List<Group> groups = groupRepository.findByMembersIdAndGroupTypeOrderByLastActivityDesc(user.getId(), GroupType.GROUP);
        List<Long> groupIds = groups.stream().map(Group::getId).toList();

        Map<Long, List<Debt>> debtsByGroupId = debtRepository.findByGroupIdIn(groupIds).stream()
                .filter(debt -> isUserInvolvedInDebt(debt, user.getId()))
                .collect(Collectors.groupingBy(debt -> debt.getGroup().getId()));

        return groups.stream()
                .map(group -> {
                    GroupLightDto dto = groupMapper.toLightDto(group);
                    List<Debt> groupDebts = debtsByGroupId.getOrDefault(group.getId(), Collections.emptyList());
                    dto.setUserDebts(debtMapper.toDtoList(groupDebts));
                    return dto;
                })
                .toList();
    }

    @Override
    @Transactional
    public GroupDto getGroupDetails(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));

        if (group.getMembers().stream().noneMatch(m -> m.getId().equals(user.getId()))) {
            throw new NotGroupMemberException(groupId);
        }

        GroupDto groupDto = groupMapper.toDto(group, user);

        groupDto.setTransactions(transactionService.getGroupTransactions(groupId));
        groupDto.setDebts(debtMapper.toDtoList(debtRepository.findByGroupId(groupId)));

        return groupDto;
    }

    @Override
    @Transactional
    public GroupDto updateGroup(Long groupId, GroupCreateDto updateDto, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));
        if (!group.getMembers().stream().map(User::getId).toList().contains(user.getId())) {
            throw new NotGroupMemberException(groupId);
        }
        List<User> members = userRepository.findAllById(updateDto.getMemberIds());
        group.setName(updateDto.getName());
        // TODO add update default currency + recalculate debts if currency changes
        group.setPermissionMode(updateDto.getPermissionMode());
        group.setMembers(new LinkedHashSet<>(members));
        group.updateLastActivity();
        return groupMapper.toDto(groupRepository.save(group), user);
    }

    @Override
    @Transactional
    public void leaveGroup(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));
        if (!group.getMembers().stream().map(User::getId).toList().contains(user.getId())) {
            throw new NotGroupMemberException(groupId);
        }
        group.getMembers().removeIf(member -> member.getId().equals(user.getId()));
        group.updateLastActivity();
        groupRepository.save(group);
    }

    @Override
    public byte[] getGroupImage(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));
        return group.getGroupImage();
    }

    @Override
    public void uploadGroupImage(Long groupId, MultipartFile imageData) throws IOException {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException(groupId));
        group.setGroupImage(imageData.getBytes());
        groupRepository.save(group);
    }

    private boolean isUserInvolvedInDebt(Debt debt, Long userId) {
        return debt.getCreditor().getId().equals(userId) || debt.getDebtor().getId().equals(userId);
    }
}
