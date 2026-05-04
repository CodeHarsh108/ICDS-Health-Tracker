package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GrowthSummaryDto {
    private String beneficiaryName;
    private String beneficiaryId;
    private Double previousWeight;
    private Double currentWeight;
    private Double weightChange;
    private String trend;   // "gain", "loss", "no_change"
}
