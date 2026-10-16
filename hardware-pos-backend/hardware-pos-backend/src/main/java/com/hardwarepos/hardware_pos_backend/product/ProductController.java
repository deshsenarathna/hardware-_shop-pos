package com.hardwarepos.hardware_pos_backend.product;

import com.hardwarepos.hardware_pos_backend.sales.PagedResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(
            ProductService productService
    ) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody CreateProductRequest request
    ) {
        ProductResponse response =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // GET PRODUCTS (PAGINATED WITH OPTIONAL SEARCH)
    // ==========================================
    @GetMapping
    public ResponseEntity<PagedResponse<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(
                productService.getProducts(page, size, search)
        );
    }

    // ==========================================
    // LIGHTWEIGHT POS CASHIER LOOKUP
    // Excludes sensitive buying prices, reorder levels, audit timestamps
    // ==========================================
    @GetMapping("/pos-lookup")
    public ResponseEntity<List<ProductSummaryResponse>> getProductsForPos() {
        return ResponseEntity.ok(
                productService.getProductsForPos()
        );
    }

    // ==========================================
    // BACKWARD-COMPATIBLE UNPAGINATED PRODUCTS (ALL)
    // ==========================================
//    @GetMapping("/all")
//    public ResponseEntity<List<ProductResponse>> getAllProducts() {
//        return ResponseEntity.ok(
//                productService.getAllProducts()
//        );
//    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductResponse response =
                productService.updateProduct(
                        productId,
                        request
                );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deactivateProduct(
            @PathVariable Long productId // take the id from url
    ) {
        productService.deactivateProduct(productId);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{productId}/activate")
    public ResponseEntity<Void> activateProduct(
            @PathVariable Long productId
    ) {
        productService.activateProduct(productId);
        return ResponseEntity.ok().build();
    }
}
