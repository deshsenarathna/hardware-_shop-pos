package com.hardwarepos.hardware_pos_backend.inventory;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    // =========================
    // ADD STOCK (RESTOCK A PRODUCT)
    // =========================
    @PostMapping("/add-stock")
    public ResponseEntity<StockResponse> addStock(
            @Valid @RequestBody AddStockRequest request
    ) {
        InventoryStock updatedStock = inventoryService.increaseStock(
                request.getProductId(),
                request.getQuantity(),
                StockTransactionType.PURCHASE,
                "MANUAL_RESTOCK",
                request.getNotes()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new StockResponse(updatedStock));
    }

    // =========================
    // VIEW ALL STOCK LEVELS
    // =========================
    @GetMapping("/stock")
    public ResponseEntity<List<StockResponse>> getAllStock() {
        List<StockResponse> stock = inventoryService.getAllStock()
                .stream()
                .map(StockResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(stock);
    }

    // =========================
    // VIEW STOCK FOR ONE PRODUCT
    // =========================
    @GetMapping("/stock/{productId}")
    public ResponseEntity<StockResponse> getStockForProduct(
            @PathVariable Long productId
    ) {
        InventoryStock stock = inventoryService.getStockForProduct(productId);
        return ResponseEntity.ok(new StockResponse(stock));
    }
}