package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
}
