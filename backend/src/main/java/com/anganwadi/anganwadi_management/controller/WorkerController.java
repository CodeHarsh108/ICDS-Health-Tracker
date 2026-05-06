package com.anganwadi.anganwadi_management.controller;

import com.anganwadi.anganwadi_management.dto.ApiResponse;
import com.anganwadi.anganwadi_management.dto.WorkerDto;
import com.anganwadi.anganwadi_management.service.WorkerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createWorker(@Valid @RequestBody WorkerDto dto) {
        WorkerDto created = workerService.createWorker(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Worker created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateWorker(@PathVariable Long id, @Valid @RequestBody WorkerDto dto) {
        WorkerDto updated = workerService.updateWorker(id, dto);
        return ResponseEntity.ok(new ApiResponse("Worker updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return ResponseEntity.ok(new ApiResponse("Worker deleted (soft)", null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<WorkerDto>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/center/{centerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public ResponseEntity<List<WorkerDto>> getWorkersByCenter(@PathVariable Long centerId) {
        return ResponseEntity.ok(workerService.getWorkersByCenter(centerId));
    }
}