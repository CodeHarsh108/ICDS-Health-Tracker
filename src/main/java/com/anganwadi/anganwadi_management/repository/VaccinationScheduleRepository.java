package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.VaccinationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VaccinationScheduleRepository extends JpaRepository<VaccinationSchedule, Integer> {
    List<VaccinationSchedule> findAllByOrderByDueAgeDaysAsc();

}
