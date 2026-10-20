package com.hardwarepos.hardware_pos_backend.inventory;

import java.math.BigDecimal;

public class InventoryMetricsResponse {

    private final long totalProducts;
    private final BigDecimal totalStockUnits;
    private final BigDecimal totalInventoryValuation;
    private final long lowStockCount;
    private final long outOfStockCount;

    public InventoryMetricsResponse(
            long totalProducts,
            BigDecimal totalStockUnits,
            BigDecimal totalInventoryValuation,
            long lowStockCount,
            long outOfStockCount
    ) {
        this.totalProducts = totalProducts;
        this.totalStockUnits = totalStockUnits != null ? totalStockUnits : BigDecimal.ZERO;
        this.totalInventoryValuation = totalInventoryValuation != null ? totalInventoryValuation : BigDecimal.ZERO;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public BigDecimal getTotalStockUnits() {
        return totalStockUnits;
    }

    public BigDecimal getTotalInventoryValuation() {
        return totalInventoryValuation;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public long getOutOfStockCount() {
        return outOfStockCount;
    }
}
