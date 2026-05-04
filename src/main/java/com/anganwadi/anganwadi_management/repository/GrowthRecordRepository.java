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
}
