package cz.splithappens.mapper;

import cz.splithappens.dto.response.FriendRequestDto;
import cz.splithappens.model.FriendRequest;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface FriendRequestMapper {
    FriendRequestDto toDto(FriendRequest fr);
}

