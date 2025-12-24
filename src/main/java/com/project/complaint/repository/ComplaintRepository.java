package com.project.complaint.repository;

import com.project.complaint.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByCitizenId(Long citizenId);

    List<Complaint> findByAssignedOfficerId(Long officerId);

    List<Complaint> findByStatus(String status);

    List<Complaint> findByDepartmentAndLocationAddress(String department, String locationAddress);
}
