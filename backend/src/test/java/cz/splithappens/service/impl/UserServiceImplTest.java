package cz.splithappens.service.impl;

import cz.splithappens.dto.request.BankAccountCreateDto;
import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.exception.EmailAlreadyExistsException;
import cz.splithappens.exception.UserNotFoundException;
import cz.splithappens.exception.UserNotSettledException;
import cz.splithappens.mapper.BankAccountMapper;
import cz.splithappens.mapper.UserMapper;
import cz.splithappens.model.BankAccount;
import cz.splithappens.model.User;
import cz.splithappens.repository.DebtRepository;
import cz.splithappens.repository.TransactionItemRepository;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.GroupService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private BankAccountMapper bankAccountMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private DebtRepository debtRepository;
    @Mock private GroupService groupService;
    @Mock private TransactionItemRepository transactionItemRepository;

    @InjectMocks private UserServiceImpl userService;

    @Captor private ArgumentCaptor<User> userCaptor;

    @Test
    void createUser_whenEmailAlreadyExists_throws() {
        UserCreateDto dto = createUserDto("a@b.com");
        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_happyPath_mapsAndEncodesPassword_assignsBankAccount_andSaves() {
        UserCreateDto dto = createUserDto("a@b.com");

        User mappedUser = new User();
        BankAccount mappedAccount = new BankAccount();

        when(userRepository.findByEmail("a@b.com")).thenReturn(Optional.empty());
        when(userMapper.toEntity(dto)).thenReturn(mappedUser);
        when(bankAccountMapper.toEntity(dto.getBankAccount())).thenReturn(mappedAccount);
        when(passwordEncoder.encode("secret123")).thenReturn("HASH");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        UserDto response = new UserDto();
        when(userMapper.toDto(any(User.class))).thenReturn(response);

        UserDto result = userService.createUser(dto);

        assertThat(result).isSameAs(response);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getPasswordHash()).isEqualTo("HASH");
        assertThat(saved.getBankAccount()).isSameAs(mappedAccount);
        assertThat(mappedAccount.getUser()).isSameAs(saved);
    }

    @Test
    void findById_delegatesToRepository() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User()));
        assertThat(userService.findById(1L)).isPresent();
        verify(userRepository).findById(1L);
    }

    @Test
    void findByEmail_delegatesToRepository() {
        when(userRepository.findByEmail("x@y.com")).thenReturn(Optional.of(new User()));
        assertThat(userService.findByEmail("x@y.com")).isPresent();
        verify(userRepository).findByEmail("x@y.com");
    }

    @Test
    void searchUsers_mapsToDtos_andUsesLimit() {
        User u1 = new User();
        User u2 = new User();
        when(userRepository.searchUsers(eq("jan"), any())).thenReturn(List.of(u1, u2));

        UserDto d1 = new UserDto();
        UserDto d2 = new UserDto();
        when(userMapper.toDto(u1)).thenReturn(d1);
        when(userMapper.toDto(u2)).thenReturn(d2);

        List<UserDto> result = userService.searchUsers("jan", 5);

        assertThat(result).containsExactly(d1, d2);
        verify(userRepository).searchUsers(eq("jan"), argThat(p -> p.getPageSize() == 5));
    }

    @Test
    void updateProfile_userNotFound_throws() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateProfile(1L, createUserDto("a@b.com")))
                .isInstanceOf(UserNotFoundException.class);

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateProfile_happyPath_updatesNames_andCreatesBankAccountIfMissing() {
        User existing = new User();
        existing.setId(1L);
        existing.setFirstName("Old");
        existing.setLastName("Name");
        existing.setBankAccount(null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

        UserCreateDto updateDto = createUserDto("ignored@x.com");
        updateDto.setFirstName("New");
        updateDto.setLastName("Surname");
        updateDto.setBankAccount(bankAccountDto("19", "123", "0800"));

        BankAccount mappedAccount = new BankAccount();
        when(bankAccountMapper.toEntity(updateDto.getBankAccount())).thenReturn(mappedAccount);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        UserDto response = new UserDto();
        when(userMapper.toDto(any(User.class))).thenReturn(response);

        UserDto result = userService.updateProfile(1L, updateDto);

        assertThat(result).isSameAs(response);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getFirstName()).isEqualTo("New");
        assertThat(saved.getLastName()).isEqualTo("Surname");
        assertThat(saved.getBankAccount()).isSameAs(mappedAccount);
        assertThat(mappedAccount.getUser()).isSameAs(saved);
    }

    @Test
    void updateProfile_happyPath_updatesExistingBankAccountFields() {
        User existing = new User();
        existing.setId(1L);
        BankAccount account = new BankAccount();
        account.setPrefix("00");
        account.setAccountNumber("111");
        account.setBankCode("0100");
        existing.assignBankAccount(account);

        when(userRepository.findById(1L)).thenReturn(Optional.of(existing));

        UserCreateDto updateDto = createUserDto("ignored@x.com");
        updateDto.setFirstName("New");
        updateDto.setLastName("Surname");
        updateDto.setBankAccount(bankAccountDto("19", "123", "0800"));

        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userMapper.toDto(any(User.class))).thenReturn(new UserDto());

        userService.updateProfile(1L, updateDto);

        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getBankAccount().getPrefix()).isEqualTo("19");
        assertThat(saved.getBankAccount().getAccountNumber()).isEqualTo("123");
        assertThat(saved.getBankAccount().getBankCode()).isEqualTo("0800");
    }

    @Test
    void deleteUser_userNotFound_throws() {
        when(userRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(UserNotFoundException.class);

        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void deleteUser_happyPath_deletesUser() {
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(groupService).leaveAllGroups(1L);
        when(transactionItemRepository.findByUserId(1L)).thenReturn(List.of());

        userService.deleteUser(1L);

        verify(userRepository).deleteById(1L);
    }

    private static UserCreateDto createUserDto(String email) {
        UserCreateDto dto = new UserCreateDto();
        dto.setFirstName("Jan");
        dto.setLastName("Novak");
        dto.setEmail(email);
        dto.setPassword("secret123");
        dto.setBankAccount(bankAccountDto("", "123", "0800"));
        return dto;
    }

    private static BankAccountCreateDto bankAccountDto(String prefix, String accountNumber, String bankCode) {
        BankAccountCreateDto dto = new BankAccountCreateDto();
        dto.setPrefix(prefix);
        dto.setAccountNumber(accountNumber);
        dto.setBankCode(bankCode);
        return dto;
    }
}

