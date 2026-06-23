package com.hardwarepos.hardware_pos_backend.brand;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BrandRepository
        extends JpaRepository<Brand, Long> {

    boolean existsByNameIgnoreCase(String name);
}