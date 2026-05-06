package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.ApiResponse;
import com.anganwadi.anganwadi_management.dto.MonthlySummaryDto;
import com.anganwadi.anganwadi_management.dto.NutritionDistributionRequestDto;
import com.anganwadi.anganwadi_management.dto.NutritionDistributionResponseDto;
import com.anganwadi.anganwadi_management.service.NutritionDistributionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/beneficiaries")
public class NutritionDistributionController {

    private final NutritionDistributionService nutritionService;

    public NutritionDistributionController(NutritionDistributionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @PostMapping("/{beneficiaryId}/nutrition")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> addNutritionRecord(@PathVariable Long beneficiaryId,
                                                          @Valid @RequestBody NutritionDistributionRequestDto dto) {
        NutritionDistributionResponseDto created = nutritionService.addNutritionRecord(beneficiaryId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Nutrition record added", created));
    }

    @GetMapping("/{beneficiaryId}/nutrition")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<NutritionDistributionResponseDto>> getNutritionHistory(@PathVariable Long beneficiaryId) {
        return ResponseEntity.ok(nutritionService.getNutritionHistory(beneficiaryId));
    }
}
