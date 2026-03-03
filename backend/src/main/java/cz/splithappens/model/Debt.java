package cz.splithappens.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "debt")
public class Debt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "debtor", nullable = false)
    private User debtor;

    @Column(name = "creditor", nullable = false)
    private User creditor;
}
