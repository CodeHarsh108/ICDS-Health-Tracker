package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.RiskAlertDto;
import com.anganwadi.anganwadi_management.dto.RiskAssessmentDto;
import com.anganwadi.anganwadi_management.service.MalnutritionRiskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/risk")
public class RiskController {

    private final MalnutritionRiskService riskService;

    public RiskController(MalnutritionRiskService riskService) {
        this.riskService = riskService;
    }

    @GetMapping("/beneficiary/{beneficiaryId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<RiskAssessmentDto> assessBeneficiary(@PathVariable Long beneficiaryId) {
        return ResponseEntity.ok(riskService.assessBeneficiaryRisk(beneficiaryId));
    }

    @GetMapping("/at-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<RiskAlertDto>> getAtRiskBeneficiaries(@RequestParam Long centerId) {
        return ResponseEntity.ok(riskService.getAtRiskBeneficiaries(centerId));
    }

    @GetMapping("/dashboard-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<Map<String, Object>> getDashboardSummary(@RequestParam Long centerId) {
        return ResponseEntity.ok(riskService.getDashboardRiskSummary(centerId));
    }
}
