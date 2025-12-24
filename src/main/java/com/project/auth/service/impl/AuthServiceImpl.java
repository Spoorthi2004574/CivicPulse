package com.project.auth.service.impl;

import com.project.auth.dto.JwtResponse;
import com.project.auth.dto.LoginRequest;
import com.project.auth.dto.SignupRequest;
import com.project.auth.entity.Role;
import com.project.auth.entity.Status;
import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import com.project.auth.security.JwtUtil;
import com.project.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Override
    public JwtResponse registerUser(SignupRequest signupRequest) {
        // Check if email already exists
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Disallow ADMIN signup
        if (signupRequest.getRole() == Role.ADMIN) {
            throw new RuntimeException("Admin signup is not allowed");
        }

        User user = User.builder()
                .name(signupRequest.getName())
                .email(signupRequest.getEmail())
                .password(passwordEncoder.encode(signupRequest.getPassword()))
                .role(signupRequest.getRole())
                .department(signupRequest.getDepartment())
                .build();

        // Set status based on role
        if (signupRequest.getRole() == Role.CITIZEN) {
            user.setStatus(Status.ACTIVE);
        } else if (signupRequest.getRole() == Role.OFFICER) {
            user.setStatus(Status.PENDING_VERIFICATION);
            user.setSecretKeyHash(null);
        }

        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
    }

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // Authenticate user with Spring Security (throws exception if credentials are invalid)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        // Get user from database
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Validate officer-specific requirements
        if (user.getRole() == Role.OFFICER) {
            // Check if status is APPROVED
            if (user.getStatus() != Status.APPROVED) {
                throw new RuntimeException("Officer account is not approved yet");
            }

            // Validate secret key
            if (loginRequest.getSecretKey() == null || loginRequest.getSecretKey().isEmpty()) {
                throw new RuntimeException("Secret key is required for officer login");
            }

            // Verify secret key hash
            if (user.getSecretKeyHash() == null || 
                !passwordEncoder.matches(loginRequest.getSecretKey(), user.getSecretKeyHash())) {
                throw new RuntimeException("Invalid secret key");
            }
        }

        // For CITIZEN, no secret key required
        if (user.getRole() == Role.CITIZEN) {
            if (user.getStatus() != Status.ACTIVE) {
                throw new RuntimeException("Citizen account is not active");
            }
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
    }
}
