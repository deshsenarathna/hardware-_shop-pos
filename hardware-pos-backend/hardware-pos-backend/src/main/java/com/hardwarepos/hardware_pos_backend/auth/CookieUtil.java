package com.hardwarepos.hardware_pos_backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class CookieUtil {

    private final long refreshExpirationMillis;

    public CookieUtil(@Value("${app.jwt.refresh-expiration:604800000}") long refreshExpirationMillis) {
        this.refreshExpirationMillis = refreshExpirationMillis;
    }

    public ResponseCookie createRefreshTokenCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false) // Set to true when running behind HTTPS in production
                .path("/api/auth")
                .maxAge(Duration.ofMillis(refreshExpirationMillis))
                .sameSite("Lax")
                .build();
    }

    public ResponseCookie deleteRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }
}
