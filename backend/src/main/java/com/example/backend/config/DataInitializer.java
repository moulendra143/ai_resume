package com.example.backend.config;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() {
        Role adminRole = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(null, Role.ERole.ROLE_ADMIN)));
        Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(null, Role.ERole.ROLE_USER)));

        if (userRepository.findByEmail("admin@ai-resume.com").isEmpty()) {
            User admin = User.builder()
                    .fullName("Platform Administrator")
                    .email("admin@ai-resume.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .isActive(true)
                    .isEmailVerified(true)
                    .roles(new HashSet<>(Set.of(adminRole, userRole)))
                    .build();
            userRepository.save(admin);
        }
    }
}
