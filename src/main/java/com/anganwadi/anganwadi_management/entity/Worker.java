package com.anganwadi.anganwadi_management.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Worker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeId;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String mobile;

    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;                  // ADMIN, SUPERVISOR, WORKER

    @ManyToOne
    @JoinColumn(name = "center_id")
    private Center center;              // null for ADMIN/SUPERVISOR without single center

    @Column(nullable = false)
    private String hashedPassword;      // will be set later with BCrypt

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Role {
        ADMIN, SUPERVISOR, WORKER
    }
}
