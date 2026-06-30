package com.hardwarepos.hardware_pos_backend.inventory;
import com.hardwarepos.hardware_pos_backend.inventory.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockTransactionRepository
        extends JpaRepository<StockTransaction, Long> {
}