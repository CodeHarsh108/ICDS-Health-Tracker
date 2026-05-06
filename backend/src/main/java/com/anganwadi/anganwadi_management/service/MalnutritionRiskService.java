package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.RiskAlertDto;
import com.anganwadi.anganwadi_management.dto.RiskAssessmentDto;
import com.anganwadi.anganwadi_management.entity.*;
import com.anganwadi.anganwadi_management.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MalnutritionRiskService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final GrowthRecordRepository growthRecordRepository;
    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final AttendanceRepository attendanceRepository;
    private final ZScoreCalculator zScoreCalculator;

    // Risk factor weights (out of 100)
    private static final int FLATLINING_WEIGHT = 30;
    private static final int WEIGHT_DROP_WEIGHT = 35;
    private static final int UNDERWEIGHT_WEIGHT = 20;
    private static final int VACCINE_MISS_WEIGHT = 10;
    private static final int ATTENDANCE_ISSUE_WEIGHT = 5;

    public MalnutritionRiskService(BeneficiaryRepository beneficiaryRepository,
                                   GrowthRecordRepository growthRecordRepository,
                                   VaccinationRecordRepository vaccinationRecordRepository,
                                   AttendanceRepository attendanceRepository,
                                   ZScoreCalculator zScoreCalculator) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.growthRecordRepository = growthRecordRepository;
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.attendanceRepository = attendanceRepository;
        this.zScoreCalculator = zScoreCalculator;
    }

    /**
     * Calculate risk score and return full assessment for a single beneficiary
     */
    public RiskAssessmentDto assessBeneficiaryRisk(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(beneficiaryId))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));

        // Only assess children (not pregnant mothers)
        if (Boolean.TRUE.equals(beneficiary.getIsPregnant())) {
            return new RiskAssessmentDto(
                    beneficiaryId, beneficiary.getFullName(), 0, "NONE", "green",
                    List.of("Pregnant mothers are not assessed for child malnutrition risk"),
                    List.of("Continue regular antenatal care"),
                    Map.of("note", "Pregnant mother excluded from child malnutrition risk assessment")
            );
        }

        Map<String, Object> riskFactors = new LinkedHashMap<>();
        List<String> reasons = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        int totalRisk = 0;

        // Get growth records
        List<GrowthRecord> growthRecords = growthRecordRepository.findByBeneficiaryIdOrderByRecordDateAsc(beneficiaryId);

        // Factor 1: Weight flatlining (no gain in 2+ months)
        int flatliningScore = calculateFlatliningRisk(growthRecords, beneficiary, riskFactors, reasons, recommendations);
        totalRisk += flatliningScore;

        // Factor 2: Weight drop (>0.5kg in 1 month)
        int weightDropScore = calculateWeightDropRisk(growthRecords, beneficiary, riskFactors, reasons, recommendations);
        totalRisk += weightDropScore;

        // Factor 3: Already underweight (Z-score < -2 but not severe)
        int underweightScore = calculateUnderweightRisk(growthRecords, beneficiary, riskFactors, reasons, recommendations);
        totalRisk += underweightScore;

        // Factor 4: Missed vaccination in last 3 months
        int vaccineMissScore = calculateVaccineMissRisk(beneficiaryId, riskFactors, reasons, recommendations);
        totalRisk += vaccineMissScore;

        // Factor 5: Irregular attendance (<60% in last month)
        int attendanceIssueScore = calculateAttendanceRisk(beneficiaryId, beneficiary.getCenter().getId(), riskFactors, reasons, recommendations);
        totalRisk += attendanceIssueScore;

        // Cap at 100
        totalRisk = Math.min(100, totalRisk);

        // Determine risk level and color
        String riskLevel;
        String riskColor;
        if (totalRisk >= 70) {
            riskLevel = "HIGH";
            riskColor = "red";
        } else if (totalRisk >= 40) {
            riskLevel = "MEDIUM";
            riskColor = "orange";
        } else if (totalRisk >= 20) {
            riskLevel = "LOW";
            riskColor = "yellow";
        } else {
            riskLevel = "NONE";
            riskColor = "green";
        }

        return new RiskAssessmentDto(
                beneficiaryId, beneficiary.getFullName(), totalRisk, riskLevel, riskColor,
                reasons, recommendations, riskFactors
        );
    }

    /**
     * Get all at-risk beneficiaries for a center (risk score >= 20)
     */
    public List<RiskAlertDto> getAtRiskBeneficiaries(Long centerId) {
        List<Beneficiary> beneficiaries = beneficiaryRepository.findByCenterIdAndActiveTrue(centerId);
        List<RiskAlertDto> atRiskList = new ArrayList<>();

        for (Beneficiary beneficiary : beneficiaries) {
            // Skip pregnant mothers
            if (Boolean.TRUE.equals(beneficiary.getIsPregnant())) continue;

            RiskAssessmentDto assessment = assessBeneficiaryRisk(beneficiary.getId());

            // Only include if risk score >= 20
            if (assessment.getRiskScore() >= 20) {
                // Get latest growth record for display
                GrowthRecord latestGrowth = growthRecordRepository
                        .findTopByBeneficiaryIdOrderByRecordDateDesc(beneficiary.getId())
                        .orElse(null);

                atRiskList.add(new RiskAlertDto(
                        beneficiary.getId(),
                        beneficiary.getFullName(),
                        beneficiary.getAwcBeneficiaryId(),
                        assessment.getRiskScore(),
                        assessment.getRiskLevel(),
                        assessment.getRiskColor(),
                        assessment.getReasons(),
                        assessment.getRecommendations(),
                        latestGrowth != null ? String.format("%.2f", zScoreCalculator.calculateZScore(
                                getAgeInMonths(beneficiary.getDateOfBirth(), LocalDate.now()),
                                latestGrowth.getWeightKg(),
                                beneficiary.getGender().name()
                        )) : "N/A",
                        latestGrowth != null ? String.valueOf(latestGrowth.getWeightKg()) : "N/A",
                        latestGrowth != null ? latestGrowth.getRecordDate().toString() : "N/A"
                ));
            }
        }

        // Sort by risk score descending
        atRiskList.sort((a, b) -> b.getRiskScore().compareTo(a.getRiskScore()));
        return atRiskList;
    }

    /**
     * Get dashboard summary: counts of at-risk children by level
     */
    public Map<String, Object> getDashboardRiskSummary(Long centerId) {
        List<RiskAlertDto> atRisk = getAtRiskBeneficiaries(centerId);
        long highCount = atRisk.stream().filter(r -> r.getRiskLevel().equals("HIGH")).count();
        long mediumCount = atRisk.stream().filter(r -> r.getRiskLevel().equals("MEDIUM")).count();
        long lowCount = atRisk.stream().filter(r -> r.getRiskLevel().equals("LOW")).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalAtRisk", atRisk.size());
        summary.put("highRisk", highCount);
        summary.put("mediumRisk", mediumCount);
        summary.put("lowRisk", lowCount);
        summary.put("topAlerts", atRisk.stream().limit(5).collect(Collectors.toList()));
        return summary;
    }

    // Helper: Calculate flatlining risk
    private int calculateFlatliningRisk(List<GrowthRecord> records, Beneficiary beneficiary,
                                        Map<String, Object> factors, List<String> reasons, List<String> recommendations) {
        if (records.size() < 3) {
            factors.put("flatlining", "Insufficient data (need at least 3 records)");
            return 0;
        }

        // Get last 3 records
        int size = records.size();
        GrowthRecord r1 = records.get(size - 3);
        GrowthRecord r2 = records.get(size - 2);
        GrowthRecord r3 = records.get(size - 1);

        // Check if weight has stagnated (change < 0.1kg over 2 months)
        double change12 = r2.getWeightKg() - r1.getWeightKg();
        double change23 = r3.getWeightKg() - r2.getWeightKg();

        if (change12 < 0.1 && change23 < 0.1) {
            factors.put("flatlining", 30);
            reasons.add("Weight has remained almost unchanged for 2+ months");
            recommendations.add("Increase supplementary nutrition frequency");
            return FLATLINING_WEIGHT;
        }

        factors.put("flatlining", 0);
        return 0;
    }

    // Helper: Calculate weight drop risk
    private int calculateWeightDropRisk(List<GrowthRecord> records, Beneficiary beneficiary,
                                        Map<String, Object> factors, List<String> reasons, List<String> recommendations) {
        if (records.size() < 2) {
            factors.put("weightDrop", "Insufficient data");
            return 0;
        }

        int size = records.size();
        GrowthRecord previous = records.get(size - 2);
        GrowthRecord latest = records.get(size - 1);

        double drop = previous.getWeightKg() - latest.getWeightKg();

        if (drop > 0.5) {
            int score = WEIGHT_DROP_WEIGHT;
            if (drop > 1.0) score = WEIGHT_DROP_WEIGHT + 10; // up to 45
            score = Math.min(score, 45);
            factors.put("weightDrop", score);
            reasons.add(String.format("Weight dropped by %.2f kg in the last month", drop));
            recommendations.add("Conduct immediate health checkup and increase nutrition support");
            return score;
        }

        factors.put("weightDrop", 0);
        return 0;
    }

    // Helper: Calculate underweight risk
    private int calculateUnderweightRisk(List<GrowthRecord> records, Beneficiary beneficiary,
                                         Map<String, Object> factors, List<String> reasons, List<String> recommendations) {
        if (records.isEmpty()) {
            factors.put("underweight", 0);
            return 0;
        }

        GrowthRecord latest = records.get(records.size() - 1);
        int ageMonths = getAgeInMonths(beneficiary.getDateOfBirth(), latest.getRecordDate());
        double zScore = zScoreCalculator.calculateZScore(ageMonths, latest.getWeightKg(), beneficiary.getGender().name());

        if (zScore < -3) {
            factors.put("underweight", 20);
            reasons.add("Already severely underweight (Z-score < -3)");
            recommendations.add("URGENT: Immediate medical intervention required");
            return UNDERWEIGHT_WEIGHT;
        } else if (zScore < -2) {
            factors.put("underweight", 15);
            reasons.add("Currently underweight (Z-score < -2)");
            recommendations.add("Increase nutrition monitoring and weekly checkups");
            return UNDERWEIGHT_WEIGHT - 5;
        } else if (zScore < -1.5) {
            factors.put("underweight", 10);
            reasons.add("Borderline underweight (Z-score near -2)");
            recommendations.add("Monitor monthly and encourage better nutrition");
            return UNDERWEIGHT_WEIGHT - 10;
        }

        factors.put("underweight", 0);
        return 0;
    }

    // Helper: Calculate vaccine miss risk
    private int calculateVaccineMissRisk(Long beneficiaryId,
                                         Map<String, Object> factors, List<String> reasons, List<String> recommendations) {
        LocalDate threeMonthsAgo = LocalDate.now().minusMonths(3);
        List<VaccinationRecord> recentVaccines = vaccinationRecordRepository.findAll().stream()
                .filter(v -> v.getBeneficiary().getId().equals(beneficiaryId))
                .filter(v -> v.getGivenDate().isAfter(threeMonthsAgo))
                .collect(Collectors.toList());

        if (recentVaccines.isEmpty()) {
            factors.put("vaccineMiss", 10);
            reasons.add("No vaccinations recorded in the last 3 months");
            recommendations.add("Schedule overdue vaccinations immediately");
            return VACCINE_MISS_WEIGHT;
        }

        factors.put("vaccineMiss", 0);
        return 0;
    }

    // Helper: Calculate attendance risk
    private int calculateAttendanceRisk(Long beneficiaryId, Long centerId,
                                        Map<String, Object> factors, List<String> reasons, List<String> recommendations) {
        LocalDate oneMonthAgo = LocalDate.now().minusMonths(1);
        List<Attendance> attendances = attendanceRepository.findByBeneficiaryIdAndAttendanceDateAfter(
                beneficiaryId, oneMonthAgo);

        if (attendances.isEmpty()) {
            factors.put("attendanceIssue", 5);
            reasons.add("Poor attendance in the last month");
            recommendations.add("Encourage regular attendance at the Anganwadi center");
            return ATTENDANCE_ISSUE_WEIGHT;
        }

        long presentCount = attendances.stream().filter(Attendance::getIsPresent).count();
        double percentage = (presentCount * 100.0) / attendances.size();

        if (percentage < 60) {
            factors.put("attendanceIssue", 5);
            reasons.add(String.format("Attendance rate is %.0f%% in the last month (below 60%%)", percentage));
            recommendations.add("Follow up with parents about regular attendance");
            return ATTENDANCE_ISSUE_WEIGHT;
        }

        factors.put("attendanceIssue", 0);
        return 0;
    }

    private int getAgeInMonths(LocalDate dob, LocalDate referenceDate) {
        long days = ChronoUnit.DAYS.between(dob, referenceDate);
        return (int) (days / 30.44);
    }
}
