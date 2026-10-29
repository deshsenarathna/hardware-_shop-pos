package com.hardwarepos.hardware_pos_backend.sales.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CreateSaleRequest {

    @NotEmpty(message = "Sale must contain at least one item")
    @Valid
    private List<SaleRequestItem> items = new ArrayList<>();

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    @DecimalMin(value = "0.00", inclusive = true, message = "Payment received cannot be negative")
    private BigDecimal paymentReceived;

    @DecimalMin(value = "0.00", inclusive = true, message = "Discount cannot be negative")
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", inclusive = true, message = "Tax cannot be negative")
    private BigDecimal tax = BigDecimal.ZERO;

    private String notes;

    public CreateSaleRequest() {
    }

    public CreateSaleRequest(List<SaleRequestItem> items) {
        this.items = items;
    }

    public List<SaleRequestItem> getItems() {
        return items;
    }

    public void setItems(List<SaleRequestItem> items) {
        this.items = items;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
