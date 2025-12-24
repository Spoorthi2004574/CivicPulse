package com.project.auth.service;

import com.project.auth.dto.ApproveOfficerResponse;
import com.project.auth.dto.UserResponse;

import java.util.List;

public interface AdminService {
    List<UserResponse> getPendingOfficers();

    List<UserResponse> getApprovedOfficers();

    ApproveOfficerResponse approveOfficer(Long officerId);
}
