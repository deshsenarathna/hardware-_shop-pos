package com.hardwarepos.hardware_pos_backend.sales;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SaleResponse {

    private final Long id;
    private final String invoiceNumber;
    private final BigDecimal subtotal;
    private final BigDecimal discount;
    private final BigDecimal tax;
    private final BigDecimal totalAmount;
    private final SaleStatus status;
    private final Long cashierId;
    private final String cashierName;
    private final String paymentMethod;
    private final BigDecimal paymentReceived;
    private final BigDecimal changeAmount;
    private final String notes;
    private final LocalDateTime createdAt;
    private final List<SaleItemResponse> items;

    // Full constructor
    public SaleResponse(
            Long id,
            String invoiceNumber,
            BigDecimal subtotal,
            BigDecimal discount,
            BigDecimal tax,
            BigDecimal totalAmount,
            SaleStatus status,
            Long cashierId,
            String cashierName,
            String paymentMethod,
            BigDecimal paymentReceived,
            BigDecimal changeAmount,
            String notes,
            LocalDateTime createdAt,
            List<SaleItemResponse> items
    ) {
        this.id = id;
        this.invoiceNumber = invoiceNumber;
        this.subtotal = subtotal;
        this.discount = discount;
        this.tax = tax;
        this.totalAmount = totalAmount;
        this.status = status;
        this.cashierId = cashierId;
        this.cashierName = cashierName;
        this.paymentMethod = paymentMethod;
        this.paymentReceived = paymentReceived;
        this.changeAmount = changeAmount;
        this.notes = notes;
        this.createdAt = createdAt;
        this.items = items;
    }

    // Backward-compatible constructor
    public SaleResponse(
            Long id,
            String invoiceNumber,
            BigDecimal subtotal,
            BigDecimal discount,
            BigDecimal totalAmount,
            String paymentMethod,
            BigDecimal paymentReceived,
            BigDecimal changeAmount,
            String notes,
            LocalDateTime createdAt,
            List<SaleItemResponse> items
    ) {
        this(
                id,
                invoiceNumber,
                subtotal,
                discount,
                BigDecimal.ZERO,
                totalAmount,
                SaleStatus.COMPLETED,
                null,
                null,
                paymentMethod,
                paymentReceived,
                changeAmount,
                notes,
                createdAt,
                items
        );
    }

    public Long getId() {
        return id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
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

    public SaleStatus getStatus() {
        return status;
    }

    public Long getCashierId() {
        return cashierId;
    }

    public String getCashierName() {
        return cashierName;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public BigDecimal getPaymentReceived() {
        return paymentReceived;
    }

    public BigDecimal getChangeAmount() {
        return changeAmount;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<SaleItemResponse> getItems() {
        return items;
    }
}
