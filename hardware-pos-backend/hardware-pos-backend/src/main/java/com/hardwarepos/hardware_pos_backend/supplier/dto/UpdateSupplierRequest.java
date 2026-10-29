package com.hardwarepos.hardware_pos_backend.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateSupplierRequest {

    @Size(max = 50, message = "Supplier code cannot exceed 50 characters")
    private String supplierCode;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 150, message = "Supplier name cannot exceed 150 characters")
    private String name;

    @Size(max = 100, message = "Contact person name cannot exceed 100 characters")
    private String contactPerson;

    @NotBlank(message = "Phone number is required")
    @Size(max = 25, message = "Phone number cannot exceed 25 characters")
    private String phone;

    private Boolean active;

    public UpdateSupplierRequest() {
    }

    public UpdateSupplierRequest(String supplierCode, String name, String contactPerson, String phone, Boolean active) {
        this.supplierCode = supplierCode;
        this.name = name;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.active = active;
    }

    public String getSupplierCode() {
        return supplierCode;
    }

    public void setSupplierCode(String supplierCode) {
        this.supplierCode = supplierCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
