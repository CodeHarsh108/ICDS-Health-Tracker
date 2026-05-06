package com.anganwadi.anganwadi_management.service;

import com.anganwadi.anganwadi_management.dto.VaccinationHistoryDto;
import com.anganwadi.anganwadi_management.dto.VaccinationRequestDto;
import com.anganwadi.anganwadi_management.dto.VaccinationStatusDto;
import com.anganwadi.anganwadi_management.entity.*;
import com.anganwadi.anganwadi_management.repository.*;
import com.anganwadi.anganwadi_management.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccinationService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final VaccinationScheduleRepository scheduleRepository;
    private final VaccinationRecordRepository recordRepository;
    private final SecurityUtils securityUtils;

    public VaccinationService(BeneficiaryRepository beneficiaryRepository,
                              VaccinationScheduleRepository scheduleRepository,
                              VaccinationRecordRepository recordRepository,
                              SecurityUtils securityUtils) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.scheduleRepository = scheduleRepository;
        this.recordRepository = recordRepository;
        this.securityUtils = securityUtils;
    }

    public List<VaccinationStatusDto> getVaccinationSchedule(Long beneficiaryId) {
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(beneficiaryId);
        LocalDate dob = beneficiary.getDateOfBirth();
        LocalDate today = LocalDate.now();

        List<VaccinationSchedule> allVaccines = scheduleRepository.findAllByOrderByDueAgeDaysAsc();
        List<VaccinationStatusDto> result = new ArrayList<>();

        for (VaccinationSchedule vaccine : allVaccines) {
            LocalDate dueDate = dob.plusDays(vaccine.getDueAgeDays());
            // Check if already given
            VaccinationRecord givenRecord = recordRepository.findByBeneficiaryIdAndVaccineId(beneficiaryId, vaccine.getId()).orElse(null);
            String status;
            LocalDate givenDate = null;
            String batchNumber = null;

            if (givenRecord != null) {
                status = "COMPLETED";
                givenDate = givenRecord.getGivenDate();
                batchNumber = givenRecord.getBatchNumber();
            } else {
                if (dueDate.isBefore(today)) {
                    status = "OVERDUE";
                } else {
                    status = "UPCOMING";
                }
            }
            result.add(new VaccinationStatusDto(
                    vaccine.getId(),
                    vaccine.getVaccineName(),
                    vaccine.getDueAgeDays(),
                    dueDate,
                    status,
                    givenDate,
                    batchNumber
            ));
        }
        return result;
    }

    @Transactional
    public void markVaccinationGiven(Long beneficiaryId, VaccinationRequestDto request) {
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(beneficiaryId);
        Worker currentWorker = securityUtils.getCurrentWorker();

        VaccinationSchedule vaccine = scheduleRepository.findById(Math.toIntExact(request.getVaccineId()))
                .orElseThrow(() -> new RuntimeException("Vaccine not found"));

        // Check if already given
        if (recordRepository.existsByBeneficiaryIdAndVaccineId(beneficiaryId, vaccine.getId())) {
            throw new RuntimeException("Vaccination already marked given for this child");
        }

        // Validate given date not future
        if (request.getGivenDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Given date cannot be in the future");
        }

        VaccinationRecord record = VaccinationRecord.builder()
                .beneficiary(beneficiary)
                .vaccine(vaccine)
                .givenDate(request.getGivenDate())
                .batchNumber(request.getBatchNumber())
                .givenBy(currentWorker)
                .build();

        recordRepository.save(record);
    }

    public List<VaccinationHistoryDto> getVaccinationHistory(Long beneficiaryId) {
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(beneficiaryId);
        List<VaccinationRecord> records = recordRepository.findByBeneficiaryIdOrderByGivenDateAsc(beneficiaryId);
        return records.stream()
                .map(r -> new VaccinationHistoryDto(
                        r.getId(),
                        r.getVaccine().getVaccineName(),
                        r.getGivenDate(),
                        r.getBatchNumber(),
                        r.getGivenBy().getFullName()
                ))
                .collect(Collectors.toList());
    }

    private Beneficiary getBeneficiaryWithAccessCheck(Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(beneficiaryId))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
        Worker currentWorker = securityUtils.getCurrentWorker();
        // Workers can only access beneficiaries in their own center
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Access denied: You can only access beneficiaries in your center");
            }
        }
        // Supervisors and Admins can access all (for simplicity, we skip block filter; can be extended)
        return beneficiary;
    }
}