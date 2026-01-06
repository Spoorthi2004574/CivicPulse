package com.project.complaint.controller;

import com.project.complaint.dto.ComplaintRequestDto;
import com.project.complaint.model.Complaint;
import com.project.complaint.model.ComplaintEscalation;
import com.project.complaint.service.ComplaintService;
import com.project.complaint.service.EscalationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final EscalationService escalationService;

    @PostMapping(consumes = { "multipart/form-data" })
    public ResponseEntity<?> fileComplaint(
            @RequestParam("department") String department,
            @RequestParam("description") String description,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "locationAddress", required = false) String locationAddress,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            ComplaintRequestDto request = new ComplaintRequestDto();
            request.setDepartment(department);
            request.setDescription(description);
            request.setLatitude(latitude);
            request.setLongitude(longitude);
            request.setLocationAddress(locationAddress);

            Complaint complaint = complaintService.fileComplaint(request, photo, email);
            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error filing complaint: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Complaint controller is working!");
    }

    @GetMapping("/my")
    public ResponseEntity<List<Complaint>> getMyComplaints() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(complaintService.getMyComplaints(email));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/officer/my")
    public ResponseEntity<List<Complaint>> getOfficerComplaints() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(complaintService.getOfficerComplaints(email));
    }

    @PostMapping("/{id}/proof")
    public ResponseEntity<?> uploadProofOfWork(
            @PathVariable Long id,
            @RequestPart(value = "proof", required = true) MultipartFile proof) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Complaint updated = complaintService.uploadProofOfWork(id, proof, email);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error uploading proof: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignComplaint(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestParam String priority,
            @RequestParam(required = false) String deadline) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, officerId, priority, deadline));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(complaintService.updateStatus(id, status));
    }

    @GetMapping("/{id}/duplicates")
    public ResponseEntity<List<Complaint>> checkDuplicates(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.checkDuplicates(id));
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        return ResponseEntity.ok(complaintService.getStatistics());
    }

    @GetMapping("/officers/workload")
    public ResponseEntity<?> getOfficersWithWorkload() {
        return ResponseEntity.ok(complaintService.getOfficersWithWorkload());
    }

    @PostMapping("/{id}/escalate")
    public ResponseEntity<?> escalateComplaint(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        try {
            String escalationReason = reason != null ? reason : "Manual escalation by admin";
            Complaint escalated = escalationService.escalateComplaint(id, escalationReason);
            return ResponseEntity.ok(escalated);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error escalating complaint: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/escalation-history")
    public ResponseEntity<List<ComplaintEscalation>> getEscalationHistory(@PathVariable Long id) {
        try {
            List<ComplaintEscalation> history = escalationService.getEscalationHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<?> validateComplaint(@PathVariable Long id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Complaint validated = complaintService.validateComplaint(id, email);
            return ResponseEntity.ok(validated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error validating complaint: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectComplaint(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Complaint rejected = complaintService.rejectComplaint(id, email, reason);
            return ResponseEntity.ok(rejected);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error rejecting complaint: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateComplaint(
            @PathVariable Long id,
            @RequestParam Integer rating,
            @RequestParam(required = false) String feedback) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Complaint rated = complaintService.rateComplaint(id, email, rating, feedback);
            return ResponseEntity.ok(rated);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error rating complaint: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<?> reopenComplaint(
            @PathVariable Long id,
            @RequestParam String reason) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();

            Complaint reopened = complaintService.reopenComplaint(id, email, reason);
            return ResponseEntity.ok(reopened);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error reopening complaint: " + e.getMessage());
        }
    }
}
