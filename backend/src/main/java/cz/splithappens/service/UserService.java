package cz.splithappens.service;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.model.User;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDto createUser(UserCreateDto createDto);
    Optional<User> findById(Long id);
//    UserDto updateProfile(Long id, UserUpdateDto updateDto);
    Optional<User> findByEmail(String email);
    List<UserDto> searchUsers(String query, int limit);
}
