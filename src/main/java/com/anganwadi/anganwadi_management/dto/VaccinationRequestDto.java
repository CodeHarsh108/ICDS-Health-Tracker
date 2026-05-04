package com.anganwadi.anganwadi_management.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class VaccinationRequestDto {
    @NotNull
    private Long vaccineId;

    @NotNull
    private LocalDate givenDate;

    private String batchNumber;
}