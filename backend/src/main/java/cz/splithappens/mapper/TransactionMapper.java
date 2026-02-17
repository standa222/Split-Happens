package cz.splithappens.mapper;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.model.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    @Mapping(target = "id", ignore = true)
    Transaction toEntity(TransactionCreateDto createDto);

    TransactionDto toDto(Transaction transaction);
}
