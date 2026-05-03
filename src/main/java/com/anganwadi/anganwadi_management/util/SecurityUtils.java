package com.anganwadi.anganwadi_management.util;


import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.WorkerRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private final WorkerRepository workerRepository;

    public SecurityUtils(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    public Worker getCurrentWorker() {
        String mobile = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return workerRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("Current worker not found"));
    }
}