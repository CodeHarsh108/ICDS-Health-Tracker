package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Arrays;
import java.util.List;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Integer> {

    List<Beneficiary> findByCenterId(Long centerId);
    List<Beneficiary> findByCenterIdAndActiveTrue(Long centerId);
    List<Beneficiary> findByActiveTrue();


    // Count enrolled for child session (non-pregnant, active)
    @Query("SELECT COUNT(b) FROM Beneficiary b WHERE b.center.id = :centerId AND b.active = true AND (b.isPregnant = false OR b.isPregnant IS NULL)")
    Long countEnrolledChildren(@Param("centerId") Long centerId);

    // Count enrolled for pregnant mother session
    @Query("SELECT COUNT(b) FROM Beneficiary b WHERE b.center.id = :centerId AND b.active = true AND b.isPregnant = true")
    Long countEnrolledPregnantMothers(@Param("centerId") Long centerId);
}
