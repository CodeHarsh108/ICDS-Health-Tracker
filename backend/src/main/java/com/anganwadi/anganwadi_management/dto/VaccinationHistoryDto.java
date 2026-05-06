package com.anganwadi.anganwadi_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class VaccinationHistoryDto {
    private Long id;
    private String vaccineName;
    private LocalDate givenDate;
    private String batchNumber;
    private String givenByWorkerName;
}