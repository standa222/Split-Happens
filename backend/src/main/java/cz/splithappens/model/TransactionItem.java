package cz.splithappens.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "transaction_item")
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class TransactionItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private User user;

    @Column(nullable = false)
    private BigDecimal balanceChange; // Positive for payers, negative for participants

    @Column(nullable = false)
    private BigDecimal defaultCurrencyBalanceChange; // Balance change converted to group's default currency, used for easier balance calculations

    @Column(nullable = false)
    private BigDecimal filledValue;

    public TransactionItem(User user, Transaction transaction, BigDecimal balanceChange, BigDecimal defaultCurrencyBalanceChange, BigDecimal filledValue) {
        this.user = user;
        this.transaction = transaction;
        this.balanceChange = balanceChange;
        this.defaultCurrencyBalanceChange = defaultCurrencyBalanceChange;
        this.filledValue = filledValue;
    }
}
