package cz.splithappens.mapper;

import cz.splithappens.dto.request.TransactionCreateDto;
import cz.splithappens.dto.request.TransactionItemCreateDto;
import cz.splithappens.dto.response.TransactionDto;
import cz.splithappens.dto.response.TransactionItemDto;
import cz.splithappens.model.Transaction;
import cz.splithappens.model.TransactionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(source = "groupId", target = "group.id")
    @Mapping(target = "createdAt", ignore = true)
    Transaction toEntity(TransactionCreateDto createDto);

    TransactionDto toDto(Transaction transaction);

    @Mapping(target = "id", ignore = true)
    @Mapping(source = "transactionId", target = "transaction.id")
    @Mapping(source = "userId", target = "user.id")
    TransactionItem toItemEntity(TransactionItemCreateDto itemCreateDto);

    @Mapping(source = "user.id", target = "userId")
    TransactionItemDto toItemDto(TransactionItem transactionItem);
}
