package com.hardwarepos.hardware_pos_backend.inventory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InventoryItemResponse {

    private final Long productId;
    private final String productCode;
    private final String productName;
    private final String barcode;
    private final Long categoryId;
    private final String categoryName;
    private final Long unitId;
    private final String unitName;
    private final String unitSymbol;
    private final String location;
    private final BigDecimal quantityOnHand;
    private final BigDecimal reorderLevel;
    private final BigDecimal purchasePrice;
    private final BigDecimal sellingPrice;
    private final boolean lowStock;
    private final boolean outOfStock;
    private final String stockStatus;
    private final LocalDateTime updatedAt;

    public InventoryItemResponse(
            Long productId,
            String productCode,
            String productName,
            String barcode,
            Long categoryId,
            String categoryName,
            Long unitId,
            String unitName,
            String unitSymbol,
            String location,
            BigDecimal quantityOnHand,
            BigDecimal reorderLevel,
            BigDecimal purchasePrice,
            BigDecimal sellingPrice,
            LocalDateTime updatedAt
    ) {
        this.productId = productId;
        this.productCode = productCode;
        this.productName = productName;
        this.barcode = barcode;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.unitId = unitId;
        this.unitName = unitName;
        this.unitSymbol = unitSymbol;
        this.location = location;
        this.quantityOnHand = quantityOnHand != null ? quantityOnHand : BigDecimal.ZERO;
        this.reorderLevel = reorderLevel != null ? reorderLevel : BigDecimal.ZERO;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.updatedAt = updatedAt;

        BigDecimal currentQty = this.quantityOnHand;
        BigDecimal reorder = this.reorderLevel;

        this.outOfStock = currentQty.compareTo(BigDecimal.ZERO) <= 0;
        this.lowStock = !this.outOfStock && currentQty.compareTo(reorder) <= 0;

        if (this.outOfStock) {
            this.stockStatus = "OUT_OF_STOCK";
        } else if (this.lowStock) {
            this.stockStatus = "LOW_STOCK";
        } else {
            this.stockStatus = "IN_STOCK";
        }
    }

    public InventoryItemResponse(InventoryStock stock) {
        this(
                stock.getProduct().getId(),
                stock.getProduct().getProductCode(),
                stock.getProduct().getName(),
                stock.getProduct().getBarcode(),
                stock.getProduct().getCategory() != null ? stock.getProduct().getCategory().getId() : null,
                stock.getProduct().getCategory() != null ? stock.getProduct().getCategory().getName() : null,
                stock.getProduct().getUnit() != null ? stock.getProduct().getUnit().getId() : null,
                stock.getProduct().getUnit() != null ? stock.getProduct().getUnit().getName() : null,
                stock.getProduct().getUnit() != null ? stock.getProduct().getUnit().getSymbol() : null,
                stock.getProduct().getLocation(),
                stock.getQuantityOnHand(),
                stock.getProduct().getReorderLevel(),
                stock.getProduct().getPurchasePrice(),
                stock.getProduct().getSellingPrice(),
                stock.getUpdatedAt()
        );
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

    public String getBarcode() {
        return barcode;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
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

    public String getLocation() {
        return location;
    }

    public BigDecimal getQuantityOnHand() {
        return quantityOnHand;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public boolean isLowStock() {
        return lowStock;
    }

    public boolean isOutOfStock() {
        return outOfStock;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
