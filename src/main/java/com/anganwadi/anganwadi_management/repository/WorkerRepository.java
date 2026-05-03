package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.Center;
import com.anganwadi.anganwadi_management.entity.Worker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkerRepository extends JpaRepository<Worker, Integer> {
    Optional<Worker> findByMobile(String mobile);

    List<Worker> findByCenter(Center center);
}
