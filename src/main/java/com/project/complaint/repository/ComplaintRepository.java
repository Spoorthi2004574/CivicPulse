package com.project.complaint.repository;

import com.project.complaint.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCitizenId(Long citizenId);

    List<Complaint> findByAssignedOfficerId(Long officerId);

    List<Complaint> findByStatus(String status);

    List<Complaint> findByDepartmentAndLocationAddress(String department, String locationAddress);

    // Count active complaints for an officer (excluding RESOLVED and REJECTED)
    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.assignedOfficer.id = :officerId AND c.status NOT IN ('RESOLVED', 'REJECTED')")
    Long countActiveComplaintsByOfficer(@Param("officerId") Long officerId);

    // Find overdue complaints that haven't been escalated yet
    @Query("SELECT c FROM Complaint c WHERE c.deadline < :currentTime AND c.status NOT IN ('RESOLVED', 'REJECTED') AND (c.escalated = false OR c.escalated IS NULL)")
    List<Complaint> findOverdueComplaints(@Param("currentTime") LocalDateTime currentTime);

    // Find all complaints sorted by creation date (most recent first)
    List<Complaint> findAllByOrderByCreatedAtDesc();

    // Find complaints by citizen sorted by creation date
    List<Complaint> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    // Find complaints by officer sorted by creation date
    List<Complaint> findByAssignedOfficerIdOrderByCreatedAtDesc(Long officerId);
}
