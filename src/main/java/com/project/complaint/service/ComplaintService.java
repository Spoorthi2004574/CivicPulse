package com.project.complaint.service;

import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import com.project.complaint.dto.ComplaintRequestDto;
import com.project.complaint.model.Complaint;
import com.project.complaint.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/";

    public Complaint fileComplaint(ComplaintRequestDto request, MultipartFile photo, String email) throws IOException {
        User citizen = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            photoUrl = savePhoto(photo);
        }

        Complaint complaint = Complaint.builder()
                .department(request.getDepartment())
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationAddress(request.getLocationAddress())
                .photoUrl(photoUrl)
                .status("PENDING")
                .priority("LOW") // Default
                .citizen(citizen)
                .build();

        return complaintRepository.save(complaint);
    }

    private String savePhoto(MultipartFile photo) throws IOException {
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(photo.getInputStream(), filePath);

        return fileName;
    }

    public List<Complaint> getMyComplaints(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Assuming user is citizen for now, or we can filter based on role
        return complaintRepository.findByCitizenId(user.getId());
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Admin features
    public Complaint assignComplaint(Long complaintId, Long officerId, String priority) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        complaint.setAssignedOfficer(officer);
        if (priority != null) {
            complaint.setPriority(priority);
        }

        return complaintRepository.save(complaint);
    }

    // Officer features
    public Complaint updateStatus(Long complaintId, String status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        complaint.setStatus(status);
        return complaintRepository.save(complaint);
    }

    public List<Complaint> checkDuplicates(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Simple logic: Same Department and same Address, excluding the complaint
        // itself
        List<Complaint> potentialDuplicates = complaintRepository.findByDepartmentAndLocationAddress(
                complaint.getDepartment(),
                complaint.getLocationAddress());

        potentialDuplicates.removeIf(c -> c.getId().equals(complaintId));
        return potentialDuplicates;
    }
}
