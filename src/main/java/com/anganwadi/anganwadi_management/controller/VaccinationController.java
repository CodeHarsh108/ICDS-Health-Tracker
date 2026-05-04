package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.ApiResponse;
import com.anganwadi.anganwadi_management.dto.VaccinationHistoryDto;
import com.anganwadi.anganwadi_management.dto.VaccinationRequestDto;
import com.anganwadi.anganwadi_management.dto.VaccinationStatusDto;
import com.anganwadi.anganwadi_management.service.VaccinationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/beneficiaries")
public class VaccinationController {

    private final VaccinationService vaccinationService;

    public VaccinationController(VaccinationService vaccinationService) {
        this.vaccinationService = vaccinationService;
    }

    @GetMapping("/{beneficiaryId}/vaccination-schedule")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<VaccinationStatusDto>> getSchedule(@PathVariable Long beneficiaryId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationSchedule(beneficiaryId));
    }

    @PostMapping("/{beneficiaryId}/vaccinations")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> markVaccinationGiven(@PathVariable Long beneficiaryId,
                                                            @Valid @RequestBody VaccinationRequestDto request) {
        vaccinationService.markVaccinationGiven(beneficiaryId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Vaccination recorded successfully", null));
    }

    @GetMapping("/{beneficiaryId}/vaccination-history")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<VaccinationHistoryDto>> getHistory(@PathVariable Long beneficiaryId) {
        return ResponseEntity.ok(vaccinationService.getVaccinationHistory(beneficiaryId));
    }
}
