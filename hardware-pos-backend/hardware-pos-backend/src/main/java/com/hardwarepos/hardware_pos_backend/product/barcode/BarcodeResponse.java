package com.hardwarepos.hardware_pos_backend.product.barcode;

import java.time.LocalDateTime;

public class BarcodeResponse {

    private final Long id;
    private final Long productId;
    private final String productCode;
    private final String productName;
    private final String barcodeValue;
    private final BarcodeType barcodeType;
    private final boolean primary;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public BarcodeResponse(Barcode barcode) {
        this.id = barcode.getId();
        this.productId = barcode.getProduct().getId();
        this.productCode = barcode.getProduct().getProductCode();
        this.productName = barcode.getProduct().getName();
        this.barcodeValue = barcode.getBarcodeValue();
        this.barcodeType = barcode.getBarcodeType();
        this.primary = barcode.isPrimary();
        this.createdAt = barcode.getCreatedAt();
        this.updatedAt = barcode.getUpdatedAt();
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

    public String getBarcodeValue() {
        return barcodeValue;
    }

    public BarcodeType getBarcodeType() {
        return barcodeType;
    }

    public boolean isPrimary() {
        return primary;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
