package com.project.auth.service.impl;

import com.project.auth.dto.ApproveOfficerResponse;
import com.project.auth.dto.UserResponse;
import com.project.auth.entity.Role;
import com.project.auth.entity.Status;
import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import com.project.auth.service.AdminService;
import com.project.auth.util.SecretKeyGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecretKeyGenerator secretKeyGenerator;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserResponse> getPendingOfficers() {
        List<User> pendingOfficers = userRepository.findByRoleAndStatus(Role.OFFICER, Status.PENDING_VERIFICATION);

        return pendingOfficers.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponse> getApprovedOfficers() {
        List<User> approvedOfficers = userRepository.findByRoleAndStatus(Role.OFFICER, Status.APPROVED);

        return approvedOfficers.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ApproveOfficerResponse approveOfficer(Long officerId) {
        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found with id: " + officerId));

        // Validate that the user is an officer
        if (officer.getRole() != Role.OFFICER) {
            throw new RuntimeException("User is not an officer");
        }

        // Validate that the officer is pending
        if (officer.getStatus() != Status.PENDING_VERIFICATION) {
            throw new RuntimeException("Officer is not in pending verification status");
        }

        // Generate secret key
        String secretKey = secretKeyGenerator.generateSecretKey();

        // Hash the secret key
        String hashedSecretKey = passwordEncoder.encode(secretKey);

        // Update officer
        officer.setSecretKeyHash(hashedSecretKey);
        officer.setStatus(Status.APPROVED);
        officer = userRepository.save(officer);

        return ApproveOfficerResponse.builder()
                .officerId(officer.getId())
                .officerName(officer.getName())
                .officerEmail(officer.getEmail())
                .department(officer.getDepartment())
                .secretKey(secretKey)
                .message("Officer approved successfully")
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .department(user.getDepartment())
                .zone(user.getZone())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
