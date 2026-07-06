package com.hardwarepos.hardware_pos_backend.inventory;

import com.hardwarepos.hardware_pos_backend.product.Product;
import com.hardwarepos.hardware_pos_backend.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class InventoryService {

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
                .orElseThrow(() -> new RuntimeException("Product not found"));

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
                .orElseThrow(() -> new RuntimeException("Product not found"));

        InventoryStock stock = stockRepository.findByProduct(product)
                .orElseThrow(() -> new RuntimeException("Stock not found"));

        BigDecimal before = stock.getQuantityOnHand();

        if (before.compareTo(quantity) < 0) {
            throw new RuntimeException("Insufficient stock");
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
            return; // already initialized
        }

        InventoryStock stock = new InventoryStock(product);
        stock.setQuantityOnHand(BigDecimal.ZERO);

        stockRepository.save(stock);
    }

    // =========================
    // READ STOCK LEVELS
    // =========================
    public List<InventoryStock> getAllStock() {
        return stockRepository.findAll();
    }

    public InventoryStock getStockForProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return stockRepository.findByProduct(product)
                .orElseThrow(() -> new RuntimeException("Stock not found"));
    }
}