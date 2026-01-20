package com.project.complaint.model;

import com.project.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "photo_url")
    private String photoUrl;

    private Double latitude;

    private Double longitude;

    @Column(name = "location_address")
    private String locationAddress;

    @Column(nullable = false)
    private String status; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    @Column(nullable = true)
    private String priority; // HIGH, MEDIUM, LOW

    @Column(nullable = true)
    private String zone;

    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne
    @JoinColumn(name = "officer_id")
    private User assignedOfficer;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Builder.Default
    @Column(name = "escalated")
    private Boolean escalated = false;

    @Column(name = "escalated_at")
    private LocalDateTime escalatedAt;

    @Column(name = "escalation_reason", length = 500)
    private String escalationReason;

    @Column(name = "proof_of_work_url")
    private String proofOfWorkUrl;

    @Column(name = "proof_of_work_uploaded_at")
    private LocalDateTime proofOfWorkUploadedAt;

    @Column(name = "validation_status")
    private String validationStatus; // PENDING_VALIDATION, VALIDATED, REJECTED_BY_ADMIN

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "validated_by")
    private User validatedBy;

    @Column(name = "validated_at")
    private LocalDateTime validatedAt;

    @Column(name = "rating")
    private Integer rating; // 1-5 stars, null if not rated

    @Column(name = "feedback", length = 1000)
    private String feedback; // Optional feedback from citizen

    @Column(name = "rated_at")
    private LocalDateTime ratedAt;

    @Builder.Default
    @Column(name = "satisfied")
    private Boolean satisfied = false;

    @Column(name = "satisfied_at")
    private LocalDateTime satisfiedAt;

    @Builder.Default
    @Column(name = "reopened")
    private Boolean reopened = false;

    @Column(name = "reopened_at")
    private LocalDateTime reopenedAt;

    @Column(name = "reopen_reason", length = 500)
    private String reopenReason;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
