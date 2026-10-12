package com.hardwarepos.hardware_pos_backend.sales;

import com.hardwarepos.hardware_pos_backend.user.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String invoiceNumber;

    @Column(precision = 15, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 15, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 15, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SaleStatus status = SaleStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id")
    private AppUser cashier;

    @Column(length = 30)
    private String paymentMethod;

    @Column(precision = 15, scale = 2)
    private BigDecimal paymentReceived;

    @Column(precision = 15, scale = 2)
    private BigDecimal changeAmount;

    @Column(length = 255)
    private String notes;

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SalePayment> payments = new ArrayList<>();

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Sale() {}

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = SaleStatus.COMPLETED;
        }
        if (this.discount == null) {
            this.discount = BigDecimal.ZERO;
        }
        if (this.tax == null) {
            this.tax = BigDecimal.ZERO;
        }
    }

    public Long getId() {
        return id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }

    public BigDecimal getTaxAmount() {
        return tax;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.tax = taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public SaleStatus getStatus() {
        return status;
    }

    public void setStatus(SaleStatus status) {
        this.status = status;
    }

    public AppUser getCashier() {
        return cashier;
    }

    public void setCashier(AppUser cashier) {
        this.cashier = cashier;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getPaymentReceived() {
        return paymentReceived;
    }

    public void setPaymentReceived(BigDecimal paymentReceived) {
        this.paymentReceived = paymentReceived;
    }

    public BigDecimal getChangeAmount() {
        return changeAmount;
    }

    public void setChangeAmount(BigDecimal changeAmount) {
        this.changeAmount = changeAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<SaleItem> getItems() {
        return items;
    }

    public void setItems(List<SaleItem> items) {
        this.items = items;
    }

    public void addItem(SaleItem item) {
        this.items.add(item);
        item.setSale(this);
    }

    public List<SalePayment> getPayments() {
        return payments;
    }

    public void setPayments(List<SalePayment> payments) {
        this.payments = payments;
    }

    public void addPayment(SalePayment payment) {
        this.payments.add(payment);
        payment.setSale(this);
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
