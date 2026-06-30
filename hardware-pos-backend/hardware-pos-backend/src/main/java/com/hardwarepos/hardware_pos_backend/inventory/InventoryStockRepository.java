package com.hardwarepos.hardware_pos_backend.inventory;
import com.hardwarepos.hardware_pos_backend.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryStockRepository
        extends JpaRepository<InventoryStock, Long> {

    Optional<InventoryStock> findByProduct(Product product);
}