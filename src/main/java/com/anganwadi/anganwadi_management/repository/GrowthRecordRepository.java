package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.GrowthRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GrowthRecordRepository extends JpaRepository<GrowthRecord, Integer> {
    List<GrowthRecord> findByBeneficiaryIdOrderByRecordDateAsc(Long beneficiaryId);

    Optional<GrowthRecord> findTopByBeneficiaryIdOrderByRecordDateDesc(Long beneficiaryId);

    boolean existsByBeneficiaryIdAndRecordDate(Long beneficiaryId, LocalDate recordDate);

    @Query("SELECT gr FROM GrowthRecord gr WHERE gr.beneficiary.id = :beneficiaryId AND gr.recordDate >= :startDate")
    List<GrowthRecord> findByBeneficiaryIdAndRecordDateAfter(@Param("beneficiaryId") Long beneficiaryId, @Param("startDate") LocalDate startDate);

    // Find latest growth record before end of month, and first record after start?
// Easier: get all records for beneficiaries in center, then compute in service.
// We'll do service calculation but need efficient queries.

    @Query("SELECT gr FROM GrowthRecord gr WHERE gr.beneficiary.center.id = :centerId AND gr.recordDate BETWEEN :startDate AND :endDate ORDER BY gr.beneficiary.id, gr.recordDate")
    List<GrowthRecord> findByCenterAndDateRange(@Param("centerId") Long centerId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate);
}
