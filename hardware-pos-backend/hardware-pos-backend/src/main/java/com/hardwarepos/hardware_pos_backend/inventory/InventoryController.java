package com.hardwarepos.hardware_pos_backend.inventory;

import com.hardwarepos.hardware_pos_backend.sales.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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

    // ==========================================
    // UNIFIED PAGINATED INVENTORY WITH STATUS & SEARCH
    // ==========================================
    @GetMapping
    public ResponseEntity<PagedResponse<InventoryItemResponse>> getInventory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "ALL") String status
    ) {
        return ResponseEntity.ok(
                inventoryService.getInventory(page, size, search, status)
        );
    }

    // ==========================================
    // INVENTORY METRICS & SUMMARY CARDS
    // ==========================================
    @GetMapping("/metrics")
    public ResponseEntity<InventoryMetricsResponse> getInventoryMetrics() {
        return ResponseEntity.ok(
                inventoryService.getInventoryMetrics()
        );
    }

    // ==========================================
    // PRODUCT AUDIT TRANSACTIONS (PAGINATED)
    // ==========================================
    @GetMapping("/{productId}/transactions")
    public ResponseEntity<PagedResponse<StockTransactionResponse>> getProductTransactions(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(
                inventoryService.getProductTransactions(productId, page, size)
        );
    }

    // ==========================================
    // ADJUST STOCK (DAMAGE, SHRINKAGE, AUDIT RECOUNT)
    // ==========================================
    @PostMapping("/adjust")
    public ResponseEntity<InventoryItemResponse> adjustStock(
            @Valid @RequestBody AdjustStockRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : null;
        InventoryItemResponse response = inventoryService.adjustStock(request, username);
        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ADD STOCK (RESTOCK A PRODUCT)
    // ==========================================
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

    // ==========================================
    // VIEW ALL STOCK LEVELS (BACKWARD COMPATIBILITY)
    // ==========================================
    @GetMapping("/stock")
    public ResponseEntity<List<StockResponse>> getAllStock() {
        List<StockResponse> stock = inventoryService.getAllStock()
                .stream()
                .map(StockResponse::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(stock);
    }

    // ==========================================
    // VIEW STOCK FOR ONE PRODUCT
    // ==========================================
    @GetMapping("/stock/{productId}")
    public ResponseEntity<StockResponse> getStockForProduct(
            @PathVariable Long productId
    ) {
        InventoryStock stock = inventoryService.getStockForProduct(productId);
        return ResponseEntity.ok(new StockResponse(stock));
    }
}
