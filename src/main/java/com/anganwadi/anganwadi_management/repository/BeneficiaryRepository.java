package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Integer> {

    List<Beneficiary> findByCenterId(Long centerId);
    List<Beneficiary> findByCenterIdAndActiveTrue(Long centerId);
    List<Beneficiary> findByActiveTrue();
}
