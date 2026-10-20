package com.hardwarepos.hardware_pos_backend.inventory;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockTransactionRepository
        extends JpaRepository<StockTransaction, Long> {

    Page<StockTransaction> findByProductId(Long productId, Pageable pageable);
}
