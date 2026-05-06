package com.anganwadi.anganwadi_management.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "growth_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrowthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @Column(nullable = false)
    private LocalDate recordDate;

    private Double weightKg;       // in kg, between 0.5 - 50

    private Double heightCm;       // optional

    private Double muacCm;         // Mid-Upper Arm Circumference

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker recordedBy;

    private String notes;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = true)
    private LocalDateTime lastModified;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastModified = LocalDateTime.now();
    }
}