package com.hardwarepos.hardware_pos_backend.product.barcode;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BarcodeRepository
        extends JpaRepository<Barcode, Long> {

    boolean existsByBarcodeValue(String barcodeValue);

    List<Barcode> findByProductId(Long productId);

    Optional<Barcode> findByBarcodeValue(String barcodeValue);

    Optional<Barcode> findByProductIdAndPrimaryTrue(Long productId);

    boolean existsByProductIdAndPrimaryTrue(Long productId);
}
