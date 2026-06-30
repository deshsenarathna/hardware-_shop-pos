 package com.hardwarepos.hardware_pos_backend.inventory;

import com.hardwarepos.hardware_pos_backend.product.Product;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_stock")
public class InventoryStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public InventoryStock() {
    }

    public InventoryStock(Product product) {
        this.product = product;
        this.quantityOnHand = BigDecimal.ZERO;
    }

    @PrePersist
    @PreUpdate
    public void setTimestamp() {
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

    public BigDecimal getQuantityOnHand() {
        return quantityOnHand;
    }

    public void setQuantityOnHand(BigDecimal quantityOnHand) {
        this.quantityOnHand = quantityOnHand;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
