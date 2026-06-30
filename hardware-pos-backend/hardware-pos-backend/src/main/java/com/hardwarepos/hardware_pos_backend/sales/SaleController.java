package com.hardwarepos.hardware_pos_backend.sales;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    // =========================
    // CREATE SALE (CASHIER CHECKOUT)
    // =========================
    @PostMapping
    public ResponseEntity<Sale> createSale(
            @RequestBody java.util.List<SaleRequestItem> items
    ) {
        Sale sale = saleService.createSale(items);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(sale);
    }
}