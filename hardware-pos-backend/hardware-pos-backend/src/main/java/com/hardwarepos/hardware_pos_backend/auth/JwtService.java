package com.hardwarepos.hardware_pos_backend.auth;

import com.hardwarepos.hardware_pos_backend.user.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long jwtExpiration;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${app.jwt.expiration}") long jwtExpiration
    ) {
        this.jwtEncoder = jwtEncoder;
        this.jwtExpiration = jwtExpiration;
    }

    public String generateToken(AppUser user) {

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusMillis(jwtExpiration);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("hardware-pos-backend")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getUsername())
                .claim("userId", user.getId())
                .claim("role", user.getRole().getName().name())
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        JwtEncoderParameters parameters =
                JwtEncoderParameters.from(header, claims);

        return jwtEncoder
                .encode(parameters)
                .getTokenValue();
    }
}