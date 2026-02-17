package cz.splithappens.dto.request;

import cz.splithappens.model.enums.TransactionType;

import java.math.BigDecimal;
import java.util.List;

public class TransactionCreateDto {
    private String title;
    private BigDecimal totalAmount;
    private TransactionType type;
    private List<TransactionItemCreateDto> items;
}
