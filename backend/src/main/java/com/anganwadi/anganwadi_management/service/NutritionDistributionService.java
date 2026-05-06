package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.MonthlySummaryDto;
import com.anganwadi.anganwadi_management.dto.NutritionDistributionRequestDto;
import com.anganwadi.anganwadi_management.dto.NutritionDistributionResponseDto;
import com.anganwadi.anganwadi_management.entity.Beneficiary;
import com.anganwadi.anganwadi_management.entity.NutritionDistribution;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.BeneficiaryRepository;
import com.anganwadi.anganwadi_management.repository.NutritionDistributionRepository;
import com.anganwadi.anganwadi_management.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NutritionDistributionService {

    private final NutritionDistributionRepository nutritionRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final SecurityUtils securityUtils;

    public NutritionDistributionService(NutritionDistributionRepository nutritionRepository,
                                        BeneficiaryRepository beneficiaryRepository,
                                        SecurityUtils securityUtils) {
        this.nutritionRepository = nutritionRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public NutritionDistributionResponseDto addNutritionRecord(Long beneficiaryId, NutritionDistributionRequestDto dto) {
        // Fetch beneficiary with access check
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(beneficiaryId);
        Worker currentWorker = securityUtils.getCurrentWorker();

        // Validate distribution date not future
        if (dto.getDistributionDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Distribution date cannot be in the future");
        }

        NutritionDistribution record = NutritionDistribution.builder()
                .beneficiary(beneficiary)
                .distributionDate(dto.getDistributionDate())
                .itemName(dto.getItemName())
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .distributedBy(currentWorker)
                .build();

        NutritionDistribution saved = nutritionRepository.save(record);
        return convertToResponseDto(saved);
    }

    public List<NutritionDistributionResponseDto> getNutritionHistory(Long beneficiaryId) {
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(beneficiaryId);
        List<NutritionDistribution> records = nutritionRepository.findByBeneficiaryIdOrderByDistributionDateDesc(beneficiaryId);
        return records.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    }

    public List<MonthlySummaryDto> getMonthlySummary(Long centerId, int year, int month) {
        // Only supervisor or admin can access summary (will be enforced in controller)
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Object[]> results = nutritionRepository.getMonthlySummary(centerId, startDate, endDate);
        List<MonthlySummaryDto> summary = new ArrayList<>();
        for (Object[] row : results) {
            String itemName = (String) row[0];
            Double totalQuantity = (Double) row[1];
            String unit = (String) row[2];
            summary.add(new MonthlySummaryDto(itemName, totalQuantity, unit));
        }
        return summary;
    }

    private Beneficiary getBeneficiaryWithAccessCheck(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(beneficiaryId))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
        Worker currentWorker = securityUtils.getCurrentWorker();
        // Worker can only access beneficiaries in their own center
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Access denied: You can only add nutrition records for beneficiaries in your center");
            }
        }
        // Supervisors and admins can access all (for summary we have separate endpoint)
        return beneficiary;
    }

    private NutritionDistributionResponseDto convertToResponseDto(NutritionDistribution record) {
        return new NutritionDistributionResponseDto(
                record.getId(),
                record.getBeneficiary().getId(),
                record.getBeneficiary().getFullName(),
                record.getDistributionDate(),
                record.getItemName(),
                record.getQuantity(),
                record.getUnit(),
                record.getDistributedBy().getFullName()
        );
    }
}
