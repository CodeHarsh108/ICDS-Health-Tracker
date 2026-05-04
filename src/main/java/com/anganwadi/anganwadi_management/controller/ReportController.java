package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.MonthlySummaryDto;
import com.anganwadi.anganwadi_management.service.NutritionDistributionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final NutritionDistributionService nutritionService;

    public ReportController(NutritionDistributionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @GetMapping("/nutrition-summary/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<MonthlySummaryDto>> getMonthlyNutritionSummary(
            @RequestParam Long centerId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(nutritionService.getMonthlySummary(centerId, year, month));
    }
}
