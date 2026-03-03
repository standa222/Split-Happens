package cz.splithappens.mapper;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.dto.response.GroupLightDto;
import cz.splithappens.model.Group;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class, DebtMapper.class})
public interface GroupMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    Group toEntity(GroupCreateDto createDto);

    @Mapping(target = "transactions", ignore = true)
    GroupDto toDto(Group group);

    @Mapping(target = "userDebts", ignore = true)
    GroupLightDto toLightDto(Group group);
}
