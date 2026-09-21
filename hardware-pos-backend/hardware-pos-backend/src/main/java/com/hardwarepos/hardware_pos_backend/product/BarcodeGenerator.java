package com.hardwarepos.hardware_pos_backend.product;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class BarcodeGenerator {

    private static final int BARCODE_LENGTH = 13;
    private final SecureRandom random = new SecureRandom();

    /**
     * Produces one random numeric candidate barcode.
     * Does NOT guarantee uniqueness — the caller is responsible
     * for checking/retrying against the database.
     */
    public String generateCandidate() {
        StringBuilder sb = new StringBuilder(BARCODE_LENGTH);

        for (int i = 0; i < BARCODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }

        return sb.toString();
    }
}