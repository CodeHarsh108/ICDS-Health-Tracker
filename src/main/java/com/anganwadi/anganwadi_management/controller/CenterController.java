package com.anganwadi.anganwadi_management.controller;


import com.anganwadi.anganwadi_management.dto.ApiResponse;
import com.anganwadi.anganwadi_management.dto.CenterDto;
import com.anganwadi.anganwadi_management.service.CenterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/centers")
public class CenterController {

    private final CenterService centerService;

    public CenterController(CenterService centerService) {
        this.centerService = centerService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createCenter(@Valid @RequestBody CenterDto dto) {
        CenterDto created = centerService.createCenter(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse("Center created", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateCenter(@PathVariable Long id, @Valid @RequestBody CenterDto dto) {
        CenterDto updated = centerService.updateCenter(id, dto);
        return ResponseEntity.ok(new ApiResponse("Center updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteCenter(@PathVariable Long id) {
        centerService.deleteCenter(id);
        return ResponseEntity.ok(new ApiResponse("Center deleted (soft)", null));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<CenterDto>> getAllCenters() {
        return ResponseEntity.ok(centerService.getAllCenters());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<CenterDto> getCenterById(@PathVariable Long id) {
        return ResponseEntity.ok(centerService.getCenterById(id));
    }
}
