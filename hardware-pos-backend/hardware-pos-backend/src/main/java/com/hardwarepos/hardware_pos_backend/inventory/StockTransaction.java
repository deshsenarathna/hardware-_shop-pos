package com.hardwarepos.hardware_pos_backend.inventory;

import com.hardwarepos.hardware_pos_backend.product.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions")
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StockTransactionType type;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityBefore;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityAfter;

    @Column(length = 255)
    private String reference;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public StockTransaction() {
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public StockTransactionType getType() {
        return type;
    }

    public void setType(StockTransactionType type) {
        this.type = type;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getQuantityBefore() {
        return quantityBefore;
    }

    public void setQuantityBefore(BigDecimal quantityBefore) {
        this.quantityBefore = quantityBefore;
    }

    public BigDecimal getQuantityAfter() {
        return quantityAfter;
    }

    public void setQuantityAfter(BigDecimal quantityAfter) {
        this.quantityAfter = quantityAfter;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
