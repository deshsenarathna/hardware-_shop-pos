package com.hardwarepos.hardware_pos_backend.product.barcode;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class BarcodeGenerator {

    // Code128 encodes the full ASCII set, but we restrict ourselves to
    // uppercase letters + digits so the human-readable text under the
    // printed barcode stays clean and unambiguous (no 0/O, 1/I confusion
    // handled by excluding easily-confused characters).
    private static final String ALPHABET =
            "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    private static final String PREFIX = "HP";

    private static final int SUFFIX_LENGTH = 6;

    private static final int MAX_ATTEMPTS = 10;

    private final BarcodeRepository barcodeRepository;
    private final SecureRandom random = new SecureRandom();

    public BarcodeGenerator(
            BarcodeRepository barcodeRepository
    ) {
        this.barcodeRepository = barcodeRepository;
    }

    /**
     * Generates a unique Code128 barcode value for the given product.
     * Format: HP-<PRODUCT_CODE>-<RANDOM_SUFFIX>
     * e.g. HP-CEM50KG-7F3Q2A
     *
     * Code128's own checksum is computed at render time by the barcode
     * rendering library, so it is not part of the stored value here.
     */
    public String generateCode128(String productCode) {

        String normalizedCode = productCode == null
                ? ""
                : productCode.trim().toUpperCase();

        String candidate = buildCode(normalizedCode);

        int attempts = 0;

        while (barcodeRepository.existsByBarcodeValue(candidate)
                && attempts < MAX_ATTEMPTS) {

            candidate = buildCode(normalizedCode);
            attempts++;
        }

        if (barcodeRepository.existsByBarcodeValue(candidate)) {
            throw new IllegalStateException(
                    "Unable to generate a unique barcode after "
                            + MAX_ATTEMPTS + " attempts"
            );
        }

        return candidate;
    }

    private String buildCode(String normalizedProductCode) {

        String suffix = randomSuffix();

        if (normalizedProductCode.isEmpty()) {
            return PREFIX + "-" + suffix;
        }

        return PREFIX + "-" + normalizedProductCode + "-" + suffix;
    }

    private String randomSuffix() {

        StringBuilder suffix = new StringBuilder(SUFFIX_LENGTH);

        for (int i = 0; i < SUFFIX_LENGTH; i++) {
            int index = random.nextInt(ALPHABET.length());
            suffix.append(ALPHABET.charAt(index));
        }

        return suffix.toString();
    }
}