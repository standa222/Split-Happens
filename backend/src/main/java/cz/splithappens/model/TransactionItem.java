package cz.splithappens.model;

import jakarta.persistence.*;
import lombok.*;

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
    private User user;

    @Column(nullable = false)
    private BigDecimal balanceChange; // Positive for payers, negative for participants

    public TransactionItem(User user, Transaction transaction, BigDecimal balanceChange) {
        this.user = user;
        this.transaction = transaction;
        this.balanceChange = balanceChange;
    }
}
