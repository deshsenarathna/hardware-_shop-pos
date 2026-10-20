package com.hardwarepos.hardware_pos_backend.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AdjustStockRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Adjustment type is required (ADJUSTMENT_ADD or ADJUSTMENT_REMOVE)")
    private StockTransactionType adjustmentType;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", inclusive = true, message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotBlank(message = "Reason is required (e.g. DAMAGED, EXPIRED, AUDIT_CORRECTION, INTERNAL_USE)")
    private String reason;

    private String notes;

    public AdjustStockRequest() {
    }

    public AdjustStockRequest(Long productId, StockTransactionType adjustmentType, BigDecimal quantity, String reason, String notes) {
        this.productId = productId;
        this.adjustmentType = adjustmentType;
        this.quantity = quantity;
        this.reason = reason;
        this.notes = notes;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public StockTransactionType getAdjustmentType() {
        return adjustmentType;
    }

    public void setAdjustmentType(StockTransactionType adjustmentType) {
        this.adjustmentType = adjustmentType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
