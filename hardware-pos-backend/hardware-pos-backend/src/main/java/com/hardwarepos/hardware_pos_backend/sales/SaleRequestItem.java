package com.hardwarepos.hardware_pos_backend.sales;

import java.math.BigDecimal;

public class SaleRequestItem {

    private Long productId;
    private BigDecimal quantity;

    public SaleRequestItem() {
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