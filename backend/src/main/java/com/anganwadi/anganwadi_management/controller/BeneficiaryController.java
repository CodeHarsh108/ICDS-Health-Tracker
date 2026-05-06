package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.ApiResponse;
import com.anganwadi.anganwadi_management.dto.BeneficiaryDto;
import com.anganwadi.anganwadi_management.service.BeneficiaryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/beneficiaries")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;

    public BeneficiaryController(BeneficiaryService beneficiaryService) {
        this.beneficiaryService = beneficiaryService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> createBeneficiary(@Valid @RequestBody BeneficiaryDto dto) {
        BeneficiaryDto created = beneficiaryService.createBeneficiary(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Beneficiary created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> updateBeneficiary(@PathVariable Long id, @Valid @RequestBody BeneficiaryDto dto) {
        BeneficiaryDto updated = beneficiaryService.updateBeneficiary(id, dto);
        return ResponseEntity.ok(new ApiResponse("Beneficiary updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<ApiResponse> deleteBeneficiary(@PathVariable Long id) {
        beneficiaryService.deleteBeneficiary(id);
        return ResponseEntity.ok(new ApiResponse("Beneficiary deleted (soft)", null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<BeneficiaryDto>> getBeneficiaries() {
        return ResponseEntity.ok(beneficiaryService.getBeneficiariesForCurrentWorker());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<BeneficiaryDto> getBeneficiaryById(@PathVariable Long id) {
        return ResponseEntity.ok(beneficiaryService.getBeneficiaryById(id));
    }
}
