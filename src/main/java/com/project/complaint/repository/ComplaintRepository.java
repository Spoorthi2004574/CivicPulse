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

    // Analytics Queries
    @Query("SELECT c.department, COUNT(c) FROM Complaint c GROUP BY c.department")
    List<Object[]> countByDepartment();

    @Query("SELECT c.zone, COUNT(c) FROM Complaint c WHERE c.zone IS NOT NULL GROUP BY c.zone")
    List<Object[]> countByZone();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'RESOLVED' AND c.resolvedAt <= c.deadline")
    Long countSlaMet();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = 'RESOLVED' AND c.resolvedAt > c.deadline")
    Long countSlaViolated();

    @Query("SELECT c.zone, c.locationAddress, COUNT(c) FROM Complaint c GROUP BY c.zone, c.locationAddress HAVING COUNT(c) > 1 ORDER BY COUNT(c) DESC")
    List<Object[]> findRedZones();

    // For Officer (Zone-specific)
    @Query("SELECT c.department, COUNT(c) FROM Complaint c WHERE c.zone = :zone GROUP BY c.department")
    List<Object[]> countByDepartmentInZone(@Param("zone") String zone);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.zone = :zone AND c.status = 'RESOLVED' AND c.resolvedAt <= c.deadline")
    Long countSlaMetInZone(@Param("zone") String zone);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.zone = :zone AND c.status = 'RESOLVED' AND c.resolvedAt > c.deadline")
    Long countSlaViolatedInZone(@Param("zone") String zone);

    Long countByZoneAndStatus(String zone, String status);

    Long countByZone(String zone);
}
