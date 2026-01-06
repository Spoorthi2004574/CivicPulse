package com.project.complaint.service;

import com.project.auth.entity.Role;
import com.project.auth.entity.User;
import com.project.auth.repository.UserRepository;
import com.project.complaint.model.Complaint;
import com.project.complaint.model.ComplaintEscalation;
import com.project.complaint.repository.ComplaintEscalationRepository;
import com.project.complaint.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscalationService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintEscalationRepository escalationRepository;
    private final UserRepository userRepository;

    /**
     * Check for overdue complaints and escalate them automatically
     */
    @Transactional
    public void checkAndEscalateOverdueComplaints() {
        LocalDateTime now = LocalDateTime.now();
        List<Complaint> overdueComplaints = complaintRepository.findOverdueComplaints(now);

        log.info("Found {} overdue complaints to escalate", overdueComplaints.size());

        for (Complaint complaint : overdueComplaints) {
            try {
                String reason = String.format("Automatic escalation: Complaint exceeded deadline of %s",
                        complaint.getDeadline());
                escalateComplaint(complaint.getId(), reason);
                log.info("Successfully escalated complaint ID: {}", complaint.getId());
            } catch (Exception e) {
                log.error("Failed to escalate complaint ID: {}", complaint.getId(), e);
            }
        }
    }

    /**
     * Escalate a specific complaint
     */
    @Transactional
    public Complaint escalateComplaint(Long complaintId, String reason) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // Don't escalate if already escalated
        if (Boolean.TRUE.equals(complaint.getEscalated())) {
            log.warn("Complaint {} is already escalated", complaintId);
            return complaint;
        }

        // Find an admin to escalate to
        List<User> admins = userRepository .findByRole(Role.ADMIN);
        if (admins.isEmpty()) {
            throw new RuntimeException("No admin users found for escalation");
        }

        User admin = admins.get(0); // Assign to first admin (can be enhanced with load balancing)
        User originalOfficer = complaint.getAssignedOfficer();

        // Create escalation record
        ComplaintEscalation escalation = ComplaintEscalation.builder()
                .complaint(complaint)
                .originalOfficer(originalOfficer)
                .escalatedTo(admin)
                .escalationReason(reason)
                .resolved(false)
                .build();

        escalationRepository.save(escalation);

        // Update complaint
        complaint.setEscalated(true);
        complaint.setEscalatedAt(LocalDateTime.now());
        complaint.setEscalationReason(reason);
        complaint.setAssignedOfficer(admin); // Reassign to admin

        return complaintRepository.save(complaint);
    }

    /**
     * Get escalation history for a complaint
     */
    public List<ComplaintEscalation> getEscalationHistory(Long complaintId) {
        return escalationRepository.findByComplaintIdOrderByEscalatedAtDesc(complaintId);
    }

    /**
     * Mark an escalation as resolved
     */
    @Transactional
    public void resolveEscalation(Long escalationId) {
        ComplaintEscalation escalation = escalationRepository.findById(escalationId)
                .orElseThrow(() -> new RuntimeException("Escalation not found"));

        escalation.setResolved(true);
        escalationRepository.save(escalation);
    }

    /**
     * Get all unresolved escalations
     */
    public List<ComplaintEscalation> getUnresolvedEscalations() {
        return escalationRepository.findByResolvedFalse();
    }
}
