package com.project.complaint.dto;

import lombok.Data;

@Data
public class ComplaintRequestDto {
    private String department;
    private String description;
    private Double latitude;
    private Double longitude;
    private String locationAddress;
    // For file upload, we usually handle it as a separate RequestParam in the
    // controller,
    // but we can put metadata here.
    // Actually, for Multipart requests, it's easier to have separate params, but
    // let's see.
}
