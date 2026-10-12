package com.hardwarepos.hardware_pos_backend.sales;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class SaleRequestItem {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", inclusive = true, message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    public SaleRequestItem() {
    }

    public SaleRequestItem(Long productId, BigDecimal quantity) {
        this.productId = productId;
        this.quantity = quantity;
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
}
