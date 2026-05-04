package cz.splithappens.repository;

import cz.splithappens.model.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionItemRepository extends JpaRepository<TransactionItem, Long> {
    List<TransactionItem> findByUserId(Long userId);
    void deleteByTransactionId(Long transactionId);
}
