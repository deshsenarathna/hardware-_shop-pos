package com.hardwarepos.hardware_pos_backend.product.barcode;

import com.hardwarepos.hardware_pos_backend.product.Product;
import com.hardwarepos.hardware_pos_backend.product.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BarcodeService {

    private final BarcodeRepository barcodeRepository;
    private final BarcodeGenerator barcodeGenerator;
    private final ProductRepository productRepository;

    public BarcodeService(
            BarcodeRepository barcodeRepository,
            BarcodeGenerator barcodeGenerator,
            ProductRepository productRepository
    ) {
        this.barcodeRepository = barcodeRepository;
        this.barcodeGenerator = barcodeGenerator;
        this.productRepository = productRepository;
    }

    @Transactional
    public BarcodeResponse generateInternalBarcode(Long productId, boolean setPrimary) {
        Product product = findProductOrThrow(productId);

        String generatedValue = barcodeGenerator.generateCode128(product.getProductCode());

        boolean hasPrimary = barcodeRepository.existsByProductIdAndPrimaryTrue(productId);
        boolean makePrimary = setPrimary || !hasPrimary;

        if (makePrimary) {
            unsetExistingPrimary(productId);
            product.setBarcode(generatedValue);
            productRepository.save(product);
        }

        Barcode barcode = new Barcode(
                product,
                generatedValue,
                BarcodeType.INTERNAL,
                makePrimary
        );

        Barcode savedBarcode = barcodeRepository.save(barcode);
        return new BarcodeResponse(savedBarcode);
    }

    @Transactional
    public BarcodeResponse addBarcode(AddBarcodeRequest request) {
        Product product = findProductOrThrow(request.getProductId());

        String normalizedValue = request.getBarcodeValue().trim();

        if (barcodeRepository.existsByBarcodeValue(normalizedValue)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Barcode value already exists"
            );
        }

        boolean hasPrimary = barcodeRepository.existsByProductIdAndPrimaryTrue(request.getProductId());
        boolean makePrimary = request.isPrimary() || !hasPrimary;

        if (makePrimary) {
            unsetExistingPrimary(request.getProductId());
            product.setBarcode(normalizedValue);
            productRepository.save(product);
        }

        BarcodeType type = request.getBarcodeType() != null
                ? request.getBarcodeType()
                : BarcodeType.EXTERNAL;

        Barcode barcode = new Barcode(
                product,
                normalizedValue,
                type,
                makePrimary
        );

        Barcode savedBarcode = barcodeRepository.save(barcode);
        return new BarcodeResponse(savedBarcode);
    }

    @Transactional(readOnly = true)
    public List<BarcodeResponse> getBarcodesByProductId(Long productId) {
        findProductOrThrow(productId);

        return barcodeRepository.findByProductId(productId)
                .stream()
                .map(BarcodeResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public BarcodeResponse getBarcodeByValue(String barcodeValue) {
        Barcode barcode = barcodeRepository.findByBarcodeValue(barcodeValue.trim())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Barcode not found"
                ));

        return new BarcodeResponse(barcode);
    }

    @Transactional
    public BarcodeResponse setPrimaryBarcode(Long barcodeId) {
        Barcode barcode = barcodeRepository.findById(barcodeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Barcode not found"
                ));

        Product product = barcode.getProduct();
        unsetExistingPrimary(product.getId());

        barcode.setPrimary(true);
        Barcode savedBarcode = barcodeRepository.save(barcode);

        product.setBarcode(savedBarcode.getBarcodeValue());
        productRepository.save(product);

        return new BarcodeResponse(savedBarcode);
    }

    @Transactional
    public void deleteBarcode(Long barcodeId) {
        Barcode barcode = barcodeRepository.findById(barcodeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Barcode not found"
                ));

        Product product = barcode.getProduct();
        boolean wasPrimary = barcode.isPrimary();

        barcodeRepository.delete(barcode);

        if (wasPrimary) {
            product.setBarcode(null);
            productRepository.save(product);
        }
    }

    private void unsetExistingPrimary(Long productId) {
        barcodeRepository.findByProductIdAndPrimaryTrue(productId)
                .ifPresent(existingPrimary -> {
                    existingPrimary.setPrimary(false);
                    barcodeRepository.save(existingPrimary);
                });
    }

    private Product findProductOrThrow(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        if (!product.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Product is inactive"
            );
        }

        return product;
    }
}
