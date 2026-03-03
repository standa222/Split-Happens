package cz.splithappens.mapper;

import cz.splithappens.dto.response.DebtDto;
import cz.splithappens.model.Debt;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface DebtMapper {
    DebtDto toDto(Debt debt);
    List<DebtDto> toDtoList(List<Debt> debts);
}
