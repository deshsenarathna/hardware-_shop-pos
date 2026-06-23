package com.hardwarepos.hardware_pos_backend.unit;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MeasurementUnitRepository
        extends JpaRepository<MeasurementUnit, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsBySymbolIgnoreCase(String symbol);
}