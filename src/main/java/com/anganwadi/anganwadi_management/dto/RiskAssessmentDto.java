package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
public class RiskAssessmentDto {
    private Long beneficiaryId;
    private String beneficiaryName;
    private Integer riskScore;
    private String riskLevel;
    private String riskColor;
    private List<String> reasons;
    private List<String> recommendations;
    private Map<String, Object> riskFactors;  // detailed breakdown of each factor's contribution
}
