package com.anganwadi.anganwadi_management.entity;

 
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccination_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaccinationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @ManyToOne
    @JoinColumn(name = "vaccine_id", nullable = false)
    private VaccinationSchedule vaccine;

    @Column(nullable = false)
    private LocalDate givenDate;

    private String batchNumber;

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker givenBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = true)
    private LocalDateTime lastModified;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        lastModified = LocalDateTime.now();
    }
}