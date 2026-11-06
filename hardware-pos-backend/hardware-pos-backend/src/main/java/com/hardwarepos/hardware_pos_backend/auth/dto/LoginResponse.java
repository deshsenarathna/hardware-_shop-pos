package com.hardwarepos.hardware_pos_backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {

    private final Long userId;
    private final String fullName;
    private final String username;
    private final String role;
    private final String token;
    private final String refreshToken;
    private final String message;

    public LoginResponse(
            Long userId,
            String fullName,
            String username,
            String role,
            String token,
            String message
    ) {
        this(userId, fullName, username, role, token, null, message);
    }
}
