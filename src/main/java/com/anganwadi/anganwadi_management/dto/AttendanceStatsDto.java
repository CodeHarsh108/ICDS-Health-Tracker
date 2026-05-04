package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AttendanceStatsDto {
    private String sessionType;
    private Long totalEnrolled;
    private Long totalPresent;
    private Double attendancePercentage;
}
