package com.anganwadi.anganwadi_management.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "beneficiaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String awcBeneficiaryId;   // e.g., AW-C001-123

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String aadhaarNumber;      // optional, will simulate verification later

    @Column(nullable = false)
    private String parentName;

    @Column(nullable = false)
    private String parentMobile;

    @ManyToOne
    @JoinColumn(name = "center_id", nullable = false)
    private Center center;

    @Builder.Default
    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Gender {
        MALE, FEMALE, OTHER
    }

    @Column(nullable = false)
    private Boolean isPregnant = false;


}