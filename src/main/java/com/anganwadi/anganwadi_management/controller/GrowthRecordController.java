package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.ApiResponse;
import com.anganwadi.anganwadi_management.dto.GrowthRecordDto;
import com.anganwadi.anganwadi_management.dto.GrowthZScoreDto;
import com.anganwadi.anganwadi_management.service.GrowthRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/beneficiaries")
public class GrowthRecordController {

    private final GrowthRecordService growthRecordService;

    public GrowthRecordController(GrowthRecordService growthRecordService) {
        this.growthRecordService = growthRecordService;
    }

    @PostMapping("/{beneficiaryId}/growth")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> addGrowthRecord(
            @PathVariable Long beneficiaryId,
            @Valid @RequestBody GrowthRecordDto dto) {
        // Ensure DTO has the correct beneficiaryId (or override)
        dto.setBeneficiaryId(beneficiaryId);
        GrowthRecordDto created = growthRecordService.addGrowthRecord(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Growth record added", created));
    }

    @GetMapping("/{beneficiaryId}/growth")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<GrowthRecordDto>> getGrowthRecords(@PathVariable Long beneficiaryId) {
        List<GrowthRecordDto> records = growthRecordService.getGrowthRecordsForBeneficiary(beneficiaryId);
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{beneficiaryId}/growth/latest")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<?> getLatestGrowthRecord(@PathVariable Long beneficiaryId) {
        GrowthRecordDto latest = growthRecordService.getLatestGrowthRecord(beneficiaryId);
        if (latest == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse("No growth records found for beneficiary " + beneficiaryId, null));
        }
        return ResponseEntity.ok(latest);
    }


    @GetMapping("/{beneficiaryId}/growth/zscore")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<GrowthZScoreDto>> getGrowthWithZScore(@PathVariable Long beneficiaryId) {
        return ResponseEntity.ok(growthRecordService.getGrowthRecordsWithZScore(beneficiaryId));
    }
}
