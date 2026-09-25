package com.hardwarepos.hardware_pos_backend.product;

import com.hardwarepos.hardware_pos_backend.brand.Brand;
import com.hardwarepos.hardware_pos_backend.brand.BrandRepository;
import com.hardwarepos.hardware_pos_backend.category.Category;
import com.hardwarepos.hardware_pos_backend.category.CategoryRepository;
import com.hardwarepos.hardware_pos_backend.unit.MeasurementUnit;
import com.hardwarepos.hardware_pos_backend.unit.MeasurementUnitRepository;
import com.hardwarepos.hardware_pos_backend.inventory.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {


    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final MeasurementUnitRepository unitRepository;
    private final InventoryService inventoryService;
    private final BarcodeGenerator barcodeGenerator;
    private static final int MAX_BARCODE_GENERATION_ATTEMPTS = 5;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            MeasurementUnitRepository unitRepository,
            InventoryService inventoryService,
            BarcodeGenerator barcodeGenerator
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.unitRepository = unitRepository;
        this.inventoryService = inventoryService;
        this.barcodeGenerator = barcodeGenerator;

    }





    @Transactional
    public ProductResponse createProduct(
            CreateProductRequest request
    ) {
        String productCode =
                request.getProductCode().trim().toUpperCase();


        String productName =
                request.getName().trim();

        String description =
                request.getDescription() == null
                        ? null
                        : request.getDescription().trim();

        if (productRepository
                .existsByProductCodeIgnoreCase(productCode)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Product code already exists"
            );
        }

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Selected category was not found"
                ));

        if (!category.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected category is inactive"
            );
        }

        MeasurementUnit unit = unitRepository
                .findById(request.getUnitId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Selected measurement unit was not found"
                ));

        if (!unit.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected measurement unit is inactive"
            );
        }

        Brand brand = null;

        if (request.getBrandId() != null) {
            brand = brandRepository
                    .findById(request.getBrandId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Selected brand was not found"
                    ));

            if (!brand.isActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected brand is inactive"
                );
            }
        }


        validateReorderLevel(
                request.getReorderLevel(),
                unit
        );

        Product product = new Product(
                productCode,
                productName,
                description,
                category,
                brand,
                unit,
                request.getPurchasePrice(),
                request.getSellingPrice(),
                request.getReorderLevel()
        );

        product.setLocation(
                request.getLocation() == null
                        ? null
                        : request.getLocation().trim()
        );

        Product savedProduct =
                productRepository.save(product);

        inventoryService.initializeStockForProduct(savedProduct);

        return convertToResponse(savedProduct);
    }



    @Transactional
    public ProductResponse updateProduct(
            Long productId,
            UpdateProductRequest request )
    {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product was not found"
                ));

        if (!product.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Inactive product cannot be updated"
            );
        }

        String productCode =
                request.getProductCode().trim().toUpperCase();

        String productName =
                request.getName().trim();

        String description =
                request.getDescription() == null
                        ? null
                        : request.getDescription().trim();

        boolean codeExists = productRepository
                .existsByProductCodeIgnoreCaseAndIdNot(
                        productCode,
                        productId
                );

        if (codeExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Product code already exists"
            );
        }

        Category category = categoryRepository
                .findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Selected category was not found"
                ));

        if (!category.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected category is inactive"
            );
        }

        MeasurementUnit unit = unitRepository
                .findById(request.getUnitId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Selected measurement unit was not found"
                ));

        if (!unit.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Selected measurement unit is inactive"
            );
        }

        Brand brand = null;

        if (request.getBrandId() != null) {
            brand = brandRepository
                    .findById(request.getBrandId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Selected brand was not found"
                    ));

            if (!brand.isActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected brand is inactive"
                );
            }
        }

        validateReorderLevel(
                request.getReorderLevel(),
                unit
        );

        product.setProductCode(productCode);
        product.setName(productName);
        product.setDescription(description);
        product.setCategory(category);
        product.setBrand(brand);
        product.setUnit(unit);
        product.setPurchasePrice(request.getPurchasePrice());
        product.setSellingPrice(request.getSellingPrice());
        product.setReorderLevel(request.getReorderLevel());
        product.setLocation(
                request.getLocation() == null
                        ? null
                        : request.getLocation().trim()
        );

        Product updatedProduct =
                productRepository.save(product);

        return convertToResponse(updatedProduct);
    }

    @Transactional
    public void deactivateProduct(Long productId) {
        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product was not found"
                ));

        if (!product.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product is already inactive"
            );
        }

        product.setActive(false);

        productRepository.save(product);
    }

    @Transactional
    public void activateProduct(Long productId) {

        Product product = productRepository
                .findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product was not found"
                ));

        if (product.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product is already active"
            );
        }

        product.setActive(true);

        productRepository.save(product);
    }


    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private void validateReorderLevel(
            BigDecimal reorderLevel,
            MeasurementUnit unit
    ) {
        if (!unit.isAllowDecimal()
                && reorderLevel.stripTrailingZeros().scale() > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Decimal reorder level is not allowed for the selected unit"
            );
        }
    }

    private ProductResponse convertToResponse(
            Product product
    ) {
        Brand brand = product.getBrand();

        return new ProductResponse(
                product.getId(),
                product.getProductCode(),
                product.getName(),
                product.getDescription(),

                product.getCategory().getId(),
                product.getCategory().getName(),

                brand == null ? null : brand.getId(),
                brand == null ? null : brand.getName(),

                product.getUnit().getId(),
                product.getUnit().getName(),
                product.getUnit().getSymbol(),
                product.getUnit().isAllowDecimal(),

                product.getPurchasePrice(),
                product.getSellingPrice(),
                product.getReorderLevel(),
                product.getLocation(),

                product.isActive(),
                product.getCreatedAt(),
                product.getUpdatedAt(),
                product.getBarcode()

        );
    }
}