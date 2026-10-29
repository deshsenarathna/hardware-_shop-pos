package com.hardwarepos.hardware_pos_backend.supplier.dto;

import java.math.BigDecimal;

public class SupplierSummaryResponse {

    private final Long supplierId;
    private final String supplierCode;
    private final String supplierName;
    private final long totalPurchasesCount;
    private final BigDecimal totalPurchasesAmount;
    private final BigDecimal totalPaidAmount;
    private final BigDecimal totalOutstandingPayable;

    public SupplierSummaryResponse(
            Long supplierId,
            String supplierCode,
            String supplierName,
            long totalPurchasesCount,
            BigDecimal totalPurchasesAmount,
            BigDecimal totalPaidAmount,
            BigDecimal totalOutstandingPayable
    ) {
        this.supplierId = supplierId;
        this.supplierCode = supplierCode;
        this.supplierName = supplierName;
        this.totalPurchasesCount = totalPurchasesCount;
        this.totalPurchasesAmount = totalPurchasesAmount;
        this.totalPaidAmount = totalPaidAmount;
        this.totalOutstandingPayable = totalOutstandingPayable;
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

    public long getTotalPurchasesCount() {
        return totalPurchasesCount;
    }

    public BigDecimal getTotalPurchasesAmount() {
        return totalPurchasesAmount;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public BigDecimal getTotalOutstandingPayable() {
        return totalOutstandingPayable;
    }
}
