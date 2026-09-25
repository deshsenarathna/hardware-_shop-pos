package com.hardwarepos.hardware_pos_backend.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {

    private final Long id;
    private final String productCode;
    private final String name;
    private final String description;

    private final Long categoryId;
    private final String categoryName;

    private final Long brandId;
    private final String brandName;

    private final Long unitId;
    private final String unitName;
    private final String unitSymbol;
    private final boolean allowDecimal;

    private final BigDecimal purchasePrice;
    private final BigDecimal sellingPrice;
    private final BigDecimal reorderLevel;
    private final String location;

    private final boolean active;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private final String barcode;

    public ProductResponse(
            Long id,
            String productCode,
            String name,
            String description,
            Long categoryId,
            String categoryName,
            Long brandId,
            String brandName,
            Long unitId,
            String unitName,
            String unitSymbol,
            boolean allowDecimal,
            BigDecimal purchasePrice,
            BigDecimal sellingPrice,
            BigDecimal reorderLevel,
            String location,
            boolean active,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String barcode

    ) {
        this.id = id;
        this.productCode = productCode;
        this.name = name;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.brandId = brandId;
        this.brandName = brandName;
        this.unitId = unitId;
        this.unitName = unitName;
        this.unitSymbol = unitSymbol;
        this.allowDecimal = allowDecimal;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.reorderLevel = reorderLevel;
        this.location = location;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.barcode = barcode;

    }

    public Long getId() {
        return id;
    }

    public String getProductCode() {
        return productCode;
    }

    public String getBarcode() {
        return barcode;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public Long getBrandId() {
        return brandId;
    }

    public String getBrandName() {
        return brandName;
    }

    public Long getUnitId() {
        return unitId;
    }

    public String getUnitName() {
        return unitName;
    }

    public String getUnitSymbol() {
        return unitSymbol;
    }

    public boolean isAllowDecimal() {
        return allowDecimal;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public String getLocation() {
        return location;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}