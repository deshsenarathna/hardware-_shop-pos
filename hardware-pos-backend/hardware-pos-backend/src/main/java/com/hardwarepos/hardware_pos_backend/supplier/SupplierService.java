package com.hardwarepos.hardware_pos_backend.supplier;

import com.hardwarepos.hardware_pos_backend.supplier.dto.SupplierResponse;
import com.hardwarepos.hardware_pos_backend.supplier.dto.UpdateSupplierRequest;
import com.hardwarepos.hardware_pos_backend.supplier.dto.SupplierSummaryResponse;
import com.hardwarepos.hardware_pos_backend.supplier.dto.CreateSupplierRequest;

import com.hardwarepos.hardware_pos_backend.purchase.PurchaseRepository;
import com.hardwarepos.hardware_pos_backend.purchase.PurchaseStatus;
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
public class SupplierService {

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 20;
    private static final int MAX_SIZE = 100;

    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;

    public SupplierService(SupplierRepository supplierRepository, PurchaseRepository purchaseRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
    }

    // ==========================================
    // CREATE SUPPLIER
    // ==========================================
    @Transactional
    public SupplierResponse createSupplier(CreateSupplierRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Supplier request cannot be null");
        }

        String supplierCode = request.getSupplierCode() != null ? request.getSupplierCode().trim().toUpperCase() : null;
        if (supplierCode == null || supplierCode.isEmpty()) {
            supplierCode = generateSupplierCode();
        } else if (supplierRepository.existsBySupplierCodeIgnoreCase(supplierCode)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Supplier code already exists: " + supplierCode);
        }

        Supplier supplier = new Supplier(
                supplierCode,
                request.getName().trim(),
                request.getContactPerson() != null ? request.getContactPerson().trim() : null,
                request.getPhone().trim()
        );

        Supplier saved = supplierRepository.save(supplier);
        return new SupplierResponse(saved);
    }

    // ==========================================
    // GET SUPPLIERS (PAGINATED & SEARCHABLE)
    // ==========================================
    @Transactional(readOnly = true)
    public PagedResponse<SupplierResponse> getSuppliers(int page, int size, String search) {
        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page index must not be less than zero");
        }
        if (size <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size must be greater than zero");
        }
        if (size > MAX_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page size cannot exceed maximum limit of " + MAX_SIZE);
        }

        Sort sort = Sort.by(Sort.Direction.ASC, "name").and(Sort.by(Sort.Direction.ASC, "id"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Supplier> supplierPage;
        if (search != null && !search.trim().isEmpty()) {
            String term = search.trim();
            supplierPage = supplierRepository.findByNameContainingIgnoreCaseOrSupplierCodeContainingIgnoreCase(term, term, pageable);
        } else {
            supplierPage = supplierRepository.findAll(pageable);
        }

        List<SupplierResponse> content = supplierPage.getContent()
                .stream()
                .map(SupplierResponse::new)
                .toList();

        return new PagedResponse<>(
                content,
                supplierPage.getNumber(),
                supplierPage.getSize(),
                supplierPage.getTotalElements(),
                supplierPage.getTotalPages(),
                supplierPage.isFirst(),
                supplierPage.isLast()
        );
    }

    // ==========================================
    // GET SUPPLIER BY ID
    // ==========================================
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found with id: " + id));
        return new SupplierResponse(supplier);
    }

    // ==========================================
    // UPDATE SUPPLIER DETAILS
    // ==========================================
    @Transactional
    public SupplierResponse updateSupplier(Long id, UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found with id: " + id));

        if (request.getSupplierCode() != null && !request.getSupplierCode().trim().isEmpty()) {
            String code = request.getSupplierCode().trim().toUpperCase();
            if (supplierRepository.existsBySupplierCodeIgnoreCaseAndIdNot(code, id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Supplier code already exists: " + code);
            }
            supplier.setSupplierCode(code);
        }

        supplier.setName(request.getName().trim());
        supplier.setContactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null);
        supplier.setPhone(request.getPhone().trim());

        if (request.getActive() != null) {
            supplier.setActive(request.getActive());
        }

        Supplier updated = supplierRepository.save(supplier);
        return new SupplierResponse(updated);
    }

    // ==========================================
    // SAFE DELETE SUPPLIER
    // ==========================================
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found with id: " + id));

        boolean hasPurchases = purchaseRepository.existsBySupplierId(id);
        if (hasPurchases) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot delete supplier '" + supplier.getName() + "' because existing purchase records reference this supplier."
            );
        }

        supplierRepository.delete(supplier);
    }

    // ==========================================
    // GET SUPPLIER SUMMARY (FINANCIAL DERIVED LEDGER)
    // ==========================================
    @Transactional(readOnly = true)
    public SupplierSummaryResponse getSupplierSummary(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Supplier not found with id: " + id));

        long totalPurchasesCount = purchaseRepository.countBySupplierIdAndStatus(id, PurchaseStatus.COMPLETED);
        BigDecimal totalPurchasesAmount = purchaseRepository.sumTotalAmountBySupplierIdAndStatus(id, PurchaseStatus.COMPLETED);
        if (totalPurchasesAmount == null) {
            totalPurchasesAmount = BigDecimal.ZERO;
        }

        BigDecimal totalPaidAmount = BigDecimal.ZERO;
        BigDecimal totalOutstanding = totalPurchasesAmount.subtract(totalPaidAmount);

        return new SupplierSummaryResponse(
                supplier.getId(),
                supplier.getSupplierCode(),
                supplier.getName(),
                totalPurchasesCount,
                totalPurchasesAmount,
                totalPaidAmount,
                totalOutstanding
        );
    }

    private String generateSupplierCode() {
        long count = supplierRepository.count() + 1;
        String candidate = String.format("SUP-%04d", count);
        int attempts = 1;
        while (supplierRepository.existsBySupplierCodeIgnoreCase(candidate)) {
            candidate = String.format("SUP-%04d", count + attempts);
            attempts++;
        }
        return candidate;
    }
}
