package com.hardwarepos.hardware_pos_backend.purchase;

import com.hardwarepos.hardware_pos_backend.purchase.dto.PurchaseItemRequest;
import com.hardwarepos.hardware_pos_backend.purchase.dto.CreatePurchaseRequest;
import com.hardwarepos.hardware_pos_backend.purchase.dto.PurchaseResponse;

import com.hardwarepos.hardware_pos_backend.inventory.InventoryService;
import com.hardwarepos.hardware_pos_backend.inventory.StockTransactionType;
import com.hardwarepos.hardware_pos_backend.product.Product;
import com.hardwarepos.hardware_pos_backend.product.ProductRepository;
import com.hardwarepos.hardware_pos_backend.sales.dto.PagedResponse;
import com.hardwarepos.hardware_pos_backend.supplier.Supplier;
import com.hardwarepos.hardware_pos_backend.supplier.SupplierRepository;
import com.hardwarepos.hardware_pos_backend.user.AppUser;
import com.hardwarepos.hardware_pos_backend.user.AppUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PurchaseService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final AppUserRepository appUserRepository;

    public PurchaseService(
            PurchaseRepository purchaseRepository,
            SupplierRepository supplierRepository,
            ProductRepository productRepository,
            InventoryService inventoryService,
            AppUserRepository appUserRepository
    ) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.appUserRepository = appUserRepository;
    }

    // ==========================================
    // CREATE PURCHASE (INBOUND STOCK & LEDGER)
    // ==========================================
    @Transactional
    public PurchaseResponse createPurchase(CreatePurchaseRequest request, String username) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purchase request cannot be null");
        }

        if (request.getSupplierId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supplier ID is required");
        }

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found with id: " + request.getSupplierId()));

        if (!supplier.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot create purchase for inactive supplier: " + supplier.getName());
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purchase must contain at least one item");
        }

        AppUser createdByUser = null;
        if (username != null && !username.isBlank()) {
            createdByUser = appUserRepository.findByUsername(username).orElse(null);
        }

        Purchase purchase = new Purchase();
        purchase.setPurchaseNumber(generatePurchaseNumber());
        purchase.setSupplier(supplier);
        purchase.setPurchaseDate(request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now());
        purchase.setSupplierInvoiceNumber(request.getSupplierInvoiceNumber() != null ? request.getSupplierInvoiceNumber().trim() : null);
        purchase.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        purchase.setCreatedBy(createdByUser);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (PurchaseItemRequest itemReq : request.getItems()) {
            if (itemReq.getProductId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product ID is required for each purchase item");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found with id: " + itemReq.getProductId()));

            if (!product.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot purchase inactive product: " + product.getName());
            }

            BigDecimal qty = itemReq.getQuantity();
            if (qty == null || qty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero for product: " + product.getName());
            }

            BigDecimal cost = itemReq.getPurchaseCost();
            if (cost == null || cost.compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purchase cost cannot be negative for product: " + product.getName());
            }

            BigDecimal lineTotal = qty.multiply(cost);
            subtotal = subtotal.add(lineTotal);

            PurchaseItem purchaseItem = new PurchaseItem(
                    purchase,
                    product,
                    product.getProductCode(),
                    product.getName(),
                    product.getUnit() != null ? product.getUnit().getName() : null,
                    qty,
                    cost,
                    lineTotal
            );

            purchase.addItem(purchaseItem);
        }

        purchase.setSubtotal(subtotal);

        BigDecimal discount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount cannot be negative");
        }
        if (discount.compareTo(subtotal) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount cannot exceed subtotal");
        }
        purchase.setDiscount(discount);

        BigDecimal tax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;
        if (tax.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tax cannot be negative");
        }
        purchase.setTax(tax);

        BigDecimal totalAmount = subtotal.subtract(discount).add(tax);
        purchase.setTotalAmount(totalAmount);

        BigDecimal paidAmount = request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO;
        if (paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid amount cannot be negative");
        }
        if (paidAmount.compareTo(totalAmount) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paid amount cannot exceed total purchase amount");
        }
        purchase.setPaidAmount(paidAmount);

        if (paidAmount.compareTo(BigDecimal.ZERO) == 0) {
            purchase.setPaymentStatus(PurchasePaymentStatus.UNPAID);
        } else if (paidAmount.compareTo(totalAmount) >= 0) {
            purchase.setPaymentStatus(PurchasePaymentStatus.PAID);
        } else {
            purchase.setPaymentStatus(PurchasePaymentStatus.PARTIALLY_PAID);
        }

        purchase.setStatus(PurchaseStatus.COMPLETED);

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Update physical stock and write immutable audit ledger
        for (PurchaseItem item : savedPurchase.getItems()) {
            inventoryService.increaseStock(
                    item.getProduct().getId(),
                    item.getQuantity(),
                    StockTransactionType.PURCHASE,
                    savedPurchase.getPurchaseNumber(),
                    "Inbound Purchase from " + supplier.getName()
            );
        }

        return new PurchaseResponse(savedPurchase);
    }

    // ==========================================
    // GET PURCHASES (PAGINATED & FILTERABLE)
    // ==========================================
    @Transactional(readOnly = true)
    public PagedResponse<PurchaseResponse> getPurchases(
            int page,
            int size,
            Long supplierId,
            String paymentStatusStr,
            String statusStr,
            LocalDate startDate,
            LocalDate endDate,
            String search
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

        PurchasePaymentStatus paymentStatus = null;
        if (paymentStatusStr != null && !paymentStatusStr.isBlank()) {
            try {
                paymentStatus = PurchasePaymentStatus.valueOf(paymentStatusStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid payment status: " + paymentStatusStr);
            }
        }

        PurchaseStatus status = null;
        if (statusStr != null && !statusStr.isBlank()) {
            try {
                status = PurchaseStatus.valueOf(statusStr.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + statusStr);
            }
        }

        String searchTerm = (search != null && !search.trim().isEmpty()) ? search.trim() : null;

        Sort sort = Sort.by(Sort.Direction.DESC, "purchaseDate").and(Sort.by(Sort.Direction.DESC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Purchase> purchasePage = purchaseRepository.findPurchasesWithFilters(
                supplierId,
                paymentStatus,
                status,
                startDate,
                endDate,
                searchTerm,
                pageable
        );

        List<PurchaseResponse> content = purchasePage.getContent()
                .stream()
                .map(PurchaseResponse::new)
                .toList();

        return new PagedResponse<>(
                content,
                purchasePage.getNumber(),
                purchasePage.getSize(),
                purchasePage.getTotalElements(),
                purchasePage.getTotalPages(),
                purchasePage.isFirst(),
                purchasePage.isLast()
        );
    }

    // ==========================================
    // GET PURCHASE BY ID
    // ==========================================
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found with id: " + id));
        return new PurchaseResponse(purchase);
    }

    // ==========================================
    // CANCEL PURCHASE (VOID / RETURN STOCK)
    // ==========================================
    @Transactional
    public PurchaseResponse cancelPurchase(Long id, String reason) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Purchase not found with id: " + id));

        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Purchase is already cancelled");
        }

        // Reverse stock increase
        for (PurchaseItem item : purchase.getItems()) {
            inventoryService.decreaseStock(
                    item.getProduct().getId(),
                    item.getQuantity(),
                    StockTransactionType.ADJUSTMENT_REMOVE,
                    "CANCEL-" + purchase.getPurchaseNumber(),
                    "Purchase cancelled: " + (reason != null ? reason.trim() : "Voided by manager")
            );
        }

        purchase.setStatus(PurchaseStatus.CANCELLED);
        Purchase updated = purchaseRepository.save(purchase);

        return new PurchaseResponse(updated);
    }

    private String generatePurchaseNumber() {
        int year = LocalDate.now().getYear();
        long count = purchaseRepository.count() + 1;
        String candidate = String.format("PUR-%d-%04d", year, count);
        int attempts = 1;
        while (purchaseRepository.existsByPurchaseNumberIgnoreCase(candidate)) {
            candidate = String.format("PUR-%d-%04d", year, count + attempts);
            attempts++;
        }
        return candidate;
    }
}
