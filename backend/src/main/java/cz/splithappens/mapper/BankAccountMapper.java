package cz.splithappens.mapper;

import cz.splithappens.dto.request.BankAccountCreateDto;
import cz.splithappens.dto.response.BankAccountDto;
import cz.splithappens.model.BankAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BankAccountMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    BankAccount toEntity(BankAccountCreateDto createDto);

    BankAccountDto toDto(BankAccount bankAccount);
}
