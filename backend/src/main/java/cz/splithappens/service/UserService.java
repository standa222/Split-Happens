package cz.splithappens.service;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.model.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface UserService {
    UserDto createUser(UserCreateDto createDto);
    Optional<User> findById(Long id);
    UserDto updateProfile(Long id, UserCreateDto updateDto);
    Optional<User> findByEmail(String email);
    List<UserDto> searchUsers(String query, int limit);
    List<UserDto> getAllUsersAdmin(User user, int limit);
    byte[] getUserImage(Long userId);
    void uploadUserImage(Long userId, MultipartFile imageData) throws IOException;
}
