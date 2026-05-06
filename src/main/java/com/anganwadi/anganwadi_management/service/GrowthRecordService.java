package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.GrowthRecordDto;
import com.anganwadi.anganwadi_management.entity.Beneficiary;
import com.anganwadi.anganwadi_management.entity.GrowthRecord;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.BeneficiaryRepository;
import com.anganwadi.anganwadi_management.repository.GrowthRecordRepository;
import com.anganwadi.anganwadi_management.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.anganwadi.anganwadi_management.dto.GrowthZScoreDto;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class GrowthRecordService {

    private static final Logger logger = LoggerFactory.getLogger(GrowthRecordService.class);

    private final GrowthRecordRepository growthRecordRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final SecurityUtils securityUtils;
    private final ZScoreCalculator zScoreCalculator;

    public GrowthRecordService(GrowthRecordRepository growthRecordRepository,
                               BeneficiaryRepository beneficiaryRepository,
                               SecurityUtils securityUtils, ZScoreCalculator zScoreCalculator) {
        this.growthRecordRepository = growthRecordRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.securityUtils = securityUtils;
        this.zScoreCalculator = zScoreCalculator;
    }

    @Transactional
    public GrowthRecordDto addGrowthRecord(GrowthRecordDto dto) {
        // 1. Fetch beneficiary
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(dto.getBeneficiaryId()))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));

        // 2. Permission: worker can only add for beneficiaries in their own center
        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Access denied: You can only add growth records for beneficiaries in your center");
            }
        }

        // 3. Validate record date not future
        if (dto.getRecordDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Record date cannot be in the future");
        }

        // 4. Check duplicate entry for same day
        if (growthRecordRepository.existsByBeneficiaryIdAndRecordDate(dto.getBeneficiaryId(), dto.getRecordDate())) {
            throw new RuntimeException("A growth record already exists for this beneficiary on " + dto.getRecordDate());
        }

        // 5. (Optional) Weight drop alert
        growthRecordRepository.findTopByBeneficiaryIdOrderByRecordDateDesc(dto.getBeneficiaryId())
                .ifPresent(lastRecord -> {
                    if (lastRecord.getWeightKg() != null && dto.getWeightKg() != null) {
                        double weightDiff = lastRecord.getWeightKg() - dto.getWeightKg();
                        if (weightDiff > 2.0) {
                            logger.warn("ALERT: Beneficiary {} (ID: {}) weight dropped by {} kg from {} to {} on {}",
                                    beneficiary.getFullName(), beneficiary.getId(),
                                    weightDiff, lastRecord.getWeightKg(), dto.getWeightKg(), dto.getRecordDate());
                        }
                    }
                });

        // 6. Create and save record
        GrowthRecord record = GrowthRecord.builder()
                .beneficiary(beneficiary)
                .recordDate(dto.getRecordDate())
                .weightKg(dto.getWeightKg())
                .heightCm(dto.getHeightCm())
                .muacCm(dto.getMuacCm())
                .recordedBy(currentWorker)
                .notes(dto.getNotes())
                .build();

        GrowthRecord saved = growthRecordRepository.save(record);
        return convertToDto(saved);
    }

    public List<GrowthRecordDto> getGrowthRecordsForBeneficiary(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(beneficiaryId))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));

        // Permission check: worker can only view beneficiaries in their center
        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Access denied: You can only view growth records for beneficiaries in your center");
            }
        }

        List<GrowthRecord> records = growthRecordRepository.findByBeneficiaryIdOrderByRecordDateAsc(beneficiaryId);
        return records.stream().map(this::convertToDto).collect(Collectors.toList());
    }


    public GrowthRecordDto getLatestGrowthRecord(Long beneficiaryId) {
        Optional<GrowthRecord> record = growthRecordRepository.findTopByBeneficiaryIdOrderByRecordDateDesc(beneficiaryId);
        if (record.isEmpty()) {
            return null;   // or throw a custom exception, but we'll handle in controller
        }
        return convertToDto(record.get());
    }


    private GrowthRecordDto convertToDto(GrowthRecord record) {
        GrowthRecordDto dto = new GrowthRecordDto();
        dto.setId(record.getId());
        dto.setBeneficiaryId(record.getBeneficiary().getId());
        dto.setBeneficiaryName(record.getBeneficiary().getFullName());
        dto.setRecordDate(record.getRecordDate());
        dto.setWeightKg(record.getWeightKg());
        dto.setHeightCm(record.getHeightCm());
        dto.setMuacCm(record.getMuacCm());
        dto.setNotes(record.getNotes());
        dto.setWorkerName(record.getRecordedBy().getFullName());
        return dto;
    }


    public List<GrowthZScoreDto> getGrowthRecordsWithZScore(Long beneficiaryId) {
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(beneficiaryId);
        List<GrowthRecord> records = growthRecordRepository.findByBeneficiaryIdOrderByRecordDateAsc(beneficiaryId);
        List<GrowthZScoreDto> result = new ArrayList<>();
        LocalDate dob = beneficiary.getDateOfBirth();
        String gender = beneficiary.getGender().name();

        for (GrowthRecord record : records) {
            // compute age in months at the record date
            long ageDays = ChronoUnit.DAYS.between(dob, record.getRecordDate());
            int ageMonths = (int) (ageDays / 30.44); // approximate
            if (ageMonths < 0) ageMonths = 0;
            if (ageMonths > 60) ageMonths = 60;

            double zScore = zScoreCalculator.calculateZScore(ageMonths, record.getWeightKg(), gender);
            String classification = zScoreCalculator.classifyZScore(zScore);

            result.add(new GrowthZScoreDto(
                    record.getId(),
                    record.getRecordDate(),
                    record.getWeightKg(),
                    zScore,
                    classification
            ));
        }
        return result;
    }

    private Beneficiary getBeneficiaryWithAccessCheck(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(beneficiaryId))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Access denied: You can only mark attendance for beneficiaries in your center");
            }
        }
        return beneficiary;
    }

}