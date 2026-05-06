package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

@Data
@AllArgsConstructor
public class AttendanceResponseDto {
    private Long id;
    private Long beneficiaryId;
    private String beneficiaryName;
    private LocalDate attendanceDate;
    private Boolean isPresent;
    private String sessionType;
    private String markedByWorkerName;
}
