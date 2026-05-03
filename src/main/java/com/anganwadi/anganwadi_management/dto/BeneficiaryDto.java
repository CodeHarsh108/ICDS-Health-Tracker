package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BeneficiaryDto {
    private Long id;
    private String awcBeneficiaryId;   // auto-generated, not required in request
    @NotBlank private String fullName;
    @NotNull private LocalDate dateOfBirth;
    @NotBlank private String gender;    // MALE, FEMALE, OTHER
    @Pattern(regexp = "^\\d{12}$", message = "Aadhaar must be 12 digits")
    private String aadhaarNumber;
    @NotBlank private String parentName;
    @NotBlank @Pattern(regexp = "\\d{10}") private String parentMobile;
    @NotNull private Long centerId;
    private Boolean active;
}
