package com.hardwarepos.hardware_pos_backend.user;

import com.hardwarepos.hardware_pos_backend.role.Role;
import com.hardwarepos.hardware_pos_backend.role.RoleName;
import com.hardwarepos.hardware_pos_backend.role.RoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserDataInitializer implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.owner.full-name}")
    private String ownerFullName;

    @Value("${app.owner.username}")
    private String ownerUsername;

    @Value("${app.owner.password}")
    private String ownerPassword;

    @Value("${app.owner.email}")
    private String ownerEmail;

    public UserDataInitializer(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (appUserRepository.existsByUsername(ownerUsername)) {
            return;
        }

        Role ownerRole = roleRepository.findByName(RoleName.OWNER)
                .orElseThrow(() ->
                        new IllegalStateException("OWNER role not found")
                );

        String encodedPassword =
                passwordEncoder.encode(ownerPassword);

        AppUser owner = new AppUser(
                ownerFullName,
                ownerUsername,
                encodedPassword,
                ownerEmail,
                ownerRole
        );

        appUserRepository.save(owner);
    }
}