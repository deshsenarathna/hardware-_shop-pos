package com.hardwarepos.hardware_pos_backend.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class UpdateProductRequest {

    @NotBlank(message = "Product code is required")
    @Size(
            max = 50,
            message = "Product code cannot exceed 50 characters"
    )
    private String productCode;

    @NotBlank(message = "Product name is required")
    @Size(
            max = 150,
            message = "Product name cannot exceed 150 characters"
    )
    private String name;

    @Size(
            max = 500,
            message = "Description cannot exceed 500 characters"
    )
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long brandId;

    @NotNull(message = "Measurement unit is required")
    private Long unitId;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Purchase price cannot be negative"
    )
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(
            value = "0.00",
            inclusive = true,
            message = "Selling price cannot be negative"
    )
    private BigDecimal sellingPrice;

    @NotNull(message = "Reorder level is required")
    @DecimalMin(
            value = "0.000",
            inclusive = true,
            message = "Reorder level cannot be negative"
    )
    private BigDecimal reorderLevel;

    public UpdateProductRequest() {
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getBrandId() {
        return brandId;
    }

    public void setBrandId(Long brandId) {
        this.brandId = brandId;
    }

    public Long getUnitId() {
        return unitId;
    }

    public void setUnitId(Long unitId) {
        this.unitId = unitId;
    }

    public BigDecimal getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(BigDecimal purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public BigDecimal getSellingPrice() {
        return sellingPrice;
    }

    public void setSellingPrice(BigDecimal sellingPrice) {
        this.sellingPrice = sellingPrice;
    }

    public BigDecimal getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(BigDecimal reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
}
