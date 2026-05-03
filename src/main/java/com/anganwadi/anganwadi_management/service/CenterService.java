package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.CenterDto;
import com.anganwadi.anganwadi_management.entity.Center;
import com.anganwadi.anganwadi_management.repository.CenterRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CenterService {

    private final CenterRepository centerRepository;

    public CenterService(CenterRepository centerRepository) {
        this.centerRepository = centerRepository;
    }

    public CenterDto createCenter(CenterDto dto) {
        Center center = new Center();
        center.setCenterCode(dto.getCenterCode());
        center.setName(dto.getName());
        center.setVillage(dto.getVillage());
        center.setBlock(dto.getBlock());
        center.setDistrict(dto.getDistrict());
        center.setLatitude(dto.getLatitude());
        center.setLongitude(dto.getLongitude());
        center.setActive(true);
        Center saved = centerRepository.save(center);
        return convertToDto(saved);
    }

    public CenterDto updateCenter(Long id, CenterDto dto) {
        Center center = centerRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Center not found"));
        center.setName(dto.getName());
        center.setVillage(dto.getVillage());
        center.setBlock(dto.getBlock());
        center.setDistrict(dto.getDistrict());
        center.setLatitude(dto.getLatitude());
        center.setLongitude(dto.getLongitude());
        center.setActive(dto.getActive() != null ? dto.getActive() : center.getActive());
        return convertToDto(centerRepository.save(center));
    }

    public void deleteCenter(Long id) {
        Center center = centerRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Center not found"));
        center.setActive(false); // soft delete
        centerRepository.save(center);
    }

    public List<CenterDto> getAllCenters() {
        return centerRepository.findAll().stream()
                .filter(Center::getActive)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public CenterDto getCenterById(Long id) {
        Center center = centerRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Center not found"));
        return convertToDto(center);
    }

    private CenterDto convertToDto(Center center) {
        CenterDto dto = new CenterDto();
        dto.setId(center.getId());
        dto.setCenterCode(center.getCenterCode());
        dto.setName(center.getName());
        dto.setVillage(center.getVillage());
        dto.setBlock(center.getBlock());
        dto.setDistrict(center.getDistrict());
        dto.setLatitude(center.getLatitude());
        dto.setLongitude(center.getLongitude());
        dto.setActive(center.getActive());
        return dto;
    }
}
