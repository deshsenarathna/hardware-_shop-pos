package com.hardwarepos.hardware_pos_backend.sales;

import com.hardwarepos.hardware_pos_backend.sales.dto.SaleItemResponse;
import com.hardwarepos.hardware_pos_backend.sales.dto.SaleRequestItem;
import com.hardwarepos.hardware_pos_backend.sales.dto.SaleResponse;
import com.hardwarepos.hardware_pos_backend.sales.dto.CreateSaleRequest;
import com.hardwarepos.hardware_pos_backend.sales.dto.PagedResponse;

import com.hardwarepos.hardware_pos_backend.inventory.InventoryService;
import com.hardwarepos.hardware_pos_backend.inventory.StockTransactionType;
import com.hardwarepos.hardware_pos_backend.product.Product;
import com.hardwarepos.hardware_pos_backend.product.ProductRepository;
import com.hardwarepos.hardware_pos_backend.user.AppUser;
import com.hardwarepos.hardware_pos_backend.user.AppUserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SaleService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final AppUserRepository appUserRepository;

    public SaleService(
            SaleRepository saleRepository,
            SaleItemRepository saleItemRepository,
            ProductRepository productRepository,
            InventoryService inventoryService,
            AppUserRepository appUserRepository
    ) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.appUserRepository = appUserRepository;
    }

    // ==========================================
    // CREATE SALE WITH CASHIER USERNAME
    // ==========================================
    @Transactional
    public SaleResponse createSale(CreateSaleRequest request, String cashierUsername) {
        // 1. Authenticate the cashier
        if (cashierUsername == null || cashierUsername.trim().isEmpty()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                cashierUsername = auth.getName();
            }
        }

        AppUser cashier = null;
        if (cashierUsername != null) {
            cashier = appUserRepository.findByUsername(cashierUsername).orElse(null);
        }

        // 2. Validate the request
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sale request cannot be null");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sale must contain at least one item");
        }
        if (request.getPaymentMethod() == null || request.getPaymentMethod().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required");
        }

        // 14. Generate unique invoice/receipt number (needed early as reference for inventory ledger)
        String invoiceNumber = generateInvoice();

        // 10. Initialize Sale entity (initially PENDING)
        Sale sale = new Sale();
        sale.setInvoiceNumber(invoiceNumber);
        sale.setCashier(cashier);
        sale.setStatus(SaleStatus.PENDING);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<SaleItem> saleItems = new ArrayList<>();

        // 3. Validate every product, 4. Authoritative prices, 5. Calculate subtotal, 11. Create sale items, 12. Update inventory
        for (SaleRequestItem item : request.getItems()) {
            if (item.getProductId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product ID is required for each sale item");
            }

            BigDecimal quantity = item.getQuantity();
            if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be greater than zero for product ID: " + item.getProductId());
            }

            // 4. Authoritative product lookup from database
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found with id: " + item.getProductId()
                    ));

            if (!product.isActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product is inactive and cannot be sold: " + product.getName()
                );
            }

            BigDecimal unitPrice = product.getSellingPrice();
            if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Invalid selling price for product: " + product.getName()
                );
            }

            // 5. Calculate line total on server
            BigDecimal lineTotal = unitPrice.multiply(quantity).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lineTotal);

            // 11. Create SaleItem with product snapshot
            SaleItem saleItem = new SaleItem();
            saleItem.setSale(sale);
            saleItem.setProduct(product);
            saleItem.setProductCode(product.getProductCode());
            saleItem.setProductName(product.getName());
            saleItem.setUnitName(product.getUnit() != null ? product.getUnit().getName() : null);
            saleItem.setQuantity(quantity);
            saleItem.setUnitPrice(unitPrice);
            saleItem.setDiscount(BigDecimal.ZERO);
            saleItem.setTotalPrice(lineTotal);

            saleItems.add(saleItem);

            // 12. Update inventory (decrease stock, logs StockTransaction with reference to invoice)
            try {
                inventoryService.decreaseStock(
                        product.getId(),
                        quantity,
                        StockTransactionType.SALE,
                        invoiceNumber,
                        "POS sale transaction"
                );
            } catch (RuntimeException e) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Unable to complete sale for '" + product.getName() + "': " + e.getMessage(),
                        e
                );
            }
        }

        // 6. Apply discount safely
        BigDecimal requestedDiscount = request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO;
        if (requestedDiscount.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Discount cannot be negative");
        }
        // Discount cannot exceed subtotal
        BigDecimal discount = requestedDiscount.compareTo(subtotal) > 0 ? subtotal : requestedDiscount;
        discount = discount.setScale(2, RoundingMode.HALF_UP);

        // 7. Calculate tax according to existing project rules
        BigDecimal requestedTax = request.getTax() != null ? request.getTax() : BigDecimal.ZERO;
        if (requestedTax.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tax cannot be negative");
        }
        BigDecimal tax = requestedTax.setScale(2, RoundingMode.HALF_UP);

        // 8. Calculate final total
        BigDecimal totalAmount = subtotal.subtract(discount).add(tax).setScale(2, RoundingMode.HALF_UP);

        // 9. Validate the payment
        String paymentMethod = request.getPaymentMethod().trim();
        BigDecimal paymentReceived = request.getPaymentReceived() != null
                ? request.getPaymentReceived()
                : totalAmount;

        if (paymentReceived.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment received cannot be negative");
        }

        if (paymentReceived.compareTo(totalAmount) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment received (" + paymentReceived + ") is less than total amount due (" + totalAmount + ")"
            );
        }

        BigDecimal changeAmount = paymentReceived.subtract(totalAmount).setScale(2, RoundingMode.HALF_UP);

        // Finalize Sale fields
        sale.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        sale.setDiscount(discount);
        sale.setTax(tax);
        sale.setTotalAmount(totalAmount);
        sale.setPaymentMethod(paymentMethod);
        sale.setPaymentReceived(paymentReceived.setScale(2, RoundingMode.HALF_UP));
        sale.setChangeAmount(changeAmount);
        sale.setNotes(request.getNotes());
        sale.setItems(saleItems);

        // 13. Create the payment record
        SalePayment payment = new SalePayment(
                sale,
                paymentMethod,
                totalAmount,
                paymentReceived.setScale(2, RoundingMode.HALF_UP),
                changeAmount,
                PaymentStatus.COMPLETED
        );
        sale.addPayment(payment);

        // 15. Mark transaction COMPLETED only after all required operations succeed
        sale.setStatus(SaleStatus.COMPLETED);

        // Persist within the active database transaction
        Sale savedSale = saleRepository.save(sale);
        List<SaleItem> savedItems = saleItemRepository.saveAll(saleItems);

        return toSaleResponse(savedSale, savedItems);
    }

    // ==========================================
    // OVERLOAD FOR CREATE SALE WITHOUT EXPLICIT CASHIER
    // ==========================================
    @Transactional
    public SaleResponse createSale(CreateSaleRequest request) {
        return createSale(request, (String) null);
    }

    // ==========================================
    // BACKWARD-COMPATIBLE OVERLOAD FOR LIST
    // ==========================================
    @Transactional
    public SaleResponse createSale(List<SaleRequestItem> items) {
        return createSale(new CreateSaleRequest(items));
    }

    // ==========================================
    // READ SALES WITH SERVER-SIDE PAGINATION & DATE FILTERING
    // ==========================================
    @Transactional(readOnly = true)
    public PagedResponse<SaleResponse> getSales(
            LocalDate date,
            LocalDate startDate,
            LocalDate endDate,
            int page,
            int size
    ) {
        // 1. Validate pagination parameters
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must be greater than zero");
        }
        if (size > MAX_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page size cannot exceed maximum limit of " + MAX_SIZE
            );
        }

        // 2. Validate date range if both provided
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be after end date");
        }

        // 3. Configure sorting: newest sales first (createdAt DESC), with id DESC as a stable secondary tie-breaker
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);

        // 4. Query database with pagination and date filter applied at SQL level
        Page<Sale> salesPage;

        if (date != null) {
            // Single date filter: covers the entire 24-hour day
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
            salesPage = saleRepository.findByCreatedAtBetween(startOfDay, endOfDay, pageable);
        } else if (startDate != null || endDate != null) {
            // Date range filter
            LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.of(1970, 1, 1).atStartOfDay();
            LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDate.of(2099, 12, 31).atTime(LocalTime.MAX);
            salesPage = saleRepository.findByCreatedAtBetween(start, end, pageable);
        } else {
            // No date filter: retrieve all sales paginated
            salesPage = saleRepository.findAll(pageable);
        }

        // 5. Map entities to SaleResponse DTOs only for the retrieved slice
        List<SaleResponse> content = salesPage.getContent()
                .stream()
                .map(sale -> {
                    List<SaleItem> items = saleItemRepository.findBySale(sale);
                    return toSaleResponse(sale, items);
                })
                .collect(Collectors.toList());

        // 6. Wrap in PagedResponse with pagination metadata
        return new PagedResponse<>(
                content,
                salesPage.getNumber(),
                salesPage.getSize(),
                salesPage.getTotalElements(),
                salesPage.getTotalPages(),
                salesPage.isFirst(),
                salesPage.isLast()
        );
    }

    // ==========================================
    // BACKWARD-COMPATIBLE UNPAGINATED READ
    // ==========================================
    @Transactional(readOnly = true)
    public List<SaleResponse> getAllSales() {
        return saleRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(sale -> {
                    List<SaleItem> items = saleItemRepository.findBySale(sale);
                    return toSaleResponse(sale, items);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale not found with id: " + id));
        List<SaleItem> items = saleItemRepository.findBySale(sale);
        return toSaleResponse(sale, items);
    }

    @Transactional(readOnly = true)
    public SaleResponse getSaleByInvoiceNumber(String invoiceNumber) {
        Sale sale = saleRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sale not found with invoice: " + invoiceNumber));
        List<SaleItem> items = saleItemRepository.findBySale(sale);
        return toSaleResponse(sale, items);
    }

    // ==========================================
    // DTO MAPPER
    // ==========================================
    private SaleResponse toSaleResponse(Sale sale, List<SaleItem> items) {
        List<SaleItemResponse> itemResponses = items != null
                ? items.stream().map(this::toSaleItemResponse).collect(Collectors.toList())
                : List.of();

        Long cashierId = sale.getCashier() != null ? sale.getCashier().getId() : null;
        String cashierName = sale.getCashier() != null ? sale.getCashier().getFullName() : null;

        return new SaleResponse(
                sale.getId(),
                sale.getInvoiceNumber(),
                sale.getSubtotal() != null ? sale.getSubtotal() : sale.getTotalAmount(),
                sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO,
                sale.getTax() != null ? sale.getTax() : BigDecimal.ZERO,
                sale.getTotalAmount(),
                sale.getStatus() != null ? sale.getStatus() : SaleStatus.COMPLETED,
                cashierId,
                cashierName,
                sale.getPaymentMethod(),
                sale.getPaymentReceived(),
                sale.getChangeAmount(),
                sale.getNotes(),
                sale.getCreatedAt(),
                itemResponses
        );
    }

    private SaleItemResponse toSaleItemResponse(SaleItem item) {
        Product prod = item.getProduct();
        String productCode = item.getProductCode() != null
                ? item.getProductCode()
                : (prod != null ? prod.getProductCode() : null);

        String productName = item.getProductName() != null
                ? item.getProductName()
                : (prod != null ? prod.getName() : null);

        String unitName = item.getUnitName() != null
                ? item.getUnitName()
                : ((prod != null && prod.getUnit() != null) ? prod.getUnit().getName() : null);

        Long prodId = prod != null ? prod.getId() : null;

        return new SaleItemResponse(
                item.getId(),
                prodId,
                productCode,
                productName,
                unitName,
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
        );
    }

    // ==========================================
    // INVOICE GENERATOR
    // ==========================================
    private String generateInvoice() {
        String datePrefix = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "INV-" + datePrefix + "-" + uniqueSuffix;
    }
}
