package com.hardwarepos.hardware_pos_backend.user;

import com.hardwarepos.hardware_pos_backend.role.Role;
import com.hardwarepos.hardware_pos_backend.role.RoleName;
import com.hardwarepos.hardware_pos_backend.role.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final AppUserRepository appUserRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            AppUserRepository appUserRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.appUserRepository = appUserRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse createUser(CreateUserRequest request) {

        // Do not allow another OWNER account through this API
        if (request.getRole() == RoleName.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only MANAGER or CASHIER accounts can be created"
            );
        }

        if (appUserRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        if (
                request.getEmail() != null
                        && !request.getEmail().isBlank()
                        && appUserRepository.existsByEmail(request.getEmail())
        ) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selected role does not exist"
                ));

        String passwordHash =
                passwordEncoder.encode(request.getPassword());

        AppUser user = new AppUser(
                request.getFullName(),
                request.getUsername(),
                passwordHash,
                request.getEmail(),
                role
        );

        AppUser savedUser = appUserRepository.save(user);

        return convertToResponse(savedUser);
    }

    public List<UserResponse> getAllUsers() {
        return appUserRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    private UserResponse convertToResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().getName().name(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}