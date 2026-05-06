package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class RiskAlertDto {
    private Long beneficiaryId;
    private String beneficiaryName;
    private String awcBeneficiaryId;
    private Integer riskScore;        // 0-100
    private String riskLevel;         // "HIGH", "MEDIUM", "LOW", "NONE"
    private String riskColor;         // "red", "orange", "yellow", "green"
    private List<String> reasons;     // e.g., "Weight flatlining for 2 months"
    private List<String> recommendations; // e.g., "Increase nutrition distribution frequency"
    private String currentZScore;     // optional: latest Z-score
    private String latestWeight;
    private String latestRecordDate;
}