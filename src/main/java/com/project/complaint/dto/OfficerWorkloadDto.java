package com.project.complaint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfficerWorkloadDto {
    private Long officerId;
    private String name;
    private String email;
    private String department;
    private Long activeComplaintCount;
    private Boolean recommended;
}
