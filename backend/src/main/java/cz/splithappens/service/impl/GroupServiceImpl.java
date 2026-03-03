package cz.splithappens.service.impl;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.mapper.DebtMapper;
import cz.splithappens.mapper.GroupMapper;
import cz.splithappens.model.Debt;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.GroupService;
import cz.splithappens.service.TransactionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {
    private static final Logger logger = LoggerFactory.getLogger(GroupServiceImpl.class);

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
        group.getMembers().add(user);
        group.setLastActivity(OffsetDateTime.now());
        return groupMapper.toDto(groupRepository.save(group));
    }

    @Override
    @Transactional
    public GroupDto addMembers(Long groupId, List<Long> userIds) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception

        userIds.forEach(userId -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found")); // TODO: Custom exception
            group.getMembers().add(user);
        });
        return groupMapper.toDto(groupRepository.save(group));
    }

    @Override
    @Transactional
    public List<GroupLightDto> getUserGroups(User user) {
        List<Group> groups = groupRepository.findByMembersIdOrderByLastActivityDesc(user.getId());
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
    public GroupDto getGroupDetails(Long groupId) {
        List<TransactionDto> transactions = transactionService.getGroupTransactions(groupId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception
        GroupDto groupDto = groupMapper.toDto(group);
        groupDto.setTransactions(transactions);
        return groupDto;
    }

    @Override
    @Transactional
    public GroupDto removeMember(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found")); // TODO: Custom exception
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found")); // TODO: Custom exception
        group.getMembers().remove(user);
        return groupMapper.toDto(groupRepository.save(group));
    }

    private boolean isUserInvolvedInDebt(Debt debt, Long userId) {
        return debt.getCreditor().getId().equals(userId) || debt.getDebtor().getId().equals(userId);
    }
}
