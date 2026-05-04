package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class GrowthRecordDto {
    private Long id;

    private Long beneficiaryId;

    @NotNull(message = "Record date is required")
    private LocalDate recordDate;

    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.5", message = "Weight must be at least 0.5 kg")
    @DecimalMax(value = "50.0", message = "Weight must be at most 50 kg")
    private Double weightKg;

    @DecimalMin(value = "20.0", message = "Height must be at least 20 cm")
    @DecimalMax(value = "150.0", message = "Height must be at most 150 cm")
    private Double heightCm;

    @DecimalMin(value = "5.0", message = "MUAC must be at least 5 cm")
    @DecimalMax(value = "30.0", message = "MUAC must be at most 30 cm")
    private Double muacCm;

    private String notes;

    // Response fields (not required for request)
    private String beneficiaryName;
    private String workerName;
}