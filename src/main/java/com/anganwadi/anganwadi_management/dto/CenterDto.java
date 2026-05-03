package com.anganwadi.anganwadi_management.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CenterDto {
    private Long id;
    @NotBlank private String centerCode;
    @NotBlank private String name;
    private String village;
    private String block;
    private String district;
    private Double latitude;
    private Double longitude;
    private Boolean active;
}