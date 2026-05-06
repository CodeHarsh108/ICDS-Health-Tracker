package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.NutritionDistribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface NutritionDistributionRepository extends JpaRepository<NutritionDistribution, Long> {

    List<NutritionDistribution> findByBeneficiaryIdOrderByDistributionDateDesc(Long beneficiaryId);

    @Query("SELECT n FROM NutritionDistribution n WHERE n.beneficiary.center.id = :centerId AND n.distributionDate BETWEEN :startDate AND :endDate")
    List<NutritionDistribution> findByCenterIdAndDateRange(@Param("centerId") Long centerId,
                                                           @Param("startDate") LocalDate startDate,
                                                           @Param("endDate") LocalDate endDate);

    @Query("SELECT n.itemName, SUM(n.quantity) as total, n.unit FROM NutritionDistribution n " +
            "WHERE n.beneficiary.center.id = :centerId AND n.distributionDate BETWEEN :startDate AND :endDate " +
            "GROUP BY n.itemName, n.unit")
    List<Object[]> getMonthlySummary(@Param("centerId") Long centerId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);
}