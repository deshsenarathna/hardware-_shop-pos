package com.hardwarepos.hardware_pos_backend.sales;

import java.math.BigDecimal;

public class SaleItemResponse {

    private final Long id;
    private final Long productId;
    private final String productCode;
    private final String productName;
    private final String unitName;
    private final BigDecimal quantity;
    private final BigDecimal unitPrice;
    private final BigDecimal totalPrice;

    public SaleItemResponse(
            Long id,
            Long productId,
            String productCode,
            String productName,
            String unitName,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal totalPrice
    ) {
        this.id = id;
        this.productId = productId;
        this.productCode = productCode;
        this.productName = productName;
        this.unitName = unitName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
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

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }
}
