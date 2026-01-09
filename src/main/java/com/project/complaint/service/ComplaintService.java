package com.project.complaint.service;

import com.project.auth.entity.Role;
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
                .validationStatus("PENDING_VALIDATION")
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
        // Return complaints sorted by most recent first
        return complaintRepository.findByCitizenIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Complaint> getAllComplaints() {
        // Return all complaints sorted by most recent first
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    // Admin features
    public Complaint assignComplaint(Long complaintId, Long officerId, String priority, String deadline) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User officer = userRepository.findById(officerId)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        complaint.setAssignedOfficer(officer);
        if (priority != null) {
            complaint.setPriority(priority);
        }

        // Auto-calculate deadline based on priority if not provided
        if (deadline != null && !deadline.isEmpty()) {
            complaint.setDeadline(java.time.LocalDateTime.parse(deadline));
        } else {
            // Calculate deadline based on priority
            complaint.setDeadline(calculateDeadline(priority != null ? priority : complaint.getPriority()));
        }

        return complaintRepository.save(complaint);
    }

    /**
     * Calculate deadline based on priority
     * HIGH: 48 hours, MEDIUM: 96 hours, LOW: 168 hours
     */
    private java.time.LocalDateTime calculateDeadline(String priority) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        if (priority == null) {
            priority = "LOW"; // Default
        }

        switch (priority.toUpperCase()) {
            case "HIGH":
                return now.plusHours(48);
            case "MEDIUM":
                return now.plusHours(96);
            case "LOW":
            default:
                return now.plusHours(168);
        }
    }

    /**
     * Get workload count for a specific officer
     */
    public Long getOfficerWorkload(Long officerId) {
        return complaintRepository.countActiveComplaintsByOfficer(officerId);
    }

    /**
     * Get all officers with their workload counts
     */
    public java.util.List<java.util.Map<String, Object>> getOfficersWithWorkload() {
        // Get all officers (users with role OFFICER)
        java.util.List<User> officers = userRepository.findByRole(Role.OFFICER);

        java.util.List<java.util.Map<String, Object>> result = new java.util.ArrayList<>();

        for (User officer : officers) {
            Long workload = getOfficerWorkload(officer.getId());

            java.util.Map<String, Object> officerData = new java.util.HashMap<>();
            officerData.put("officerId", officer.getId());
            officerData.put("name", officer.getName());
            officerData.put("email", officer.getEmail());
            officerData.put("activeComplaintCount", workload);

            result.add(officerData);
        }

        // Sort by workload (ascending - least busy first)
        result.sort((a, b) -> {
            Long workloadA = (Long) a.get("activeComplaintCount");
            Long workloadB = (Long) b.get("activeComplaintCount");
            return workloadA.compareTo(workloadB);
        });

        // Mark the first one (least busy) as recommended
        if (!result.isEmpty()) {
            result.get(0).put("recommended", true);
        }

        return result;
    }

    // Officer features
    /**
     * Get complaints assigned to an officer (sorted by most recent)
     */
    public List<Complaint> getOfficerComplaints(String email) {
        User officer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Officer not found"));
        return complaintRepository.findByAssignedOfficerIdOrderByCreatedAtDesc(officer.getId());
    }

    /**
     * Upload proof of work for a complaint
     */
    public Complaint uploadProofOfWork(Long complaintId, MultipartFile proofFile, String email) throws IOException {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Verify the officer is assigned to this complaint
        User officer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        if (complaint.getAssignedOfficer() == null ||
                !complaint.getAssignedOfficer().getId().equals(officer.getId())) {
            throw new RuntimeException("You are not assigned to this complaint");
        }

        // Save the proof file
        String proofUrl = null;
        if (proofFile != null && !proofFile.isEmpty()) {
            proofUrl = savePhoto(proofFile); // Reuse existing photo save method
        }

        complaint.setProofOfWorkUrl(proofUrl);
        complaint.setProofOfWorkUploadedAt(java.time.LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

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

    public java.util.Map<String, Object> getStatistics() {
        List<Complaint> allComplaints = complaintRepository.findAll();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", allComplaints.size());

        // Count by status
        java.util.Map<String, Long> statusCounts = new java.util.HashMap<>();
        statusCounts.put("PENDING", allComplaints.stream().filter(c -> "PENDING".equals(c.getStatus())).count());
        statusCounts.put("IN_PROGRESS",
                allComplaints.stream().filter(c -> "IN_PROGRESS".equals(c.getStatus())).count());
        statusCounts.put("RESOLVED", allComplaints.stream().filter(c -> "RESOLVED".equals(c.getStatus())).count());
        statusCounts.put("REJECTED", allComplaints.stream().filter(c -> "REJECTED".equals(c.getStatus())).count());
        stats.put("byStatus", statusCounts);

        // Count by priority
        java.util.Map<String, Long> priorityCounts = new java.util.HashMap<>();
        priorityCounts.put("HIGH", allComplaints.stream().filter(c -> "HIGH".equals(c.getPriority())).count());
        priorityCounts.put("MEDIUM", allComplaints.stream().filter(c -> "MEDIUM".equals(c.getPriority())).count());
        priorityCounts.put("LOW", allComplaints.stream().filter(c -> "LOW".equals(c.getPriority())).count());
        stats.put("byPriority", priorityCounts);

        return stats;
    }

    /**
     * Validate a complaint (admin only)
     */
    public Complaint validateComplaint(Long complaintId, String adminEmail) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        complaint.setValidationStatus("VALIDATED");
        complaint.setValidatedBy(admin);
        complaint.setValidatedAt(java.time.LocalDateTime.now());
        complaint.setRejectionReason(null); // Clear any previous rejection reason

        return complaintRepository.save(complaint);
    }

    /**
     * Reject a complaint with a reason (admin only)
     */
    public Complaint rejectComplaint(Long complaintId, String adminEmail, String rejectionReason) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        complaint.setValidationStatus("REJECTED_BY_ADMIN");
        complaint.setStatus("REJECTED");
        complaint.setRejectionReason(rejectionReason);
        complaint.setValidatedBy(admin);
        complaint.setValidatedAt(java.time.LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    /**
     * Rate a resolved complaint (citizen only)
     */
    public Complaint rateComplaint(Long complaintId, String citizenEmail, Integer rating, String feedback) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        // Verify the citizen owns this complaint
        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new RuntimeException("You can only rate your own complaints");
        }

        // Verify complaint is resolved
        if (!"RESOLVED".equals(complaint.getStatus())) {
            throw new RuntimeException("You can only rate resolved complaints");
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        complaint.setRating(rating);
        complaint.setFeedback(feedback);
        complaint.setRatedAt(java.time.LocalDateTime.now());

        return complaintRepository.save(complaint);
    }

    /**
     * Reopen a resolved complaint (citizen only)
     */
    public Complaint reopenComplaint(Long complaintId, String citizenEmail, String reopenReason) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        // Verify the citizen owns this complaint
        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new RuntimeException("You can only reopen your own complaints");
        }

        // Verify complaint is resolved
        if (!"RESOLVED".equals(complaint.getStatus())) {
            throw new RuntimeException("You can only reopen resolved complaints");
        }

        complaint.setStatus("IN_PROGRESS");
        complaint.setReopened(true);
        complaint.setReopenedAt(java.time.LocalDateTime.now());
        complaint.setReopenReason(reopenReason);
        complaint.setRating(null); // Clear any previous rating
        complaint.setFeedback(null);
        complaint.setRatedAt(null);
        complaint.setSatisfied(false); // Clear satisfaction status
        complaint.setSatisfiedAt(null);

        return complaintRepository.save(complaint);
    }

    /**
     * Mark a complaint as satisfied (citizen only)
     */
    public Complaint markSatisfied(Long complaintId, String citizenEmail, Boolean satisfied) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        User citizen = userRepository.findByEmail(citizenEmail)
                .orElseThrow(() -> new RuntimeException("Citizen not found"));

        // Verify the citizen owns this complaint
        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new RuntimeException("You can only mark satisfaction for your own complaints");
        }

        // Verify complaint is resolved and rated
        if (!"RESOLVED".equals(complaint.getStatus())) {
            throw new RuntimeException("You can only mark satisfaction for resolved complaints");
        }

        if (complaint.getRating() == null) {
            throw new RuntimeException("Please rate the complaint before marking satisfaction");
        }

        complaint.setSatisfied(satisfied);
        complaint.setSatisfiedAt(satisfied ? java.time.LocalDateTime.now() : null);

        return complaintRepository.save(complaint);
    }

    /**
     * Get ratings statistics for an officer
     */
    public java.util.Map<String, Object> getOfficerRatingsStatistics(String officerEmail) {
        User officer = userRepository.findByEmail(officerEmail)
                .orElseThrow(() -> new RuntimeException("Officer not found"));

        List<Complaint> ratedComplaints = complaintRepository
                .findByAssignedOfficerIdOrderByCreatedAtDesc(officer.getId())
                .stream()
                .filter(c -> c.getRating() != null)
                .collect(java.util.stream.Collectors.toList());

        java.util.Map<String, Object> stats = new java.util.HashMap<>();

        if (ratedComplaints.isEmpty()) {
            stats.put("totalRatings", 0);
            stats.put("averageRating", 0.0);
            stats.put("satisfactionRate", 0.0);
            stats.put("ratings", new java.util.ArrayList<>());
            return stats;
        }

        double avgRating = ratedComplaints.stream()
                .mapToInt(Complaint::getRating)
                .average()
                .orElse(0.0);

        long satisfiedCount = ratedComplaints.stream()
                .filter(c -> Boolean.TRUE.equals(c.getSatisfied()))
                .count();

        double satisfactionRate = (satisfiedCount * 100.0) / ratedComplaints.size();

        // Group ratings by star count
        java.util.Map<Integer, Long> ratingDistribution = ratedComplaints.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        Complaint::getRating,
                        java.util.stream.Collectors.counting()));

        stats.put("totalRatings", ratedComplaints.size());
        stats.put("averageRating", Math.round(avgRating * 100.0) / 100.0);
        stats.put("satisfactionRate", Math.round(satisfactionRate * 100.0) / 100.0);
        stats.put("satisfiedCount", satisfiedCount);
        stats.put("ratingDistribution", ratingDistribution);

        // Include recent ratings with feedback
        java.util.List<java.util.Map<String, Object>> recentRatings = ratedComplaints.stream()
                .limit(10)
                .map(c -> {
                    java.util.Map<String, Object> ratingInfo = new java.util.HashMap<>();
                    ratingInfo.put("complaintId", c.getId());
                    ratingInfo.put("rating", c.getRating());
                    ratingInfo.put("feedback", c.getFeedback());
                    ratingInfo.put("satisfied", c.getSatisfied());
                    ratingInfo.put("ratedAt", c.getRatedAt());
                    ratingInfo.put("department", c.getDepartment());
                    return ratingInfo;
                })
                .collect(java.util.stream.Collectors.toList());

        stats.put("recentRatings", recentRatings);

        return stats;
    }
}
