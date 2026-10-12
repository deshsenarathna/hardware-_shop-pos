package com.hardwarepos.hardware_pos_backend.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalePaymentRepository extends JpaRepository<SalePayment, Long> {

    List<SalePayment> findBySale(Sale sale);

    List<SalePayment> findBySaleId(Long saleId);
}
