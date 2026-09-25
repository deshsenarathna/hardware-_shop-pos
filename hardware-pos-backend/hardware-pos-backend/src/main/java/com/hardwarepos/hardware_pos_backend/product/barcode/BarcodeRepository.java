package com.hardwarepos.hardware_pos_backend.product.barcode;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BarcodeRepository
        extends JpaRepository<Barcode, Long> {

    boolean existsByBarcodeValue(String barcodeValue);
}