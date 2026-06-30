package com.hardwarepos.hardware_pos_backend.product;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<Product, Long> {

    boolean existsByProductCodeIgnoreCase(String productCode);

    boolean existsByProductCodeIgnoreCaseAndIdNot( String productCode, Long id );
}

