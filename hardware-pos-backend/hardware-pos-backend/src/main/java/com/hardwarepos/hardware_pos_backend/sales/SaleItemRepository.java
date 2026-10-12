package com.hardwarepos.hardware_pos_backend.sales;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySale(Sale sale);

    List<SaleItem> findBySaleId(Long saleId);
}
