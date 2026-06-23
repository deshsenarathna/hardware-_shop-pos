package com.hardwarepos.hardware_pos_backend.user;

import java.time.LocalDateTime;

public class UserResponse {

    private final Long id;
    private final String fullName;
    private final String username;
    private final String email;
    private final String role;
    private final boolean active;
    private final LocalDateTime createdAt;

    public UserResponse(
            Long id,
            String fullName,
            String username,
            String email,
            String role,
            boolean active,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}