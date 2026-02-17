package cz.splithappens.dto.response;

import cz.splithappens.model.enums.TransactionType;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class TransactionDto {
    private Long id;
    private String title;
    private BigDecimal totalAmount;
    private OffsetDateTime createdAt;
    private TransactionType type;
    private List<TransactionItemDto> items;
}
