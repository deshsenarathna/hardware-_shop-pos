package com.hardwarepos.hardware_pos_backend.sales.dto;

import java.util.List;

/**
 * Generic response DTO representing a paginated slice of data.
 *
 * Concepts for learning:
 * - content: The actual records for the requested page (e.g., 20 sales).
 * - page: The current page index (zero-based: 0 is the first page).
 * - size: How many records were requested per page.
 * - totalElements: Total matching rows in the database across all pages.
 * - totalPages: Total number of pages available (Math.ceil(totalElements / size)).
 * - first: True if this is the first page (page == 0).
 * - last: True if this is the last page (page == totalPages - 1 or totalPages == 0).
 */
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean first;
    private final boolean last;

    public PagedResponse(
            List<T> content,
            int page,
            int size,
            long totalElements,
            int totalPages,
            boolean first,
            boolean last
    ) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.first = first;
        this.last = last;
    }

    public List<T> getContent() {
        return content;
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public boolean isLast() {
        return last;
    }
}
