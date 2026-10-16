package com.hardwarepos.hardware_pos_backend.supplier;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    boolean existsBySupplierCodeIgnoreCase(String supplierCode);

    boolean existsBySupplierCodeIgnoreCaseAndIdNot(String supplierCode, Long id);

    Page<Supplier> findByNameContainingIgnoreCaseOrSupplierCodeContainingIgnoreCase(
            String name,
            String supplierCode,
            Pageable pageable
    );
}
