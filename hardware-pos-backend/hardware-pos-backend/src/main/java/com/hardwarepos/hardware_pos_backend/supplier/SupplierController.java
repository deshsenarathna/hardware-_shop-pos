package com.hardwarepos.hardware_pos_backend.supplier;

import com.hardwarepos.hardware_pos_backend.supplier.dto.SupplierResponse;
import com.hardwarepos.hardware_pos_backend.supplier.dto.UpdateSupplierRequest;
import com.hardwarepos.hardware_pos_backend.supplier.dto.SupplierSummaryResponse;
import com.hardwarepos.hardware_pos_backend.supplier.dto.CreateSupplierRequest;

import com.hardwarepos.hardware_pos_backend.sales.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    // ==========================================
    // CREATE SUPPLIER
    // ==========================================
    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(
            @Valid @RequestBody CreateSupplierRequest request
    ) {
        SupplierResponse response = supplierService.createSupplier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==========================================
    // GET SUPPLIERS (PAGINATED & SEARCHABLE)
    // ==========================================
    @GetMapping
    public ResponseEntity<PagedResponse<SupplierResponse>> getSuppliers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(supplierService.getSuppliers(page, size, search));
    }

    // ==========================================
    // GET SUPPLIER BY ID
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }

    // ==========================================
    // UPDATE SUPPLIER DETAILS
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupplierRequest request
    ) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    // ==========================================
    // SAFE DELETE SUPPLIER
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // GET SUPPLIER SUMMARY (FINANCIAL AUDIT)
    // ==========================================
    @GetMapping("/{id}/summary")
    public ResponseEntity<SupplierSummaryResponse> getSupplierSummary(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierSummary(id));
    }
}
