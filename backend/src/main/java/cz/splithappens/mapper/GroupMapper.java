package cz.splithappens.mapper;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.dto.response.UserDto;
import cz.splithappens.model.Group;
import cz.splithappens.model.User;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {UserMapper.class, DebtMapper.class})
public interface GroupMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "lastActivity", ignore = true)
    @Mapping(target = "groupImage", ignore = true)
    Group toEntity(GroupCreateDto createDto);

    @Mapping(target = "transactions", ignore = true)
    @Mapping(target = "debts", ignore = true)
    GroupDto toDto(Group group, @Context User currentUser);

    @Mapping(target = "userDebts", ignore = true)
    GroupLightDto toLightDto(Group group);

    @AfterMapping
    default void orderMembersForDto(@MappingTarget GroupDto groupDto, @Context User currentUser) {
        if (groupDto.getMembers() != null && currentUser != null) {
            UserDto me = groupDto.getMembers().stream()
                    .filter(m -> m.getId().equals(currentUser.getId()))
                    .findFirst()
                    .orElse(null);

            if (me != null) {
                groupDto.getMembers().remove(me);
                groupDto.getMembers().addFirst(me);
            }
        }
    }
}
