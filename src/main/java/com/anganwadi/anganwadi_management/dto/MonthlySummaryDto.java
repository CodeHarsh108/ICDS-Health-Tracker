package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MonthlySummaryDto {
    private String itemName;
    private Double totalQuantity;
    private String unit;
}
