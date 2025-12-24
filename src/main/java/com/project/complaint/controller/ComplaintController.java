package com.project.complaint.controller;

import com.project.complaint.dto.ComplaintRequestDto;
import com.project.complaint.model.Complaint;
import com.project.complaint.service.ComplaintService;
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

    @PutMapping("/{id}/assign")
    public ResponseEntity<Complaint> assignComplaint(
            @PathVariable Long id,
            @RequestParam Long officerId,
            @RequestParam String priority) {
        return ResponseEntity.ok(complaintService.assignComplaint(id, officerId, priority));
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
}
