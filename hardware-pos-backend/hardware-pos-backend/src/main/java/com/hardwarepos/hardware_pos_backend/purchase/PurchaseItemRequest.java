package com.hardwarepos.hardware_pos_backend.purchase;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class PurchaseItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", inclusive = true, message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotNull(message = "Purchase cost is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Purchase cost cannot be negative")
    private BigDecimal purchaseCost;

    public PurchaseItemRequest() {
    }

    public PurchaseItemRequest(Long productId, BigDecimal quantity, BigDecimal purchaseCost) {
        this.productId = productId;
        this.quantity = quantity;
        this.purchaseCost = purchaseCost;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(BigDecimal purchaseCost) {
        this.purchaseCost = purchaseCost;
    }
}
