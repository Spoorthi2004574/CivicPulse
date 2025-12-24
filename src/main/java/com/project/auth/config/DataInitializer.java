package com.project.auth.config;

import com.project.auth.entity.Role;
import com.project.auth.entity.Status;
import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create default admin user if it doesn't exist
        Optional<User> adminOptional = userRepository.findByEmail("admin@civicpulse.com");
        
        if (adminOptional.isEmpty()) {
            User admin = User.builder()
                    .name("System Administrator")
                    .email("admin@civicpulse.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .status(Status.ACTIVE)
                    .department("Administration")
                    .secretKeyHash(null)
                    .build();
            
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@civicpulse.com / Admin@123");
        }
    }
}





