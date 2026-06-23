package com.hardwarepos.hardware_pos_backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class SecurityTestController {

    @GetMapping("/protected")
    public Map<String, String> protectedEndpoint(
            Authentication authentication
    ) {
        return Map.of(
                "message", "JWT is valid",
                "username", authentication.getName()
        );
    }

    @GetMapping("/owner")
    public Map<String, String> ownerEndpoint(
            Authentication authentication
    ) {
        return Map.of(
                "message", "Owner access granted",
                "username", authentication.getName()
        );
    }
}