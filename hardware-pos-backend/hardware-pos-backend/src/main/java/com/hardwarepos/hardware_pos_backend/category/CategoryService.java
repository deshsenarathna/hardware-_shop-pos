package com.hardwarepos.hardware_pos_backend.category;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(
            CategoryRepository categoryRepository
    ) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryResponse createCategory(
            CategoryRequest request
    ) {
        String categoryName = request.getName().trim();

        String description = request.getDescription() == null
                ? null
                : request.getDescription().trim();

        if (categoryRepository.existsByNameIgnoreCase(categoryName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Category name already exists"
            );
        }

        Category category = new Category(
                categoryName,
                description
        );

        Category savedCategory =
                categoryRepository.save(category);

        return convertToResponse(savedCategory);
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private CategoryResponse convertToResponse(
            Category category
    ) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.isActive()
        );
    }
}