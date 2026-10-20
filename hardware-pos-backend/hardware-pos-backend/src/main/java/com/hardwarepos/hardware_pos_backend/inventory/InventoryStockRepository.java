package com.hardwarepos.hardware_pos_backend.inventory;

import com.hardwarepos.hardware_pos_backend.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface InventoryStockRepository
        extends JpaRepository<InventoryStock, Long> {

    Optional<InventoryStock> findByProduct(Product product);

    @Query("""
        SELECT s FROM InventoryStock s
        JOIN s.product p
        WHERE p.active = true
          AND (
              :search IS NULL OR :search = '' OR
              LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
              LOWER(p.productCode) LIKE LOWER(CONCAT('%', :search, '%')) OR
              LOWER(COALESCE(p.barcode, '')) LIKE LOWER(CONCAT('%', :search, '%'))
          )
          AND (
              :status = 'ALL' OR
              (:status = 'LOW_STOCK' AND s.quantityOnHand <= p.reorderLevel AND s.quantityOnHand > 0) OR
              (:status = 'OUT_OF_STOCK' AND s.quantityOnHand <= 0) OR
              (:status = 'IN_STOCK' AND s.quantityOnHand > p.reorderLevel)
          )
    """)
    Page<InventoryStock> findInventoryWithFilters(
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("SELECT COUNT(s) FROM InventoryStock s WHERE s.product.active = true")
    long countActiveProducts();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand), 0) FROM InventoryStock s WHERE s.product.active = true")
    BigDecimal sumTotalStockUnits();

    @Query("SELECT COALESCE(SUM(s.quantityOnHand * s.product.purchasePrice), 0) FROM InventoryStock s WHERE s.product.active = true")
    BigDecimal sumTotalValuation();

    @Query("SELECT COUNT(s) FROM InventoryStock s WHERE s.product.active = true AND s.quantityOnHand <= s.product.reorderLevel AND s.quantityOnHand > 0")
    long countLowStock();

    @Query("SELECT COUNT(s) FROM InventoryStock s WHERE s.product.active = true AND s.quantityOnHand <= 0")
    long countOutOfStock();
}
