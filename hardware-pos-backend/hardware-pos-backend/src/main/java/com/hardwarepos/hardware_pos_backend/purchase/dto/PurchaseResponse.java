package com.hardwarepos.hardware_pos_backend.purchase.dto;

import com.hardwarepos.hardware_pos_backend.purchase.Purchase;
import com.hardwarepos.hardware_pos_backend.purchase.PurchasePaymentStatus;
import com.hardwarepos.hardware_pos_backend.purchase.PurchaseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PurchaseResponse {

    private final Long id;
    private final String purchaseNumber;
    private final Long supplierId;
    private final String supplierCode;
    private final String supplierName;
    private final LocalDate purchaseDate;
    private final String supplierInvoiceNumber;
    private final BigDecimal subtotal;
    private final BigDecimal discount;
    private final BigDecimal tax;
    private final BigDecimal totalAmount;
    private final BigDecimal paidAmount;
    private final BigDecimal balanceDue;
    private final PurchasePaymentStatus paymentStatus;
    private final PurchaseStatus status;
    private final String createdByUsername;
    private final String notes;
    private final List<PurchaseItemResponse> items;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public PurchaseResponse(Purchase purchase) {
        this.id = purchase.getId();
        this.purchaseNumber = purchase.getPurchaseNumber();
        this.supplierId = purchase.getSupplier() != null ? purchase.getSupplier().getId() : null;
        this.supplierCode = purchase.getSupplier() != null ? purchase.getSupplier().getSupplierCode() : null;
        this.supplierName = purchase.getSupplier() != null ? purchase.getSupplier().getName() : null;
        this.purchaseDate = purchase.getPurchaseDate();
        this.supplierInvoiceNumber = purchase.getSupplierInvoiceNumber();
        this.subtotal = purchase.getSubtotal();
        this.discount = purchase.getDiscount();
        this.tax = purchase.getTax();
        this.totalAmount = purchase.getTotalAmount();
        this.paidAmount = purchase.getPaidAmount();
        this.balanceDue = purchase.getTotalAmount().subtract(purchase.getPaidAmount());
        this.paymentStatus = purchase.getPaymentStatus();
        this.status = purchase.getStatus();
        this.createdByUsername = purchase.getCreatedBy() != null ? purchase.getCreatedBy().getUsername() : null;
        this.notes = purchase.getNotes();
        this.items = purchase.getItems() != null
                ? purchase.getItems().stream().map(PurchaseItemResponse::new).toList()
                : List.of();
        this.createdAt = purchase.getCreatedAt();
        this.updatedAt = purchase.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getPurchaseNumber() {
        return purchaseNumber;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public String getSupplierCode() {
        return supplierCode;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public String getSupplierInvoiceNumber() {
        return supplierInvoiceNumber;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public BigDecimal getTax() {
        return tax;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public PurchasePaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public PurchaseStatus getStatus() {
        return status;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public String getNotes() {
        return notes;
    }

    public List<PurchaseItemResponse> getItems() {
        return items;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
