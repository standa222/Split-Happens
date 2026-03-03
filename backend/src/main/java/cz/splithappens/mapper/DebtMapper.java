package cz.splithappens.mapper;

import cz.splithappens.dto.response.DebtDto;
import cz.splithappens.model.Debt;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface DebtMapper {

    DebtDto toDto(Debt debt);
}
