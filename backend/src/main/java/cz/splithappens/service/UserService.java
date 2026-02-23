package cz.splithappens.service;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.model.User;

import java.util.Optional;

public interface UserService {
    UserDto registerUser(UserCreateDto createDto);
    UserDto getUserById(Long id);
//    UserDto updateProfile(Long id, UserUpdateDto updateDto);
    Optional<User> findByEmail(String email);
}
