package com.hardwarepos.hardware_pos_backend.unit;

public class MeasurementUnitResponse {

    private final Long id;
    private final String name;
    private final String symbol;
    private final boolean allowDecimal;
    private final boolean active;

    public MeasurementUnitResponse(
            Long id,
            String name,
            String symbol,
            boolean allowDecimal,
            boolean active
    ) {
        this.id = id;
        this.name = name;
        this.symbol = symbol;
        this.allowDecimal = allowDecimal;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSymbol() {
        return symbol;
    }

    public boolean isAllowDecimal() {
        return allowDecimal;
    }

    public boolean isActive() {
        return active;
    }
}