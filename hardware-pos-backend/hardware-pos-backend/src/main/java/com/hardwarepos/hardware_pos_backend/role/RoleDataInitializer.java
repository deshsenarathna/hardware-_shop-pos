package com.hardwarepos.hardware_pos_backend.role;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public RoleDataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {

        createRoleIfNotExists(
                RoleName.OWNER,
                "Full access to the POS system"
        );

        createRoleIfNotExists(
                RoleName.MANAGER,
                "Manages products, stock, purchases, discounts and reports"
        );

        createRoleIfNotExists(
                RoleName.CASHIER,
                "Handles billing, payments and receipt printing"
        );
    }

    private void createRoleIfNotExists(
            RoleName roleName,
            String description
    ) {

        if (!roleRepository.existsByName(roleName)) {

            Role role = new Role(roleName, description);

            roleRepository.save(role);
        }
    }
}