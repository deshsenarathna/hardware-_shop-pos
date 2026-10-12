package com.hardwarepos.hardware_pos_backend.sales;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sale_payments")
public class SalePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @Column(name = "payment_method", nullable = false, length = 30)
    private String paymentMethod;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "tendered_amount", precision = 15, scale = 2)
    private BigDecimal tenderedAmount;

    @Column(name = "change_amount", precision = 15, scale = 2)
    private BigDecimal changeAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status = PaymentStatus.COMPLETED;

    @Column(name = "transaction_reference", length = 100)
    private String transactionReference;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public SalePayment() {}

    public SalePayment(
            Sale sale,
            String paymentMethod,
            BigDecimal amount,
            BigDecimal tenderedAmount,
            BigDecimal changeAmount,
            PaymentStatus status
    ) {
        this.sale = sale;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.tenderedAmount = tenderedAmount;
        this.changeAmount = changeAmount;
        this.status = status != null ? status : PaymentStatus.COMPLETED;
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PaymentStatus.COMPLETED;
        }
    }

    public Long getId() {
        return id;
    }

    public Sale getSale() {
        return sale;
    }

    public void setSale(Sale sale) {
        this.sale = sale;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getTenderedAmount() {
        return tenderedAmount;
    }

    public void setTenderedAmount(BigDecimal tenderedAmount) {
        this.tenderedAmount = tenderedAmount;
    }

    public BigDecimal getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(BigDecimal changeAmount) {
        this.changeAmount = changeAmount;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
