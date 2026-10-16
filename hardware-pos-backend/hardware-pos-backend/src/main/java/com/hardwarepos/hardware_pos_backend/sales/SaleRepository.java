package com.hardwarepos.hardware_pos_backend.sales;

import com.hardwarepos.hardware_pos_backend.user.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    List<Sale> findAllByOrderByCreatedAtDesc();

    List<Sale> findByCashier(AppUser cashier);

    List<Sale> findByStatus(SaleStatus status);

    /**
     * Retrieves a paginated slice of sales filtered within a start and end timestamp.
     * When passing Pageable, Spring Data JPA automatically appends SQL:
     *   WHERE created_at BETWEEN ? AND ?
     *   ORDER BY created_at DESC, id DESC
     *   LIMIT ? OFFSET ?
     * and performs a companion COUNT(*) query for totalElements.
     */
    Page<Sale> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
