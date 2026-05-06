package cz.splithappens.model;

import cz.splithappens.model.enums.Currency;
import cz.splithappens.model.enums.ExpenseCategory;
import cz.splithappens.model.enums.TransactionSplitMode;
import cz.splithappens.model.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "\"transaction\"")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group group;

    private String title;
    // TODO add default currency total amount when multi currency support is implemented
    private BigDecimal totalAmount;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "paid_by_mode", nullable = false)
    private TransactionSplitMode paidByMode;

    @Enumerated(EnumType.STRING)
    @Column(name = "split_between_mode", nullable = false)
    private TransactionSplitMode splitBetweenMode;

    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransactionItem> items;

    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Enumerated(EnumType.STRING)
    private ExpenseCategory expenseCategory;
}
