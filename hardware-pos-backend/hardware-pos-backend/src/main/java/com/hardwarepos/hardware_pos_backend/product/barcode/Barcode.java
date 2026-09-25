package com.hardwarepos.hardware_pos_backend.product.barcode;

import com.hardwarepos.hardware_pos_backend.product.Product;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "barcodes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_barcode_value",
                        columnNames = "barcode_value"
                )
        },

        indexes = {
                @Index(
                        name = "idx_barcode_value",
                        columnList = "barcode_value"
                ),
                @Index(
                        name = "idx_barcode_product",
                        columnList = "product_id"
                )
        }
)
public class Barcode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    private Product product;

    @Column(
            name = "barcode_value",
            nullable = false,
            length = 64
    )
    private String barcodeValue;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "barcode_type",
            nullable = false,
            length = 20
    )
    private BarcodeType barcodeType;

    @Column(
            name = "is_primary",
            nullable = false
    )
    private boolean primary = false;

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

    public Barcode() {
    }

    public Barcode(
            Product product,
            String barcodeValue,
            BarcodeType barcodeType,
            boolean primary
    ) {
        this.product = product;
        this.barcodeValue = barcodeValue;
        this.barcodeType = barcodeType;
        this.primary = primary;
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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
