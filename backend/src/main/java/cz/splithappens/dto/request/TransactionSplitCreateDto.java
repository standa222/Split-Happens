package cz.splithappens.dto.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionSplitCreateDto {
    private Long userId;
    private BigDecimal fixed;
    private Integer partial;
    private Integer percentage;
}
