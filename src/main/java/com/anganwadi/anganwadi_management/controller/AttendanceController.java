package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.*;
import com.anganwadi.anganwadi_management.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/single")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> markSingleAttendance(@Valid @RequestBody AttendanceRequestDto dto) {
        AttendanceResponseDto response = attendanceService.markSingleAttendance(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Attendance marked", response));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> markBatchAttendance(@Valid @RequestBody BatchAttendanceRequestDto batchDto) {
        List<AttendanceResponseDto> responses = attendanceService.markBatchAttendance(batchDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Batch attendance marked", responses));
    }

    @GetMapping("/center/{centerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<AttendanceResponseDto>> getAttendanceByCenterAndDate(
            @PathVariable Long centerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCenterAndDate(centerId, date));
    }

    @GetMapping("/stats/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<AttendanceStatsDto>> getMonthlyStats(
            @RequestParam Long centerId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendanceStats(centerId, year, month));
    }
}
