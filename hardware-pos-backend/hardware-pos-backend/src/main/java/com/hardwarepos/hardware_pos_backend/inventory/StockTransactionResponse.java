package com.hardwarepos.hardware_pos_backend.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockTransactionResponse {

    private final Long id;
    private final Long productId;
    private final String productCode;
    private final String productName;
    private final StockTransactionType type;
    private final BigDecimal quantity;
    private final BigDecimal quantityBefore;
    private final BigDecimal quantityAfter;
    private final String reference;
    private final String notes;
    private final LocalDateTime createdAt;

    public StockTransactionResponse(StockTransaction transaction) {
        this.id = transaction.getId();
        this.productId = transaction.getProduct().getId();
        this.productCode = transaction.getProduct().getProductCode();
        this.productName = transaction.getProduct().getName();
        this.type = transaction.getType();
        this.quantity = transaction.getQuantity();
        this.quantityBefore = transaction.getQuantityBefore();
        this.quantityAfter = transaction.getQuantityAfter();
        this.reference = transaction.getReference();
        this.notes = transaction.getNotes();
        this.createdAt = transaction.getCreatedAt();
    }

    public Long getId() {
        return id;
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

    public StockTransactionType getType() {
        return type;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getQuantityBefore() {
        return quantityBefore;
    }

    public BigDecimal getQuantityAfter() {
        return quantityAfter;
    }

    public String getReference() {
        return reference;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
