package com.hardwarepos.hardware_pos_backend.purchase;

import com.hardwarepos.hardware_pos_backend.purchase.dto.CreatePurchaseRequest;
import com.hardwarepos.hardware_pos_backend.purchase.dto.PurchaseResponse;

import com.hardwarepos.hardware_pos_backend.sales.dto.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    // ==========================================
    // CREATE PURCHASE (RECORD GRN & INCREASE STOCK)
    // ==========================================
    @PostMapping
    public ResponseEntity<PurchaseResponse> createPurchase(
            @Valid @RequestBody CreatePurchaseRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        PurchaseResponse response = purchaseService.createPurchase(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==========================================
    // GET PURCHASES (PAGINATED & FILTERABLE)
    // ==========================================
    @GetMapping
    public ResponseEntity<PagedResponse<PurchaseResponse>> getPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(purchaseService.getPurchases(
                page,
                size,
                supplierId,
                paymentStatus,
                status,
                startDate,
                endDate,
                search
        ));
    }

    // ==========================================
    // GET PURCHASE BY ID
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseResponse> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    // ==========================================
    // CANCEL PURCHASE (VOID INVOICE & REVERSE STOCK)
    // ==========================================
    @PostMapping("/{id}/cancel")
    public ResponseEntity<PurchaseResponse> cancelPurchase(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        return ResponseEntity.ok(purchaseService.cancelPurchase(id, reason));
    }
}
