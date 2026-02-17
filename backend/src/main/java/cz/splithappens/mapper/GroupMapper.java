package cz.splithappens.mapper;

import cz.splithappens.dto.request.GroupCreateDto;
import cz.splithappens.dto.response.GroupDto;
import cz.splithappens.model.Group;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface GroupMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "members", ignore = true)
    Group toEntity(GroupCreateDto createDto);

    GroupDto toDto(Group group);
}
