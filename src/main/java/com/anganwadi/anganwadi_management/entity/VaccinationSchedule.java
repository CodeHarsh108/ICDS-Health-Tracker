package com.anganwadi.anganwadi_management.entity;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vaccination_schedule")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vaccineName;    // "BCG", "DPT-1", etc.

    @Column(nullable = false)
    private Integer dueAgeDays;    // days after birth

    private String description;
}