package com.hardwarepos.hardware_pos_backend.sales;

import com.hardwarepos.hardware_pos_backend.inventory.InventoryService;
import com.hardwarepos.hardware_pos_backend.inventory.StockTransactionType;
import com.hardwarepos.hardware_pos_backend.product.Product;
import com.hardwarepos.hardware_pos_backend.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    public SaleService(
            SaleRepository saleRepository,
            SaleItemRepository saleItemRepository,
            ProductRepository productRepository,
            InventoryService inventoryService
    ) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
    }

    // =========================
    // CREATE SALE (MAIN METHOD)
    // =========================
    @Transactional
    public Sale createSale(List<SaleRequestItem> items) {

        // 1. Create Sale header
        Sale sale = new Sale();
        sale.setInvoiceNumber(generateInvoice());
        sale.setTotalAmount(BigDecimal.ZERO);

        Sale savedSale = saleRepository.save(sale);

        BigDecimal totalAmount = BigDecimal.ZERO;

        // 2. Process each cart item
        for (SaleRequestItem item : items) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            BigDecimal quantity = item.getQuantity();
            BigDecimal unitPrice = product.getSellingPrice();
            BigDecimal lineTotal = unitPrice.multiply(quantity);

            // 3. Create SaleItem
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(savedSale);
            saleItem.setProduct(product);
            saleItem.setQuantity(quantity);
            saleItem.setUnitPrice(unitPrice);
            saleItem.setTotalPrice(lineTotal);

            saleItemRepository.save(saleItem);

            // 4. DECREASE STOCK (IMPORTANT PART)
            inventoryService.decreaseStock(
                    product.getId(),
                    quantity,
                    StockTransactionType.SALE,
                    savedSale.getInvoiceNumber(),
                    "Cashier sale transaction"
            );

            totalAmount = totalAmount.add(lineTotal);
        }

        // 5. Update total amount
        savedSale.setTotalAmount(totalAmount);

        return saleRepository.save(savedSale);
    }

    // =========================
    // INVOICE GENERATOR
    // =========================
    private String generateInvoice() {
        return "INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}