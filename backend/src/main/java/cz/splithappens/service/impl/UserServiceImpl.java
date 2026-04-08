package cz.splithappens.service.impl;

import cz.splithappens.dto.request.BankAccountCreateDto;
import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.exception.EmailAlreadyExistsException;
import cz.splithappens.exception.UserNotFoundException;
import cz.splithappens.mapper.BankAccountMapper;
import cz.splithappens.mapper.UserMapper;
import cz.splithappens.model.BankAccount;
import cz.splithappens.model.User;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BankAccountMapper bankAccountMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDto createUser(UserCreateDto createDto) {
        if (userRepository.findByEmail(createDto.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(createDto.getEmail());
        }
        User user = userMapper.toEntity(createDto);
        BankAccount account = bankAccountMapper.toEntity(createDto.getBankAccount());
        user.assignBankAccount(account);
        user.setPasswordHash(passwordEncoder.encode(createDto.getPassword()));
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public UserDto updateProfile(Long id, UserCreateDto updateDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        user.setFirstName(updateDto.getFirstName());
        user.setLastName(updateDto.getLastName());
        // TODO: think about updating email and password
        updateBankAccount(user, updateDto.getBankAccount());
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    @Transactional
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<UserDto> searchUsers(String query, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<User> users = userRepository.searchUsers(query, pageable);
        return users.stream()
                .map(userMapper::toDto)
                .toList();
    }

    private void updateBankAccount(User user, BankAccountCreateDto bankAccountDto) {
        BankAccount account = user.getBankAccount();
        if (account == null) {
            account = bankAccountMapper.toEntity(bankAccountDto);
            user.assignBankAccount(account);
        } else {
            account.setPrefix(bankAccountDto.getPrefix());
            account.setAccountNumber(bankAccountDto.getAccountNumber());
            account.setBankCode(bankAccountDto.getBankCode());
        }
    }
}
