package com.hardwarepos.hardware_pos_backend.product.barcode;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/barcodes")
public class BarcodeController {

    private final BarcodeService barcodeService;

    public BarcodeController(BarcodeService barcodeService) {
        this.barcodeService = barcodeService;
    }

    /**
     * Generate an internal Code128 barcode for a product.
     * Format: HP-<PRODUCT_CODE>-<RANDOM_SUFFIX>
     */
    @PostMapping("/generate/{productId}")
    public ResponseEntity<BarcodeResponse> generateInternalBarcode(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "true") boolean primary
    ) {
        BarcodeResponse response = barcodeService.generateInternalBarcode(productId, primary);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Register a new barcode (e.g. manufacturer external barcode) for a product.
     */
    @PostMapping
    public ResponseEntity<BarcodeResponse> addBarcode(
            @Valid @RequestBody AddBarcodeRequest request
    ) {
        BarcodeResponse response = barcodeService.addBarcode(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Get all barcodes associated with a specific product.
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<BarcodeResponse>> getBarcodesForProduct(
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(barcodeService.getBarcodesByProductId(productId));
    }

    /**
     * Lookup barcode information by barcode value (used for barcode scanner in POS checkout).
     */
    @GetMapping("/lookup/{barcodeValue}")
    public ResponseEntity<BarcodeResponse> getBarcodeByValue(
            @PathVariable String barcodeValue
    ) {
        return ResponseEntity.ok(barcodeService.getBarcodeByValue(barcodeValue));
    }

    /**
     * Set a specific barcode as the primary barcode for its product.
     */
    @PatchMapping("/{barcodeId}/primary")
    public ResponseEntity<BarcodeResponse> setPrimaryBarcode(
            @PathVariable Long barcodeId
    ) {
        return ResponseEntity.ok(barcodeService.setPrimaryBarcode(barcodeId));
    }

    /**
     * Delete a barcode record.
     */
    @DeleteMapping("/{barcodeId}")
    public ResponseEntity<Void> deleteBarcode(
            @PathVariable Long barcodeId
    ) {
        barcodeService.deleteBarcode(barcodeId);
        return ResponseEntity.noContent().build();
    }
}
