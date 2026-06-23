package com.hardwarepos.hardware_pos_backend.auth;

public class LoginResponse {

    private final Long userId;
    private final String fullName;
    private final String username;
    private final String role;
    private final String message;
    private final String token;

    public LoginResponse(
            Long userId,
            String fullName,
            String username,
            String role,
            String token,
            String message
    ) {
        this.userId = userId;
        this.fullName = fullName;
        this.username = username;
        this.role = role;
        this.token = token;
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }
}