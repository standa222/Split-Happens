package cz.splithappens.repository;

import cz.splithappens.model.Transaction;
import cz.splithappens.model.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByGroupId(Long groupId);
    List<Transaction> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    @Query("""
            select t.expenseCategory as category, sum(t.totalAmount) as total
            from Transaction t
            where t.group.id = :groupId
              and t.transactionType = cz.splithappens.model.enums.TransactionType.EXPENSE
            group by t.expenseCategory
            """)
    List<CategoryTotalProjection> sumExpensesByCategory(@Param("groupId") Long groupId);

    @Query("""
            select date_trunc('month', t.createdAt) as monthDate, sum(t.totalAmount) as total
            from Transaction t
            where t.group.id = :groupId
              and t.transactionType = cz.splithappens.model.enums.TransactionType.EXPENSE
            group by date_trunc('month', t.createdAt)
            order by 1 asc
            """)
    List<MonthTotalProjection> sumExpensesByMonth(@Param("groupId") Long groupId);

    @Query("""
            select ti.user.id as userId, sum(-ti.defaultCurrencyBalanceChange) as total
            from TransactionItem ti
            where ti.transaction.group.id = :groupId
              and ti.transaction.transactionType = cz.splithappens.model.enums.TransactionType.EXPENSE
              and ti.defaultCurrencyBalanceChange < 0
            group by ti.user.id
            order by total desc
            """)
    List<UserTotalProjection> sumUserSpending(@Param("groupId") Long groupId);

    @Query("""
            select ti.user.id as userId, sum(ti.defaultCurrencyBalanceChange) as total
            from TransactionItem ti
            where ti.transaction.group.id = :groupId
              and ti.transaction.transactionType = cz.splithappens.model.enums.TransactionType.EXPENSE
              and ti.defaultCurrencyBalanceChange > 0
            group by ti.user.id
            order by total desc
            """)
    List<UserTotalProjection> sumUserPaying(@Param("groupId") Long groupId);


    interface CategoryTotalProjection {
        ExpenseCategory getCategory();
        BigDecimal getTotal();
    }

    interface MonthTotalProjection {
        OffsetDateTime getMonthDate();
        BigDecimal getTotal();
    }

    interface UserTotalProjection {
        Long getUserId();
        BigDecimal getTotal();
    }
}
