package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class NutritionDistributionResponseDto {
    private Long id;
    private Long beneficiaryId;
    private String beneficiaryName;
    private LocalDate distributionDate;
    private String itemName;
    private Double quantity;
    private String unit;
    private String distributedByWorkerName;
}
