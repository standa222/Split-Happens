package cz.splithappens.service.impl;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.DebtDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.dto.response.GroupStatisticsDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.exception.GroupNotFoundException;
import cz.splithappens.exception.NotGroupMemberException;
import cz.splithappens.mapper.DebtMapper;
import cz.splithappens.mapper.GroupMapper;
import cz.splithappens.model.Debt;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.GroupType;
import cz.splithappens.model.enums.PermissionMode;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.GroupRepository;
import cz.splithappens.repository.TransactionRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupServiceImplTest {

    @Mock private TransactionService transactionService;
    @Mock private TransactionRepository transactionRepository;
    @Mock private GroupRepository groupRepository;
    @Mock private UserRepository userRepository;
    @Mock private GroupMapper groupMapper;
    @Mock private DebtRepository debtRepository;
    @Mock private DebtMapper debtMapper;

    @InjectMocks private GroupServiceImpl groupService;

    @Captor private ArgumentCaptor<Group> groupCaptor;
    @Captor private ArgumentCaptor<List<Debt>> debtListCaptor;

    @Test
    void createGroup_happyPath_setsMembersAndLastActivity_andReturnsMappedDto() {
        User current = user(1L);
        GroupCreateDto dto = createGroupDto(List.of(1L, 2L));

        Group groupEntity = new Group();
        when(groupMapper.toEntity(dto)).thenReturn(groupEntity);

        User member1 = user(1L);
        User member2 = user(2L);
        when(userRepository.findAllById(dto.getMemberIds())).thenReturn(List.of(member1, member2));

        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        GroupDto mappedDto = new GroupDto();
        when(groupMapper.toDto(any(Group.class), eq(current))).thenReturn(mappedDto);

        GroupDto result = groupService.createGroup(dto, current);

        assertThat(result).isSameAs(mappedDto);
        verify(groupRepository).save(groupCaptor.capture());
        Group saved = groupCaptor.getValue();
        assertThat(saved.getMembers()).isInstanceOf(LinkedHashSet.class);
        assertThat(saved.getMembers()).containsExactly(member1, member2);
        assertThat(saved.getLastActivity()).isNotNull();
    }

    @Test
    void getUserGroups_happyPath_attachesUserDebtsPerGroup() {
        User current = user(1L);

        Group g1 = new Group();
        g1.setId(10L);
        Group g2 = new Group();
        g2.setId(20L);

        when(groupRepository.findByMembersIdAndGroupTypeOrderByLastActivityDesc(1L, GroupType.GROUP))
                .thenReturn(List.of(g1, g2));

        Debt d1 = debt(g1, 1L, 2L);
        Debt d2 = debt(g1, 3L, 1L);
        Debt d3 = debt(g2, 2L, 3L); // not involving current user

        when(debtRepository.findByGroupIdIn(List.of(10L, 20L))).thenReturn(List.of(d1, d2, d3));

        GroupLightDto lg1 = new GroupLightDto();
        lg1.setId(10L);
        GroupLightDto lg2 = new GroupLightDto();
        lg2.setId(20L);
        when(groupMapper.toLightDto(g1)).thenReturn(lg1);
        when(groupMapper.toLightDto(g2)).thenReturn(lg2);

        DebtDto dd1 = new DebtDto();
        DebtDto dd2 = new DebtDto();
        // Simplify stubbing: return non-empty mapping for the first call (group 10), empty for the second call (group 20)
        when(debtMapper.toDtoList(anyList()))
                .thenReturn(List.of(dd1, dd2))
                .thenReturn(List.of());

        List<GroupLightDto> result = groupService.getUserGroups(current);

        assertThat(result).hasSize(2);
        assertThat(result.getFirst().getId()).isEqualTo(10L);
        assertThat(result.getFirst().getUserDebts()).containsExactly(dd1, dd2);
        assertThat(result.get(1).getId()).isEqualTo(20L);
        assertThat(result.get(1).getUserDebts()).isEmpty();

        // Verify the mapping inputs: first group should receive exactly the 2 debts involving current user
        verify(debtMapper, times(2)).toDtoList(debtListCaptor.capture());
        List<List<Debt>> captured = debtListCaptor.getAllValues();
        assertThat(captured.getFirst()).containsExactlyInAnyOrder(d1, d2);
        assertThat(captured.get(1)).isEmpty();
    }

    @Test
    void getGroupDetails_groupNotFound_throws() {
        when(groupRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupService.getGroupDetails(10L, user(1L)))
                .isInstanceOf(GroupNotFoundException.class);

        verifyNoInteractions(transactionService, debtRepository);
    }

    @Test
    void getGroupDetails_userNotMember_throws() {
        Group group = new Group();
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(user(2L), user(3L))));
        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> groupService.getGroupDetails(10L, user(1L)))
                .isInstanceOf(NotGroupMemberException.class);

        verifyNoInteractions(transactionService, debtRepository);
    }

    @Test
    void getGroupDetails_happyPath_setsTransactionsAndDebts() {
        User current = user(1L);
        Group group = new Group();
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(current, user(2L))));

        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        GroupDto dto = new GroupDto();
        when(groupMapper.toDto(group, current)).thenReturn(dto);

        TransactionDto t1 = new TransactionDto();
        when(transactionService.getGroupTransactions(10L)).thenReturn(List.of(t1));

        Debt deb = debt(group, 1L, 2L);
        DebtDto dd = new DebtDto();
        when(debtRepository.findByGroupId(10L)).thenReturn(List.of(deb));
        when(debtMapper.toDtoList(List.of(deb))).thenReturn(List.of(dd));

        GroupDto result = groupService.getGroupDetails(10L, current);

        assertThat(result).isSameAs(dto);
        assertThat(dto.getTransactions()).containsExactly(t1);
        assertThat(dto.getDebts()).containsExactly(dd);
    }

    @Test
    void updateGroup_groupNotFound_throws() {
        when(groupRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupService.updateGroup(10L, createGroupDto(List.of(1L)), user(1L)))
                .isInstanceOf(GroupNotFoundException.class);

        verify(groupRepository, never()).save(any());
    }

    @Test
    void updateGroup_userNotMember_throws() {
        Group group = spy(new Group());
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(user(2L))));
        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> groupService.updateGroup(10L, createGroupDto(List.of(1L, 2L)), user(1L)))
                .isInstanceOf(NotGroupMemberException.class);

        verify(groupRepository, never()).save(any());
        verify(group, never()).updateLastActivity();
    }

    @Test
    void updateGroup_happyPath_updatesFields_members_andUpdatesLastActivity() {
        User current = user(1L);
        Group group = spy(new Group());
        group.setId(10L);
        group.setName("Old");
        group.setPermissionMode(PermissionMode.SOFT);
        group.setMembers(new LinkedHashSet<>(List.of(current)));

        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        GroupCreateDto updateDto = createGroupDto(List.of(1L, 2L));
        updateDto.setName("New");
        updateDto.setPermissionMode(PermissionMode.HARD);

        User m1 = user(1L);
        User m2 = user(2L);
        when(userRepository.findAllById(updateDto.getMemberIds())).thenReturn(List.of(m1, m2));

        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));
        GroupDto mapped = new GroupDto();
        when(groupMapper.toDto(any(Group.class), eq(current))).thenReturn(mapped);

        GroupDto result = groupService.updateGroup(10L, updateDto, current);

        assertThat(result).isSameAs(mapped);
        assertThat(group.getName()).isEqualTo("New");
        assertThat(group.getPermissionMode()).isEqualTo(PermissionMode.HARD);
        assertThat(group.getMembers()).containsExactly(m1, m2);
        verify(group).updateLastActivity();
    }

    @Test
    void leaveGroup_groupNotFound_throws() {
        when(groupRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupService.leaveGroup(10L, user(1L)))
                .isInstanceOf(GroupNotFoundException.class);

        verify(groupRepository, never()).save(any());
    }

    @Test
    void leaveGroup_userNotMember_throws() {
        Group group = new Group();
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(user(2L))));
        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> groupService.leaveGroup(10L, user(1L)))
                .isInstanceOf(NotGroupMemberException.class);

        verify(groupRepository, never()).save(any());
    }

    @Test
    void leaveGroup_happyPath_removesMember_updatesLastActivity_andSaves() {
        User current = user(1L);
        Group group = spy(new Group());
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(current, user(2L))));

        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));

        groupService.leaveGroup(10L, current);

        assertThat(group.getMembers()).extracting(User::getId).containsExactly(2L);
        verify(group).updateLastActivity();
        verify(groupRepository).save(group);
    }

    @Test
    void getGroupStatistics_groupNotFound_throws() {
        when(groupRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> groupService.getGroupStatistics(10L, user(1L)))
                .isInstanceOf(GroupNotFoundException.class);

        verifyNoInteractions(transactionRepository);
    }

    @Test
    void getGroupStatistics_userNotMember_throws() {
        Group group = new Group();
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(user(2L), user(3L))));
        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> groupService.getGroupStatistics(10L, user(1L)))
                .isInstanceOf(NotGroupMemberException.class);

        verifyNoInteractions(transactionRepository);
    }

    @Test
    void getGroupStatistics_happyPath_mapsCategoryAndMonthlyTrend() {
        User current = user(1L);
        Group group = new Group();
        group.setId(10L);
        group.setMembers(new LinkedHashSet<>(List.of(current, user(2L))));
        when(groupRepository.findById(10L)).thenReturn(Optional.of(group));

        TransactionRepository.CategoryTotalProjection catProj = mockCategory();
        TransactionRepository.MonthTotalProjection monthProj = mockMonth();
        TransactionRepository.UserTotalProjection userProj = mockUser();
        when(transactionRepository.sumExpensesByCategory(10L)).thenReturn(List.of(catProj));
        when(transactionRepository.sumExpensesByMonth(10L)).thenReturn(List.of(monthProj));
        when(transactionRepository.sumUserSpending(10L)).thenReturn(List.of(userProj));
        when(transactionRepository.sumUserPaying(10L)).thenReturn(List.of());

        GroupStatisticsDto result = groupService.getGroupStatistics(10L, current);

        assertThat(result.getSpendingByCategory()).hasSize(1);
        assertThat(result.getSpendingByCategory().getFirst().getCategory()).isEqualTo(ExpenseCategory.COFFEE);
        assertThat(result.getSpendingByCategory().getFirst().getTotal()).isEqualByComparingTo("123.45");

        assertThat(result.getMonthlyTrend()).hasSize(1);
        assertThat(result.getMonthlyTrend().getFirst().getMonth()).hasToString("2026-05");
        assertThat(result.getMonthlyTrend().getFirst().getTotal()).isEqualByComparingTo("999.00");

        assertThat(result.getUserStats()).hasSize(1);
        assertThat(result.getUserStats().getFirst().getUserId()).isEqualTo(1L);
        assertThat(result.getUserStats().getFirst().getSpending()).isEqualByComparingTo("50.00");
        assertThat(result.getUserStats().getFirst().getPaying()).isEqualByComparingTo("0");
        assertThat(result.getUserStats().getFirst().getKIndex()).isEqualTo(0.0);

        verify(transactionRepository).sumExpensesByCategory(10L);
        verify(transactionRepository).sumExpensesByMonth(10L);
        verify(transactionRepository).sumUserSpending(10L);
        verify(transactionRepository).sumUserPaying(10L);
    }

    private static GroupCreateDto createGroupDto(List<Long> memberIds) {
        GroupCreateDto dto = new GroupCreateDto();
        dto.setName("Test");
        dto.setDefaultCurrency(Currency.CZK);
        dto.setPermissionMode(PermissionMode.SOFT);
        dto.setGroupType(GroupType.GROUP);
        dto.setMemberIds(memberIds);
        return dto;
    }

    private static User user(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private static Debt debt(Group group, Long creditorId, Long debtorId) {
        Debt d = new Debt();
        d.setGroup(group);
        d.setCreditor(user(creditorId));
        d.setDebtor(user(debtorId));
        return d;
    }

    private TransactionRepository.CategoryTotalProjection mockCategory() {
        TransactionRepository.CategoryTotalProjection p = mock(TransactionRepository.CategoryTotalProjection.class);
        when(p.getCategory()).thenReturn(ExpenseCategory.COFFEE);
        when(p.getTotal()).thenReturn(new BigDecimal("123.45"));
        return p;
    }

    private TransactionRepository.MonthTotalProjection mockMonth() {
        TransactionRepository.MonthTotalProjection p = mock(TransactionRepository.MonthTotalProjection.class);
        when(p.getMonthDate()).thenReturn(OffsetDateTime.parse("2026-05-01T00:00:00Z"));
        when(p.getTotal()).thenReturn(new BigDecimal("999.00"));
        return p;
    }

    private TransactionRepository.UserTotalProjection mockUser() {
        TransactionRepository.UserTotalProjection p = mock(TransactionRepository.UserTotalProjection.class);
        when(p.getUserId()).thenReturn(1L);
        when(p.getTotal()).thenReturn(new BigDecimal("50.00"));
        return p;
    }
}


