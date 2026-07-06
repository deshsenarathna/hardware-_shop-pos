package com.hardwarepos.hardware_pos_backend.product;

import com.hardwarepos.hardware_pos_backend.brand.Brand;
import com.hardwarepos.hardware_pos_backend.category.Category;
import com.hardwarepos.hardware_pos_backend.unit.MeasurementUnit;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "products",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_product_code",
                        columnNames = "product_code"
                )
        }
)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "product_code",
            nullable = false,
            length = 50
    )
    private String productCode;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "category_id",
            nullable = false
    )
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "unit_id",
            nullable = false
    )
    private MeasurementUnit unit;

    @Column(
            name = "purchase_price",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal purchasePrice;

    @Column(
            name = "selling_price",
            nullable = false,
            precision = 15,
            scale = 2
    )
    private BigDecimal sellingPrice;

    @Column(
            name = "reorder_level",
            nullable = false,
            precision = 15,
            scale = 3
    )
    private BigDecimal reorderLevel;

    @Column(length = 100)
    private String location;

    @Column(nullable = false)
    private boolean active = true;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    public Product() {
    }

    public Product(
            String productCode,
            String name,
            String description,
            Category category,
            Brand brand,
            MeasurementUnit unit,
            BigDecimal purchasePrice,
            BigDecimal sellingPrice,
            BigDecimal reorderLevel
    ) {
        this.productCode = productCode;
        this.name = name;
        this.description = description;
        this.category = category;
        this.brand = brand;
        this.unit = unit;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.reorderLevel = reorderLevel;
    }

    @PrePersist
    public void beforeInsert() {
        LocalDateTime currentTime = LocalDateTime.now();

        this.createdAt = currentTime;
        this.updatedAt = currentTime;
    }

    @PreUpdate
    public void beforeUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
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

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public MeasurementUnit getUnit() {
        return unit;
    }

    public void setUnit(MeasurementUnit unit) {
        this.unit = unit;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}