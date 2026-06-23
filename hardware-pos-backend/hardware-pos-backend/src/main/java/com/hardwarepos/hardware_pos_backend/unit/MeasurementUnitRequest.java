package com.hardwarepos.hardware_pos_backend.unit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class MeasurementUnitRequest {

    @NotBlank(message = "Unit name is required")
    @Size(max = 50, message = "Unit name cannot exceed 50 characters")
    private String name;

    @NotBlank(message = "Unit symbol is required")
    @Size(max = 20, message = "Unit symbol cannot exceed 20 characters")
    private String symbol;

    private boolean allowDecimal;

    public MeasurementUnitRequest() {
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
}