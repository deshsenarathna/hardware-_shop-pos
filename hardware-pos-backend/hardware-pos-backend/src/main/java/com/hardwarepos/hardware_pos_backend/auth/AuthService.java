package com.hardwarepos.hardware_pos_backend.auth;

import com.hardwarepos.hardware_pos_backend.auth.dto.LoginRequest;
import com.hardwarepos.hardware_pos_backend.auth.dto.LoginResponse;
import com.hardwarepos.hardware_pos_backend.auth.dto.RefreshTokenRequest;
import com.hardwarepos.hardware_pos_backend.auth.dto.TokenRefreshResponse;
import com.hardwarepos.hardware_pos_backend.user.AppUser;
import com.hardwarepos.hardware_pos_backend.user.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public LoginResponse login(LoginRequest request) {

        AppUser user = appUserRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid username or password"
                ));

        if (!user.isActive()) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User account is inactive"
            );
        }

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!passwordMatches) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
                );
        }

        String token = jwtService.generateToken(user);
        //RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return new LoginResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getRole().getName().name(),
                token,
                //refreshToken.getToken(),
                "Login successful"
        );
    }

    public TokenRefreshResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken newRefreshToken = refreshTokenService.verifyAndRotate(request.getRefreshToken());
        String newAccessToken = jwtService.generateToken(newRefreshToken.getUser());

        return new TokenRefreshResponse(newAccessToken, newRefreshToken.getToken());
    }

    public void logout(RefreshTokenRequest request) {
        if (request != null && request.getRefreshToken() != null) {
            refreshTokenService.revokeToken(request.getRefreshToken());
        }
    }
}
