package cz.splithappens.service.impl;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.mapper.UserMapper;
import cz.splithappens.model.User;
import cz.splithappens.repository.UserRepository;
import cz.splithappens.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDto registerUser(UserCreateDto createDto) {
        if (userRepository.findByEmail(createDto.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists"); // TODO custom exception
        }
        User user = userMapper.toEntity(createDto);
        user.setPasswordHash(passwordEncoder.encode(createDto.getPassword()));
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public UserDto getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new RuntimeException("User not found")); // TODO custom exception
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
