package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.VaccinationRecord;
import com.anganwadi.anganwadi_management.entity.VaccinationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Integer> {
    List<VaccinationRecord> findByBeneficiaryIdOrderByGivenDateAsc(Long beneficiaryId);
    Optional<VaccinationRecord> findByBeneficiaryIdAndVaccineId(Long beneficiaryId, Long vaccineId);
    boolean existsByBeneficiaryIdAndVaccineId(Long beneficiaryId, Long vaccineId);


    @Query("SELECT v.vaccine, COUNT(v) FROM VaccinationRecord v WHERE v.beneficiary.center.id = :centerId GROUP BY v.vaccine")
    Map<VaccinationSchedule, Long> countGivenByCenter(@Param("centerId") Long centerId);

    // Total beneficiaries in center
    @Query("SELECT COUNT(b) FROM Beneficiary b WHERE b.center.id = :centerId AND b.active = true")
    Long countBeneficiariesInCenter(@Param("centerId") Long centerId);
}
