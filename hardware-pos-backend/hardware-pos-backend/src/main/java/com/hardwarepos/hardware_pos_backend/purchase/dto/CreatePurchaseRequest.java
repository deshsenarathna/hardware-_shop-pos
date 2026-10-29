package com.hardwarepos.hardware_pos_backend.purchase.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CreatePurchaseRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private LocalDate purchaseDate;

    @Size(max = 100, message = "Supplier invoice number cannot exceed 100 characters")
    private String supplierInvoiceNumber;

    @DecimalMin(value = "0.00", inclusive = true, message = "Discount cannot be negative")
    private BigDecimal discount;

    @DecimalMin(value = "0.00", inclusive = true, message = "Tax cannot be negative")
    private BigDecimal tax;

    @DecimalMin(value = "0.00", inclusive = true, message = "Paid amount cannot be negative")
    private BigDecimal paidAmount;

    @Size(max = 255, message = "Notes cannot exceed 255 characters")
    private String notes;

    @NotEmpty(message = "Purchase must contain at least one item")
    @Valid
    private List<PurchaseItemRequest> items;

    public CreatePurchaseRequest() {
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getSupplierInvoiceNumber() {
        return supplierInvoiceNumber;
    }

    public void setSupplierInvoiceNumber(String supplierInvoiceNumber) {
        this.supplierInvoiceNumber = supplierInvoiceNumber;
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

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<PurchaseItemRequest> getItems() {
        return items;
    }

    public void setItems(List<PurchaseItemRequest> items) {
        this.items = items;
    }
}
