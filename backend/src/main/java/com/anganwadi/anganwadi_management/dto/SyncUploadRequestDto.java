package com.anganwadi.anganwadi_management.dto;


import lombok.Data;
import java.util.List;

@Data
public class SyncUploadRequestDto {
    private List<GrowthRecordDto> growthRecords;
    private List<NutritionDistributionRequestDto> nutritionRecords;
    private List<AttendanceRequestDto> attendanceRecords;
    private List<VaccinationRequestDto> vaccinationRecords;
}
