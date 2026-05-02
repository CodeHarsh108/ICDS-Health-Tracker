package com.anganwadi.anganwadi_management.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @Column(nullable = false)
    private LocalDate attendanceDate;

    @Column(nullable = false)
    private Boolean isPresent;

    @Enumerated(EnumType.STRING)
    private SessionType sessionType;   // CHILD_SESSION, PREGNANT_MOTHER_SESSION

    @ManyToOne
    @JoinColumn(name = "worker_id", nullable = false)
    private Worker markedBy;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum SessionType {
        CHILD_SESSION, PREGNANT_MOTHER_SESSION
    }
}