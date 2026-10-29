package com.hardwarepos.hardware_pos_backend.supplier.dto;

import com.hardwarepos.hardware_pos_backend.supplier.Supplier;

import java.time.LocalDateTime;

public class SupplierResponse {

    private final Long id;
    private final String supplierCode;
    private final String name;
    private final String contactPerson;
    private final String phone;
    private final boolean active;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    public SupplierResponse(Supplier supplier) {
        this.id = supplier.getId();
        this.supplierCode = supplier.getSupplierCode();
        this.name = supplier.getName();
        this.contactPerson = supplier.getContactPerson();
        this.phone = supplier.getPhone();
        this.active = supplier.isActive();
        this.createdAt = supplier.getCreatedAt();
        this.updatedAt = supplier.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getSupplierCode() {
        return supplierCode;
    }

    public String getName() {
        return name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public String getPhone() {
        return phone;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
