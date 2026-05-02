package com.anganwadi.anganwadi_management.repository;

import com.anganwadi.anganwadi_management.entity.Center;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CenterRepositoy extends JpaRepository<Center, Integer> {
    Optional<Center> findByCenterCode(String centerCode);

}
