package com.project.auth.controller;

import com.project.auth.dto.ApproveOfficerResponse;
import com.project.auth.dto.UserResponse;
import com.project.auth.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/officers/pending")
    public ResponseEntity<?> getPendingOfficers() {
        try {
            List<UserResponse> pendingOfficers = adminService.getPendingOfficers();
            return ResponseEntity.ok(pendingOfficers);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/officers/approved")
    public ResponseEntity<?> getApprovedOfficers() {
        try {
            List<UserResponse> approvedOfficers = adminService.getApprovedOfficers();
            return ResponseEntity.ok(approvedOfficers);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/officers/{id}/approve")
    public ResponseEntity<?> approveOfficer(@PathVariable Long id) {
        try {
            ApproveOfficerResponse response = adminService.approveOfficer(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
