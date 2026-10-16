package com.hardwarepos.hardware_pos_backend.product;

import java.math.BigDecimal;

/**
 * Lightweight DTO specifically designed for POS checkout / cashier operations.
 * Excludes sensitive fields (e.g., purchasePrice, audit timestamps, reorder levels).
 */
public class ProductSummaryResponse {

    private final Long id;
    private final String productCode;
    private final String name;
    private final String barcode;
    private final BigDecimal sellingPrice;
    private final String unitName;
    private final String unitSymbol;

    public ProductSummaryResponse(
            Long id,
            String productCode,
            String name,
            String barcode,
            BigDecimal sellingPrice,
            String unitName,
            String unitSymbol
    ) {
        this.id = id;
        this.productCode = productCode;
        this.name = name;
        this.barcode = barcode;
        this.sellingPrice = sellingPrice;
        this.unitName = unitName;
        this.unitSymbol = unitSymbol;
    }

    public ProductSummaryResponse(Product product) {
        this.id = product.getId();
        this.productCode = product.getProductCode();
        this.name = product.getName();
        this.barcode = product.getBarcode();
        this.sellingPrice = product.getSellingPrice();
        this.unitName = product.getUnit() != null ? product.getUnit().getName() : null;
        this.unitSymbol = product.getUnit() != null ? product.getUnit().getSymbol() : null;
    }

    public Long getId() {
        return id;
    }

    public String getProductCode() {
        return productCode;
    }

    public String getName() {
        return name;
    }

    public String getBarcode() {
        return barcode;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public String getUnitName() {
        return unitName;
    }

    public String getUnitSymbol() {
        return unitSymbol;
    }
}
