package cz.splithappens.repository;

import cz.splithappens.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByGroupId(Long groupId);
    List<Transaction> findByGroupIdOrderByCreatedAtDesc(Long groupId);
}
