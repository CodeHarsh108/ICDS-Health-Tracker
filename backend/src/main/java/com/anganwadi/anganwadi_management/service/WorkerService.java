package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.WorkerDto;
import com.anganwadi.anganwadi_management.entity.Center;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.CenterRepository;
import com.anganwadi.anganwadi_management.repository.WorkerRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final CenterRepository centerRepository;
    private final PasswordEncoder passwordEncoder;

    public WorkerService(WorkerRepository workerRepository,
                         CenterRepository centerRepository,
                         PasswordEncoder passwordEncoder) {
        this.workerRepository = workerRepository;
        this.centerRepository = centerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public WorkerDto createWorker(WorkerDto dto) {
        if (workerRepository.findByMobile(dto.getMobile()).isPresent()) {
            throw new RuntimeException("Mobile already registered");
        }
        Center center = null;
        if (dto.getCenterId() != null) {
            center = centerRepository.findById(Math.toIntExact(dto.getCenterId()))
                    .orElseThrow(() -> new RuntimeException("Center not found"));
        }
        Worker worker = Worker.builder()
                .employeeId(dto.getEmployeeId())
                .fullName(dto.getFullName())
                .mobile(dto.getMobile())
                .email(dto.getEmail())
                .role(Worker.Role.valueOf(dto.getRole()))
                .center(center)
                .hashedPassword(passwordEncoder.encode("default123")) // default password, should be changed on first login
                .active(true)
                .build();
        Worker saved = workerRepository.save(worker);
        return convertToDto(saved);
    }

    public WorkerDto updateWorker(Long id, WorkerDto dto) {
        Worker worker = workerRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        worker.setFullName(dto.getFullName());
        worker.setMobile(dto.getMobile());
        worker.setEmail(dto.getEmail());
        if (dto.getRole() != null) {
            worker.setRole(Worker.Role.valueOf(dto.getRole()));
        }
        if (dto.getCenterId() != null) {
            Center center = centerRepository.findById(Math.toIntExact(dto.getCenterId()))
                    .orElseThrow(() -> new RuntimeException("Center not found"));
            worker.setCenter(center);
        }
        if (dto.getActive() != null) {
            worker.setActive(dto.getActive());
        }
        return convertToDto(workerRepository.save(worker));
    }

    public void deleteWorker(Long id) {
        Worker worker = workerRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Worker not found"));
        worker.setActive(false);
        workerRepository.save(worker);
    }

    public List<WorkerDto> getAllWorkers() {
        return workerRepository.findAll().stream()
                .filter(Worker::isActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<WorkerDto> getWorkersByCenter(Long centerId) {
        Center center = centerRepository.findById(Math.toIntExact(centerId))
                .orElseThrow(() -> new RuntimeException("Center not found"));
        return workerRepository.findByCenter(center).stream()
                .filter(Worker::isActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private WorkerDto convertToDto(Worker worker) {
        WorkerDto dto = new WorkerDto();
        dto.setId(worker.getId());
        dto.setEmployeeId(worker.getEmployeeId());
        dto.setFullName(worker.getFullName());
        dto.setMobile(worker.getMobile());
        dto.setEmail(worker.getEmail());
        dto.setRole(worker.getRole().name());
        dto.setCenterId(worker.getCenter() != null ? worker.getCenter().getId() : null);
        dto.setActive(worker.isActive());
        return dto;
    }
}
