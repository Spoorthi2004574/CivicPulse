package com.project.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApproveOfficerResponse {
    private Long officerId;
    private String officerName;
    private String officerEmail;
    private String department;
    private String secretKey;
    private String message;
}





