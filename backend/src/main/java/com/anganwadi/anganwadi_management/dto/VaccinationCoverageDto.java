package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VaccinationCoverageDto {
    private String vaccineName;
    private Long totalDue;
    private Long totalGiven;
    private Double coveragePercentage;
}