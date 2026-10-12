package com.hardwarepos.hardware_pos_backend.sales;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // ==========================================
    // CREATE SALE (CASHIER CHECKOUT)
    // ==========================================
    @PostMapping
    public ResponseEntity<SaleResponse> createSale(
            @Valid @RequestBody CreateSaleRequest request,
            Authentication authentication
    ) {
        String cashierUsername = authentication != null ? authentication.getName() : null;
        SaleResponse response = saleService.createSale(request, cashierUsername);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // GET ALL SALES (SALES HISTORY)
    // ==========================================
    @GetMapping
    public ResponseEntity<List<SaleResponse>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSales());
    }

    // ==========================================
    // GET SALE BY ID
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(saleService.getSaleById(id));
    }

    // ==========================================
    // GET SALE BY INVOICE NUMBER
    // ==========================================
    @GetMapping("/invoice/{invoiceNumber}")
    public ResponseEntity<SaleResponse> getSaleByInvoiceNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(saleService.getSaleByInvoiceNumber(invoiceNumber));
    }
}
