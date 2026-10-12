package com.hardwarepos.hardware_pos_backend.sales;

import com.hardwarepos.hardware_pos_backend.user.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    List<Sale> findAllByOrderByCreatedAtDesc();

    List<Sale> findByCashier(AppUser cashier);

    List<Sale> findByStatus(SaleStatus status);
}
