package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class WorkerDto {
    private Long id;
    @NotBlank private String employeeId;
    @NotBlank private String fullName;
    @NotBlank @Pattern(regexp = "\\d{10}") private String mobile;
    private String email;
    private String role;     // ADMIN, SUPERVISOR, WORKER
    private Long centerId;   // optional for admin/supervisor
    private Boolean active;
}
