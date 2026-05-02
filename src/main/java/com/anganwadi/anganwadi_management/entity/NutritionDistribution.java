package com.anganwadi.anganwadi_management.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "nutrition_distributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @Column(nullable = false)
    private LocalDate distributionDate;

    @Column(nullable = false)
    private String itemName;      // "Egg", "Fortified Rice", "Milk"

    private Double quantity;      // e.g., 2 (eggs), 250 (grams)

    private String unit;          // "piece", "gram", "ml"

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker distributedBy;

    private LocalDateTime createdAt = LocalDateTime.now();
}
