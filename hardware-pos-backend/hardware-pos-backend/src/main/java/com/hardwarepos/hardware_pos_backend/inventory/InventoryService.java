package com.hardwarepos.hardware_pos_backend.inventory;

import com.hardwarepos.hardware_pos_backend.inventory.dto.AdjustStockRequest;
import com.hardwarepos.hardware_pos_backend.inventory.dto.InventoryMetricsResponse;
import com.hardwarepos.hardware_pos_backend.inventory.dto.StockTransactionResponse;
import com.hardwarepos.hardware_pos_backend.inventory.dto.InventoryItemResponse;

import com.hardwarepos.hardware_pos_backend.product.Product;
import com.hardwarepos.hardware_pos_backend.product.ProductRepository;
import com.hardwarepos.hardware_pos_backend.sales.dto.PagedResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InventoryService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final InventoryStockRepository stockRepository;
    private final StockTransactionRepository transactionRepository;
    private final ProductRepository productRepository;

    public InventoryService(
            InventoryStockRepository stockRepository,
            StockTransactionRepository transactionRepository,
            ProductRepository productRepository
    ) {
        this.stockRepository = stockRepository;
        this.transactionRepository = transactionRepository;
        this.productRepository = productRepository;
    }

    // =========================
    // INCREASE STOCK
    // =========================
    @Transactional
    public InventoryStock increaseStock(
            Long productId,
            BigDecimal quantity,
            StockTransactionType type,
            String reference,
            String notes
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        InventoryStock stock = stockRepository.findByProduct(product)
                .orElseGet(() -> {
                    InventoryStock newStock = new InventoryStock(product);
                    return stockRepository.save(newStock);
                });

        BigDecimal before = stock.getQuantityOnHand();
        BigDecimal after = before.add(quantity);

        stock.setQuantityOnHand(after);
        InventoryStock savedStock = stockRepository.save(stock);

        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setQuantityBefore(before);
        transaction.setQuantityAfter(after);
        transaction.setReference(reference);
        transaction.setNotes(notes);

        transactionRepository.save(transaction);

        return savedStock;
    }

    // =========================
    // DECREASE STOCK
    // =========================
    @Transactional
    public void decreaseStock(
            Long productId,
            BigDecimal quantity,
            StockTransactionType type,
            String reference,
            String notes
    ) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        InventoryStock stock = stockRepository.findByProduct(product)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stock not found"));

        BigDecimal before = stock.getQuantityOnHand();

        if (before.compareTo(quantity) < 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for product: " + product.getName());
        }

        BigDecimal after = before.subtract(quantity);

        stock.setQuantityOnHand(after);
        stockRepository.save(stock);

        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(quantity);
        transaction.setQuantityBefore(before);
        transaction.setQuantityAfter(after);
        transaction.setReference(reference);
        transaction.setNotes(notes);

        transactionRepository.save(transaction);
    }

    @Transactional
    public void initializeStockForProduct(Product product) {
        boolean exists = stockRepository.findByProduct(product).isPresent();
        if (exists) {
            return;
        }

        InventoryStock stock = new InventoryStock(product);
        stock.setQuantityOnHand(BigDecimal.ZERO);
        stockRepository.save(stock);
    }

    // =========================
    // PAGINATED UNIFIED INVENTORY
    // =========================
    @Transactional(readOnly = true)
    public PagedResponse<InventoryItemResponse> getInventory(
            int page,
            int size,
            String search,
            String status
    ) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must be greater than zero");
        }
        if (size > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size cannot exceed maximum limit of " + MAX_SIZE);
        }

        String normalizedStatus = status != null ? status.trim().toUpperCase() : "ALL";
        if (!List.of("ALL", "LOW_STOCK", "OUT_OF_STOCK", "IN_STOCK").contains(normalizedStatus)) {
            normalizedStatus = "ALL";
        }

        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Sort sort = Sort.by(Sort.Direction.ASC, "product.name").and(Sort.by(Sort.Direction.ASC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<InventoryStock> stockPage = stockRepository.findInventoryWithFilters(
                searchTerm,
                normalizedStatus,
                pageable
        );

        List<InventoryItemResponse> content = stockPage.getContent()
                .stream()
                .map(InventoryItemResponse::new)
                .toList();

        return new PagedResponse<>(
                content,
                stockPage.getNumber(),
                stockPage.getSize(),
                stockPage.getTotalElements(),
                stockPage.getTotalPages(),
                stockPage.isFirst(),
                stockPage.isLast()
        );
    }

    // =========================
    // INVENTORY METRICS & KPIS
    // =========================
    @Transactional(readOnly = true)
    public InventoryMetricsResponse getInventoryMetrics() {
        long totalProducts = stockRepository.countActiveProducts();
        BigDecimal totalStockUnits = stockRepository.sumTotalStockUnits();
        BigDecimal totalValuation = stockRepository.sumTotalValuation();
        long lowStockCount = stockRepository.countLowStock();
        long outOfStockCount = stockRepository.countOutOfStock();

        return new InventoryMetricsResponse(
                totalProducts,
                totalStockUnits,
                totalValuation,
                lowStockCount,
                outOfStockCount
        );
    }

    // =========================
    // PRODUCT AUDIT TRANSACTIONS
    // =========================
    @Transactional(readOnly = true)
    public PagedResponse<StockTransactionResponse> getProductTransactions(
            Long productId,
            int page,
            int size
    ) {
        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + productId);
        }

        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must be greater than zero");
        }
        if (size > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size cannot exceed maximum limit of " + MAX_SIZE);
        }

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<StockTransaction> transactionPage = transactionRepository.findByProductId(productId, pageable);

        List<StockTransactionResponse> content = transactionPage.getContent()
                .stream()
                .map(StockTransactionResponse::new)
                .toList();

        return new PagedResponse<>(
                content,
                transactionPage.getNumber(),
                transactionPage.getSize(),
                transactionPage.getTotalElements(),
                transactionPage.getTotalPages(),
                transactionPage.isFirst(),
                transactionPage.isLast()
        );
    }

    // =========================
    // ADJUST STOCK (AUDIT / DAMAGE / RECOUNT)
    // =========================
    @Transactional
    public InventoryItemResponse adjustStock(AdjustStockRequest request, String performedBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot adjust stock for inactive product: " + product.getName());
        }

        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adjustment quantity must be greater than zero");
        }

        StockTransactionType type = request.getAdjustmentType();
        if (type != StockTransactionType.ADJUSTMENT_ADD && type != StockTransactionType.ADJUSTMENT_REMOVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Adjustment type must be ADJUSTMENT_ADD or ADJUSTMENT_REMOVE");
        }

        InventoryStock stock = stockRepository.findByProduct(product)
                .orElseGet(() -> {
                    InventoryStock newStock = new InventoryStock(product);
                    return stockRepository.save(newStock);
                });

        BigDecimal before = stock.getQuantityOnHand();
        BigDecimal after;

        if (type == StockTransactionType.ADJUSTMENT_ADD) {
            after = before.add(request.getQuantity());
        } else {
            if (before.compareTo(request.getQuantity()) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Cannot remove " + request.getQuantity() + " units. Current stock is only " + before
                );
            }
            after = before.subtract(request.getQuantity());
        }

        stock.setQuantityOnHand(after);
        InventoryStock savedStock = stockRepository.save(stock);

        String reference = "ADJ-" + (request.getReason() != null ? request.getReason().trim().toUpperCase() : "GENERAL");
        String notes = (request.getNotes() != null ? request.getNotes() : "") +
                (performedBy != null ? " [Adjusted by: " + performedBy + "]" : "");

        StockTransaction transaction = new StockTransaction();
        transaction.setProduct(product);
        transaction.setType(type);
        transaction.setQuantity(request.getQuantity());
        transaction.setQuantityBefore(before);
        transaction.setQuantityAfter(after);
        transaction.setReference(reference);
        transaction.setNotes(notes.trim());

        transactionRepository.save(transaction);

        return new InventoryItemResponse(savedStock);
    }

    // =========================
    // READ STOCK LEVELS (BACKWARD COMPATIBILITY)
    // =========================
    public List<InventoryStock> getAllStock() {
        return stockRepository.findAll();
    }

    public InventoryStock getStockForProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        return stockRepository.findByProduct(product)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stock not found"));
    }
}
