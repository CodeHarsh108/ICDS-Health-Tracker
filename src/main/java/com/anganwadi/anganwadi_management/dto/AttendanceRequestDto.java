package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceRequestDto {
    @NotNull
    private Long beneficiaryId;

    @NotNull
    private LocalDate attendanceDate;

    @NotNull
    private Boolean isPresent;

    @NotNull
    private String sessionType;   // CHILD_SESSION or PREGNANT_MOTHER_SESSION
}
