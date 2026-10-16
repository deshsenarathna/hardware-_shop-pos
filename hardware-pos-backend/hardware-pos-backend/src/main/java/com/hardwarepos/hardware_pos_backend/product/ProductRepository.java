package com.hardwarepos.hardware_pos_backend.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    boolean existsByProductCodeIgnoreCase(String productCode);

    boolean existsByProductCodeIgnoreCaseAndIdNot(String productCode, Long id);

    boolean existsByBarcode(String barcode);

    Page<Product> findByNameContainingIgnoreCaseOrProductCodeContainingIgnoreCase(
            String name,
            String productCode,
            Pageable pageable
    );

    List<Product> findByActiveTrue();
}
