package com.hardwarepos.hardware_pos_backend.auth;

import com.hardwarepos.hardware_pos_backend.auth.dto.LoginRequest;
import com.hardwarepos.hardware_pos_backend.auth.dto.LoginResponse;
import com.hardwarepos.hardware_pos_backend.auth.dto.RefreshTokenRequest;
import com.hardwarepos.hardware_pos_backend.auth.dto.TokenRefreshResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieUtil cookieUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        ResponseCookie cookie = cookieUtil.createRefreshTokenCookie(response.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest
    ) {
        String tokenToVerify = cookieRefreshToken;
        if (tokenToVerify == null || tokenToVerify.isBlank()) {
            if (bodyRequest != null) {
                tokenToVerify = bodyRequest.getRefreshToken();
            }
        }

        if (tokenToVerify == null || tokenToVerify.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is missing");
        }

        TokenRefreshResponse response = authService.refreshToken(new RefreshTokenRequest(tokenToVerify));

        ResponseCookie newCookie = cookieUtil.createRefreshTokenCookie(response.getRefreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, newCookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest
    ) {
        String tokenToRevoke = cookieRefreshToken;
        if (tokenToRevoke == null || tokenToRevoke.isBlank()) {
            if (bodyRequest != null) {
                tokenToRevoke = bodyRequest.getRefreshToken();
            }
        }

        if (tokenToRevoke != null && !tokenToRevoke.isBlank()) {
            authService.logout(new RefreshTokenRequest(tokenToRevoke));
        }

        ResponseCookie deleteCookie = cookieUtil.deleteRefreshTokenCookie();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }
}
