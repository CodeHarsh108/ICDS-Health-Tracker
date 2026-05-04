package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByBeneficiaryIdAndAttendanceDateAndSessionType(
            Long beneficiaryId, LocalDate date, Attendance.SessionType sessionType);

    List<Attendance> findByBeneficiaryIdOrderByAttendanceDateDesc(Long beneficiaryId);

    @Query("SELECT a FROM Attendance a WHERE a.beneficiary.center.id = :centerId AND a.attendanceDate = :date")
    List<Attendance> findByCenterIdAndDate(@Param("centerId") Long centerId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(DISTINCT a.beneficiary.id) FROM Attendance a WHERE a.beneficiary.center.id = :centerId AND a.sessionType = :sessionType AND a.attendanceDate BETWEEN :startDate AND :endDate AND a.isPresent = true")
    Long countDistinctPresentBeneficiaries(@Param("centerId") Long centerId,
                                           @Param("sessionType") Attendance.SessionType sessionType,
                                           @Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(DISTINCT b.id) FROM Beneficiary b WHERE b.center.id = :centerId AND b.active = true AND b.gender IS NOT NULL") // All beneficiaries (we filter by session type later)
    Long countTotalEnrolledInCenter(@Param("centerId") Long centerId);

    // For pregnant mothers we need a different query – we assume pregnant mothers have a flag in Beneficiary?
    // For simplicity, we'll add a boolean `isPregnant` in Beneficiary entity.
    // Let's add that field now.
}