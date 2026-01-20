package com.project.auth.dto;

import com.project.auth.entity.Role;
import com.project.auth.entity.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private Status status;
    private String department;
    private String zone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
