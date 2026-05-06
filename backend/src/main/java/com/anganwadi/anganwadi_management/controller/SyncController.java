package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.*;
import com.anganwadi.anganwadi_management.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/sync")
public class SyncController {

    private final GrowthRecordService growthService;
    private final NutritionDistributionService nutritionService;
    private final AttendanceService attendanceService;
    private final VaccinationService vaccinationService;

    public SyncController(GrowthRecordService growthService,
                          NutritionDistributionService nutritionService,
                          AttendanceService attendanceService,
                          VaccinationService vaccinationService) {
        this.growthService = growthService;
        this.nutritionService = nutritionService;
        this.attendanceService = attendanceService;
        this.vaccinationService = vaccinationService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<SyncResponseDto> uploadBatch(@RequestBody SyncUploadRequestDto batch) {
        List<String> errors = new ArrayList<>();
        int uploaded = 0;

        // Upload growth records
        if (batch.getGrowthRecords() != null) {
            for (GrowthRecordDto dto : batch.getGrowthRecords()) {
                try {
                    growthService.addGrowthRecord(dto);
                    uploaded++;
                } catch (Exception e) {
                    errors.add("Growth: " + e.getMessage());
                }
            }
        }

        // Upload nutrition records
        if (batch.getNutritionRecords() != null) {
            for (NutritionDistributionRequestDto dto : batch.getNutritionRecords()) {
                try {
                    nutritionService.addNutritionRecord(dto.getBeneficiaryId(), dto);
                    uploaded++;
                } catch (Exception e) {
                    errors.add("Nutrition: " + e.getMessage());
                }
            }
        }

        // Upload attendance records
        if (batch.getAttendanceRecords() != null) {
            for (AttendanceRequestDto dto : batch.getAttendanceRecords()) {
                try {
                    attendanceService.markSingleAttendance(dto);
                    uploaded++;
                } catch (Exception e) {
                    errors.add("Attendance: " + e.getMessage());
                }
            }
        }

        // Upload vaccination records
        if (batch.getVaccinationRecords() != null) {
            for (VaccinationRequestDto dto : batch.getVaccinationRecords()) {
                try {
                    vaccinationService.markVaccinationGiven(dto.getBeneficiaryId(), dto);
                    uploaded++;
                } catch (Exception e) {
                    errors.add("Vaccination: " + e.getMessage());
                }
            }
        }

        return ResponseEntity.ok(new SyncResponseDto(uploaded, errors.size(), errors));
    }

    @GetMapping("/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<SyncUploadRequestDto> downloadUpdates(@RequestParam(required = false) LocalDateTime since) {
        // For simplicity, we return all records modified after 'since'
        // In production, you'd filter by user's center and lastModified
        SyncUploadRequestDto updates = new SyncUploadRequestDto();
        // Populate with records (simplified – implement based on your service)
        return ResponseEntity.ok(updates);
    }
}
