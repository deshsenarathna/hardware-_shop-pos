package com.hardwarepos.hardware_pos_backend.product.barcode;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AddBarcodeRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Barcode value is required")
    @Size(max = 64, message = "Barcode value cannot exceed 64 characters")
    private String barcodeValue;

    private BarcodeType barcodeType = BarcodeType.EXTERNAL;

    private boolean primary = false;

    public AddBarcodeRequest() {
    }

    public AddBarcodeRequest(Long productId, String barcodeValue, BarcodeType barcodeType, boolean primary) {
        this.productId = productId;
        this.barcodeValue = barcodeValue;
        this.barcodeType = barcodeType;
        this.primary = primary;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getBarcodeValue() {
        return barcodeValue;
    }

    public void setBarcodeValue(String barcodeValue) {
        this.barcodeValue = barcodeValue;
    }

    public BarcodeType getBarcodeType() {
        return barcodeType;
    }

    public void setBarcodeType(BarcodeType barcodeType) {
        this.barcodeType = barcodeType;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
    }
}
