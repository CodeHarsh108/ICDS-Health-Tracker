package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class GrowthZScoreDto {
    private Long id;
    private LocalDate recordDate;
    private Double weightKg;
    private Double zScore;
    private String classification;  // "Normal", "Underweight", "Severe underweight", etc.
}