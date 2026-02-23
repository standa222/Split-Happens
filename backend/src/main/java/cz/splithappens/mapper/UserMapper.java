package cz.splithappens.mapper;

import cz.splithappens.dto.request.UserCreateDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "groups", ignore = true)
    @Mapping(target = "friends", ignore = true)
    @Mapping(target = "authorities", ignore = true)
    User toEntity(UserCreateDto createDto);

    UserDto toDto(User user);
}
