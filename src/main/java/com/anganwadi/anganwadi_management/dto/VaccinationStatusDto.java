package com.anganwadi.anganwadi_management.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class VaccinationStatusDto {
    private Long vaccineId;
    private String vaccineName;
    private Integer dueAgeDays;
    private LocalDate dueDate;
    private String status;
    private LocalDate givenDate;
    private String batchNumber;
}