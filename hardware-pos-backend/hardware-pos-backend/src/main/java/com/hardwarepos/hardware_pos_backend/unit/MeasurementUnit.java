package com.hardwarepos.hardware_pos_backend.unit;

import jakarta.persistence.*;

@Entity
@Table(name = "units")
public class MeasurementUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String symbol;

    @Column(name = "allow_decimal", nullable = false)
    private boolean allowDecimal;

    @Column(nullable = false)
    private boolean active = true;

    public MeasurementUnit() {
    }

    public MeasurementUnit(
            String name,
            String symbol,
            boolean allowDecimal
    ) {
        this.name = name;
        this.symbol = symbol;
        this.allowDecimal = allowDecimal;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public boolean isAllowDecimal() {
        return allowDecimal;
    }

    public void setAllowDecimal(boolean allowDecimal) {
        this.allowDecimal = allowDecimal;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}