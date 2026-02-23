package cz.splithappens.dto.request;

import cz.splithappens.model.enums.TransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TransactionCreateDto {
    private String title;
    private Long groupId;
    private BigDecimal totalAmount;
    private TransactionType type;
    private List<TransactionItemCreateDto> items;
}
