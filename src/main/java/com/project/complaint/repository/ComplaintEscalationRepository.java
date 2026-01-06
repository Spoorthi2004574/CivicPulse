package com.project.complaint.repository;

import com.project.complaint.model.ComplaintEscalation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintEscalationRepository extends JpaRepository<ComplaintEscalation, Long> {

    List<ComplaintEscalation> findByComplaintId(Long complaintId);

    List<ComplaintEscalation> findByComplaintIdOrderByEscalatedAtDesc(Long complaintId);

    List<ComplaintEscalation> findByResolvedFalse();
}
