package com.project.complaint.dto;

import lombok.Data;

@Data
public class ComplaintRequestDto {
    private String department;
    private String description;
    private Double latitude;
    private Double longitude;
    private String locationAddress;
    private String zone;
}
