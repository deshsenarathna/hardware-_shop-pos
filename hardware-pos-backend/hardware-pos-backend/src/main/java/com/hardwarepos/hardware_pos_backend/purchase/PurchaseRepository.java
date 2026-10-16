package com.hardwarepos.hardware_pos_backend.purchase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    boolean existsBySupplierId(Long supplierId);

    boolean existsByPurchaseNumberIgnoreCase(String purchaseNumber);

    Optional<Purchase> findByPurchaseNumber(String purchaseNumber);

    Page<Purchase> findBySupplierId(Long supplierId, Pageable pageable);

    long countBySupplierIdAndStatus(Long supplierId, PurchaseStatus status);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM Purchase p WHERE p.supplier.id = :supplierId AND p.status = :status")
    BigDecimal sumTotalAmountBySupplierIdAndStatus(
            @Param("supplierId") Long supplierId,
            @Param("status") PurchaseStatus status
    );

    Page<Purchase> findByPurchaseDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Purchase> findBySupplierIdAndPurchaseDateBetween(Long supplierId, LocalDate startDate, LocalDate endDate, Pageable pageable);

    Page<Purchase> findByPaymentStatus(PurchasePaymentStatus paymentStatus, Pageable pageable);
}
