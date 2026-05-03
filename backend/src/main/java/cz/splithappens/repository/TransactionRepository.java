package cz.splithappens.repository;

import cz.splithappens.model.Transaction;
import cz.splithappens.model.enums.ExpenseCategory;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
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

    interface CategoryTotalProjection {
        ExpenseCategory getCategory();
        BigDecimal getTotal();
    }
}
