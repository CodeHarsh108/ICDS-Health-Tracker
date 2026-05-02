package com.anganwadi.anganwadi_management.controller;
import com.anganwadi.anganwadi_management.dto.WorkerRegistrationDto;
import com.anganwadi.anganwadi_management.entity.Center;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.CenterRepository;
import com.anganwadi.anganwadi_management.repository.WorkerRepository;
import com.anganwadi.anganwadi_management.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final WorkerRepository workerRepository;
    private final CenterRepository centerRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          WorkerRepository workerRepository,
                          CenterRepository centerRepository,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.workerRepository = workerRepository;
        this.centerRepository = centerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String mobile = request.get("mobile");
        String password = request.get("password");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(mobile, password)
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }

        Worker worker = workerRepository.findByMobile(mobile)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String role = worker.getRole().name();
        String token = jwtUtil.generateToken(mobile, role);

        return ResponseEntity.ok(Map.of("token", token, "role", role, "mobile", mobile));
    }

    // Registration API – only ADMIN can create new workers/supervisors
    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerWorker(@Valid @RequestBody WorkerRegistrationDto dto) {
        if (workerRepository.findByMobile(dto.getMobile()).isPresent()) {
            return ResponseEntity.badRequest().body("Mobile already registered");
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
                .hashedPassword(passwordEncoder.encode(dto.getPassword()))
                .active(true)
                .build();

        workerRepository.save(worker);
        return ResponseEntity.status(HttpStatus.CREATED).body("Worker created successfully");
    }
}
