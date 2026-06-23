
        package com.hardwarepos.hardware_pos_backend.brand;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BrandService {

    private final BrandRepository brandRepository;

    public BrandService(BrandRepository brandRepository) {
        this.brandRepository = brandRepository;
    }

    public BrandResponse createBrand(BrandRequest request) {

        String brandName = request.getName().trim();

        String description = request.getDescription() == null
                ? null
                : request.getDescription().trim();

        if (brandRepository.existsByNameIgnoreCase(brandName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Brand name already exists"
            );
        }

        Brand brand = new Brand(
                brandName,
                description
        );

        Brand savedBrand = brandRepository.save(brand);

        return convertToResponse(savedBrand);
    }

    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private BrandResponse convertToResponse(Brand brand) {
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getDescription(),
                brand.isActive()
        );
    }
}

