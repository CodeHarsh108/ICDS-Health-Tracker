package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.VaccinationRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Integer> {
    List<VaccinationRecord> findByBeneficiaryIdOrderByGivenDateAsc(Long beneficiaryId);
    Optional<VaccinationRecord> findByBeneficiaryIdAndVaccineId(Long beneficiaryId, Long vaccineId);
    boolean existsByBeneficiaryIdAndVaccineId(Long beneficiaryId, Long vaccineId);

}
