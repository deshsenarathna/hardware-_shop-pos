package com.hardwarepos.hardware_pos_backend.purchase.dto;

import com.hardwarepos.hardware_pos_backend.purchase.PurchaseItem;

import java.math.BigDecimal;

public class PurchaseItemResponse {

    private final Long id;
    private final Long productId;
    private final String productCode;
    private final String productName;
    private final String unitName;
    private final BigDecimal quantity;
    private final BigDecimal purchaseCost;
    private final BigDecimal lineTotal;

    public PurchaseItemResponse(PurchaseItem item) {
        this.id = item.getId();
        this.productId = item.getProduct() != null ? item.getProduct().getId() : null;
        this.productCode = item.getProductCode();
        this.productName = item.getProductName();
        this.unitName = item.getUnitName();
        this.quantity = item.getQuantity();
        this.purchaseCost = item.getPurchaseCost();
        this.lineTotal = item.getLineTotal();
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

    public String getUnitName() {
        return unitName;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public BigDecimal getPurchaseCost() {
        return purchaseCost;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }
}
