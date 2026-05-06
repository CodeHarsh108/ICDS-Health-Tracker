package com.anganwadi.anganwadi_management.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class NutritionDistributionRequestDto {

    @NotNull(message = "Distribution date is required")
    private LocalDate distributionDate;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.1", message = "Quantity must be at least 0.1")
    private Double quantity;

    private String unit;   // e.g., "piece", "gram", "ml"

    private Long beneficiaryId;
}
