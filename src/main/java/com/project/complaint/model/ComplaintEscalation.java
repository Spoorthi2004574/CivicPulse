package com.project.complaint.model;

import com.project.auth.entity.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_escalations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintEscalation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne
    @JoinColumn(name = "original_officer_id")
    private User originalOfficer;

    @ManyToOne
    @JoinColumn(name = "escalated_to_id")
    private User escalatedTo;

    @Column(name = "escalation_reason", columnDefinition = "TEXT")
    private String escalationReason;

    @CreationTimestamp
    @Column(name = "escalated_at", nullable = false, updatable = false)
    private LocalDateTime escalatedAt;

    @Column(name = "resolved")
    private Boolean resolved = false;
}
