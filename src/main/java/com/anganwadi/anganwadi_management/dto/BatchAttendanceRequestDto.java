package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BatchAttendanceRequestDto {
    @NotNull
    private LocalDate attendanceDate;

    @NotNull
    private String sessionType;

    @NotNull
    private List<BatchAttendanceItem> attendances;

    @Data
    public static class BatchAttendanceItem {
        @NotNull
        private Long beneficiaryId;

        @NotNull
        private Boolean isPresent;
    }
}
