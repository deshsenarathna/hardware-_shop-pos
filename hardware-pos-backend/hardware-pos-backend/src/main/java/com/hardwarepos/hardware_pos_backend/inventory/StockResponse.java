package com.hardwarepos.hardware_pos_backend.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockResponse {

    private Long productId;
    private String productCode;
    private String productName;
    private BigDecimal quantityOnHand;
    private LocalDateTime updatedAt;

    public StockResponse() {
    }

    public StockResponse(InventoryStock stock) {
        this.productId = stock.getProduct().getId();
        this.productCode = stock.getProduct().getProductCode();
        this.productName = stock.getProduct().getName();
        this.quantityOnHand = stock.getQuantityOnHand();
        this.updatedAt = stock.getUpdatedAt();
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductCode() {
        return productCode;
    }

    public String getProductName() {
        return productName;
    }

    public BigDecimal getQuantityOnHand() {
        return quantityOnHand;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}