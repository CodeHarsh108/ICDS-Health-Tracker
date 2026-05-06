package com.anganwadi.anganwadi_management.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class SyncResponseDto {
    private int uploadedCount;
    private int failedCount;
    private List<String> errors;
}
