package com.hardwarepos.hardware_pos_backend.auth;

import com.hardwarepos.hardware_pos_backend.user.AppUser;
import com.hardwarepos.hardware_pos_backend.user.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final AppUserRepository appUserRepository;
    private final long refreshExpiration;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            AppUserRepository appUserRepository,
            @Value("${app.jwt.refresh-expiration:604800000}") long refreshExpiration
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.appUserRepository = appUserRepository;
        this.refreshExpiration = refreshExpiration;
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        // Invalidate old tokens for this user on new login
        refreshTokenRepository.deleteByUser(user);

        RefreshToken refreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                Instant.now().plusMillis(refreshExpiration)
        );

        return refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public RefreshToken verifyAndRotate(String tokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(tokenString)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found or invalid"));

        if (refreshToken.isRevoked()) {
            refreshTokenRepository.deleteByUser(refreshToken.getUser());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired. Please log in again");
        }

        AppUser user = refreshToken.getUser();
        if (!user.isActive()) {
            refreshTokenRepository.deleteByUser(user);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is inactive");
        }

        // Token rotation: remove old token, issue a fresh one
        refreshTokenRepository.delete(refreshToken);

        RefreshToken newRefreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                Instant.now().plusMillis(refreshExpiration)
        );

        return refreshTokenRepository.save(newRefreshToken);
    }

    @Transactional
    public void revokeToken(String tokenString) {
        if (tokenString != null && !tokenString.isBlank()) {
            refreshTokenRepository.findByToken(tokenString.trim()).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }
}
