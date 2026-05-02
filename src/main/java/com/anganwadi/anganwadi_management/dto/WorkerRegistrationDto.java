package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkerRegistrationDto {
    @NotBlank private String employeeId;
    @NotBlank private String fullName;
    @NotBlank private String mobile;
    private String email;
    @NotBlank private String role;   // ADMIN, SUPERVISOR, WORKER
    private Long centerId;           // optional for admin/supervisor
    @NotBlank private String password;
}