package com.anganwadi.anganwadi_management.service;

import com.anganwadi.anganwadi_management.dto.*;
import com.anganwadi.anganwadi_management.entity.*;
import com.anganwadi.anganwadi_management.repository.*;
import com.anganwadi.anganwadi_management.util.SecurityUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final GrowthRecordRepository growthRecordRepository;
    private final VaccinationScheduleRepository scheduleRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final NutritionDistributionRepository nutritionRepository;
    private final SecurityUtils securityUtils;

    public ReportService(BeneficiaryRepository beneficiaryRepository,
                         GrowthRecordRepository growthRecordRepository,
                         VaccinationScheduleRepository scheduleRepository,
                         VaccinationRecordRepository vaccinationRecordRepository,
                         NutritionDistributionRepository nutritionRepository,
                         SecurityUtils securityUtils) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.growthRecordRepository = growthRecordRepository;
        this.scheduleRepository = scheduleRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.nutritionRepository = nutritionRepository;
        this.securityUtils = securityUtils;
    }

    // Helper: get allowed center IDs based on current user role
    private List<Long> getAllowedCenterIds(Long requestedCenterId) {
        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.ADMIN) {
            return List.of(requestedCenterId);
        } else if (currentWorker.getRole() == Worker.Role.SUPERVISOR) {
            // Supervisor can see any center? In our design, supervisor has no specific center.
            // For simplicity, allow any center ID (we could later restrict by block).
            return List.of(requestedCenterId);
        } else if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null)
                throw new RuntimeException("Worker not assigned to any center");
            if (!currentWorker.getCenter().getId().equals(requestedCenterId))
                throw new RuntimeException("Worker can only access reports for own center");
            return List.of(requestedCenterId);
        }
        return List.of();
    }

    // Report 1: Monthly growth summary (weight gain/loss/no change)
    public List<GrowthSummaryDto> getMonthlyGrowthSummary(Long centerId, int year, int month) {
        getAllowedCenterIds(centerId); // permission check
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Beneficiary> beneficiaries = beneficiaryRepository.findByCenterIdAndActiveTrue(centerId);
        List<GrowthSummaryDto> result = new ArrayList<>();

        for (Beneficiary b : beneficiaries) {
            // Get growth records before and within month
            List<GrowthRecord> records = growthRecordRepository.findByBeneficiaryIdOrderByRecordDateAsc(b.getId());
            if (records.size() < 2) continue; // need at least two records to compare

            // Find record just before or at start of month, and latest within month
            GrowthRecord prevRecord = null;
            GrowthRecord currRecord = null;
            for (GrowthRecord rec : records) {
                if (rec.getRecordDate().isBefore(start) || rec.getRecordDate().isEqual(start)) {
                    prevRecord = rec;
                }
                if (rec.getRecordDate().isAfter(start) && rec.getRecordDate().isBefore(end.plusDays(1))) {
                    currRecord = rec;
                }
            }
            if (prevRecord == null || currRecord == null) continue;

            double change = currRecord.getWeightKg() - prevRecord.getWeightKg();
            String trend = change > 0 ? "gain" : (change < 0 ? "loss" : "no_change");
            result.add(new GrowthSummaryDto(
                    b.getFullName(),
                    b.getAwcBeneficiaryId(),
                    prevRecord.getWeightKg(),
                    currRecord.getWeightKg(),
                    change,
                    trend
            ));
        }
        return result;
    }

    // Report 2: Vaccination coverage per vaccine for a center (as of today)
    public List<VaccinationCoverageDto> getVaccinationCoverage(Long centerId) {
        getAllowedCenterIds(centerId);
        List<VaccinationSchedule> allVaccines = scheduleRepository.findAllByOrderByDueAgeDaysAsc();
        Long totalChildren = beneficiaryRepository.countEnrolledChildren(centerId);
        if (totalChildren == 0) return Collections.emptyList();

        // Get given counts per vaccine for this center
        List<VaccinationRecord> records = vaccinationRecordRepository.findAll().stream()
                .filter(r -> r.getBeneficiary().getCenter().getId().equals(centerId))
                .collect(Collectors.toList());
        Map<Long, Long> givenCount = records.stream()
                .collect(Collectors.groupingBy(r -> r.getVaccine().getId(), Collectors.counting()));

        List<VaccinationCoverageDto> result = new ArrayList<>();
        for (VaccinationSchedule vaccine : allVaccines) {
            Long given = givenCount.getOrDefault(vaccine.getId(), 0L);
            double percentage = (given * 100.0) / totalChildren;
            result.add(new VaccinationCoverageDto(
                    vaccine.getVaccineName(),
                    totalChildren,
                    given,
                    percentage
            ));
        }
        return result;
    }

    // Report 3: Nutrition summary (like monthly summary already exists)
    // We'll reuse MonthlySummaryDto from nutrition service
    // But we need a method to get it by center, year, month – already exists in NutritionDistributionService
    // We'll just call that from controller.
}