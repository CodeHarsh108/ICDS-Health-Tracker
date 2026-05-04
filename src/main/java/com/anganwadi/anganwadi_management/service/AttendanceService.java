package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.*;
import com.anganwadi.anganwadi_management.entity.*;
import com.anganwadi.anganwadi_management.repository.*;
import com.anganwadi.anganwadi_management.util.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final BeneficiaryRepository beneficiaryRepository;
    private final SecurityUtils securityUtils;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             BeneficiaryRepository beneficiaryRepository,
                             SecurityUtils securityUtils) {
        this.attendanceRepository = attendanceRepository;
        this.beneficiaryRepository = beneficiaryRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public AttendanceResponseDto markSingleAttendance(AttendanceRequestDto dto) {
        Beneficiary beneficiary = getBeneficiaryWithAccessCheck(dto.getBeneficiaryId());
        Worker currentWorker = securityUtils.getCurrentWorker();

        // Validate date not future
        if (dto.getAttendanceDate().isAfter(LocalDate.now())) {
            throw new RuntimeException("Attendance date cannot be in the future");
        }

        Attendance.SessionType sessionType = Attendance.SessionType.valueOf(dto.getSessionType());

        // Check duplicate
        if (attendanceRepository.findByBeneficiaryIdAndAttendanceDateAndSessionType(
                beneficiary.getId(), dto.getAttendanceDate(), sessionType).isPresent()) {
            throw new RuntimeException("Attendance already marked for this beneficiary on " + dto.getAttendanceDate() + " for session " + sessionType);
        }

        Attendance attendance = Attendance.builder()
                .beneficiary(beneficiary)
                .attendanceDate(dto.getAttendanceDate())
                .isPresent(dto.getIsPresent())
                .sessionType(sessionType)
                .markedBy(currentWorker)
                .build();

        Attendance saved = attendanceRepository.save(attendance);
        return convertToResponseDto(saved);
    }

    @Transactional
    public List<AttendanceResponseDto> markBatchAttendance(BatchAttendanceRequestDto batchDto) {
        Worker currentWorker = securityUtils.getCurrentWorker();
        LocalDate date = batchDto.getAttendanceDate();
        if (date.isAfter(LocalDate.now())) {
            throw new RuntimeException("Attendance date cannot be in the future");
        }
        Attendance.SessionType sessionType = Attendance.SessionType.valueOf(batchDto.getSessionType());
        List<AttendanceResponseDto> results = new ArrayList<>();

        for (BatchAttendanceRequestDto.BatchAttendanceItem item : batchDto.getAttendances()) {
            Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(item.getBeneficiaryId()))
                    .orElseThrow(() -> new RuntimeException("Beneficiary not found: " + item.getBeneficiaryId()));
            // Check worker permission (must be own center)
            if (currentWorker.getRole() == Worker.Role.WORKER) {
                if (currentWorker.getCenter() == null ||
                        !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                    throw new RuntimeException("Access denied: Can't mark attendance for beneficiary in other center");
                }
            }
            // Check duplicate
            if (attendanceRepository.findByBeneficiaryIdAndAttendanceDateAndSessionType(
                    beneficiary.getId(), date, sessionType).isPresent()) {
                throw new RuntimeException("Duplicate attendance for beneficiary " + beneficiary.getFullName() + " on " + date);
            }
            Attendance attendance = Attendance.builder()
                    .beneficiary(beneficiary)
                    .attendanceDate(date)
                    .isPresent(item.getIsPresent())
                    .sessionType(sessionType)
                    .markedBy(currentWorker)
                    .build();
            Attendance saved = attendanceRepository.save(attendance);
            results.add(convertToResponseDto(saved));
        }
        return results;
    }

    public List<AttendanceResponseDto> getAttendanceByCenterAndDate(Long centerId, LocalDate date) {
        // Only supervisor/admin can call this (handled in controller)
        List<Attendance> attendances = attendanceRepository.findByCenterIdAndDate(centerId, date);
        return attendances.stream().map(this::convertToResponseDto).collect(Collectors.toList());
    }

    public List<AttendanceStatsDto> getMonthlyAttendanceStats(Long centerId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        // Child session stats
        Long enrolledChildren = beneficiaryRepository.countEnrolledChildren(centerId);
        Long presentChildren = attendanceRepository.countDistinctPresentBeneficiaries(
                centerId, Attendance.SessionType.CHILD_SESSION, startDate, endDate);
        Double childPercentage = enrolledChildren == 0 ? 0.0 : (presentChildren * 100.0 / enrolledChildren);

        // Pregnant mother stats
        Long enrolledMothers = beneficiaryRepository.countEnrolledPregnantMothers(centerId);
        Long presentMothers = attendanceRepository.countDistinctPresentBeneficiaries(
                centerId, Attendance.SessionType.PREGNANT_MOTHER_SESSION, startDate, endDate);
        Double motherPercentage = enrolledMothers == 0 ? 0.0 : (presentMothers * 100.0 / enrolledMothers);

        List<AttendanceStatsDto> stats = new ArrayList<>();
        stats.add(new AttendanceStatsDto("CHILD_SESSION", enrolledChildren, presentChildren, childPercentage));
        stats.add(new AttendanceStatsDto("PREGNANT_MOTHER_SESSION", enrolledMothers, presentMothers, motherPercentage));
        return stats;
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

    private AttendanceResponseDto convertToResponseDto(Attendance attendance) {
        return new AttendanceResponseDto(
                attendance.getId(),
                attendance.getBeneficiary().getId(),
                attendance.getBeneficiary().getFullName(),
                attendance.getAttendanceDate(),
                attendance.getIsPresent(),
                attendance.getSessionType().name(),
                attendance.getMarkedBy().getFullName()
        );
    }
}
