package com.anganwadi.anganwadi_management.service;


import com.anganwadi.anganwadi_management.dto.BeneficiaryDto;
import com.anganwadi.anganwadi_management.entity.Beneficiary;
import com.anganwadi.anganwadi_management.entity.Center;
import com.anganwadi.anganwadi_management.entity.Worker;
import com.anganwadi.anganwadi_management.repository.BeneficiaryRepository;
import com.anganwadi.anganwadi_management.repository.CenterRepository;
import com.anganwadi.anganwadi_management.util.SecurityUtils;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final CenterRepository centerRepository;
    private final SecurityUtils securityUtils;

    @PersistenceContext
    private EntityManager entityManager;

    public BeneficiaryService(BeneficiaryRepository beneficiaryRepository,
                              CenterRepository centerRepository,
                              SecurityUtils securityUtils
    ) {
        this.beneficiaryRepository = beneficiaryRepository;
        this.centerRepository = centerRepository;
        this.securityUtils = securityUtils;
    }

    @Transactional
    public BeneficiaryDto createBeneficiary(BeneficiaryDto dto) {
        Center center = centerRepository.findById(Math.toIntExact(dto.getCenterId()))
                .orElseThrow(() -> new RuntimeException("Center not found"));

        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.WORKER &&
                (currentWorker.getCenter() == null || !currentWorker.getCenter().getId().equals(center.getId()))) {
            throw new RuntimeException("Worker can only add beneficiaries to their own center");
        }

        String beneficiaryId = generateBeneficiaryId(center.getId());

        Beneficiary beneficiary = Beneficiary.builder()
                .awcBeneficiaryId(beneficiaryId)
                .fullName(dto.getFullName())
                .dateOfBirth(dto.getDateOfBirth())
                .gender(Beneficiary.Gender.valueOf(dto.getGender()))
                .aadhaarNumber(dto.getAadhaarNumber())
                .parentName(dto.getParentName())
                .parentMobile(dto.getParentMobile())
                .center(center)
                .active(true)
                .build();
        beneficiary.setIsPregnant(false);

        Beneficiary saved = beneficiaryRepository.save(beneficiary);
        return convertToDto(saved);
    }


    private String generateBeneficiaryId(Long centerId) {
        // Find all beneficiaries for this center (active or inactive? Use all to keep sequence unique)
        List<Beneficiary> centerBeneficiaries = beneficiaryRepository.findByCenterId(centerId);
        int maxSeq = 0;
        for (Beneficiary b : centerBeneficiaries) {
            String id = b.getAwcBeneficiaryId();
            // Expected format: "AW-<centerId>-<seq>"
            String[] parts = id.split("-");
            if (parts.length == 3 && parts[1].equals(String.valueOf(centerId))) {
                try {
                    int seq = Integer.parseInt(parts[2]);
                    if (seq > maxSeq) maxSeq = seq;
                } catch (NumberFormatException e) {
                    // ignore malformed IDs
                }
            }
        }
        return "AW-" + centerId + "-" + (maxSeq + 1);
    }


    public BeneficiaryDto updateBeneficiary(Long id, BeneficiaryDto dto) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));

        // Permission check: worker can only update beneficiaries in their center
        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Worker can only update beneficiaries in their own center");
            }
        }

        beneficiary.setFullName(dto.getFullName());
        beneficiary.setDateOfBirth(dto.getDateOfBirth());
        beneficiary.setGender(Beneficiary.Gender.valueOf(dto.getGender()));
        beneficiary.setAadhaarNumber(dto.getAadhaarNumber());
        beneficiary.setParentName(dto.getParentName());
        beneficiary.setParentMobile(dto.getParentMobile());
        if (dto.getCenterId() != null && !dto.getCenterId().equals(beneficiary.getCenter().getId())) {
            Center newCenter = centerRepository.findById(Math.toIntExact(dto.getCenterId()))
                    .orElseThrow(() -> new RuntimeException("New center not found"));
            beneficiary.setCenter(newCenter);
            // Optionally regenerate ID? We'll keep old ID for simplicity
        }
        beneficiary.setActive(dto.getActive() != null ? dto.getActive() : beneficiary.getActive());

        return convertToDto(beneficiaryRepository.save(beneficiary));
    }

    public void deleteBeneficiary(Long id) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
        beneficiary.setActive(false);
        beneficiaryRepository.save(beneficiary);
    }

    public List<BeneficiaryDto> getBeneficiariesForCurrentWorker() {
        Worker currentWorker = securityUtils.getCurrentWorker();
        Long centerId = null;
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null) throw new RuntimeException("Worker not assigned to any center");
            centerId = currentWorker.getCenter().getId();
        } else if (currentWorker.getRole() == Worker.Role.SUPERVISOR) {
            // Supervisor sees all beneficiaries in their block (we need block field in center)
            // For simplicity, we assume supervisor has no direct center constraint –
            // but we'll return all active beneficiaries or filter by block later.
            // To keep simple, return all active beneficiaries (admin/supervisor can see all)
            return beneficiaryRepository.findByActiveTrue().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }
        // Worker case
        if (centerId != null) {
            return beneficiaryRepository.findByCenterIdAndActiveTrue(centerId).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        }
        // Admin sees all
        return beneficiaryRepository.findByActiveTrue().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public BeneficiaryDto getBeneficiaryById(Long id) {
        Beneficiary beneficiary = beneficiaryRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));
        Worker currentWorker = securityUtils.getCurrentWorker();
        if (currentWorker.getRole() == Worker.Role.WORKER) {
            if (currentWorker.getCenter() == null ||
                    !currentWorker.getCenter().getId().equals(beneficiary.getCenter().getId())) {
                throw new RuntimeException("Access denied: beneficiary not in your center");
            }
        }
        return convertToDto(beneficiary);
    }

    private BeneficiaryDto convertToDto(Beneficiary b) {
        BeneficiaryDto dto = new BeneficiaryDto();
        dto.setId(b.getId());
        dto.setAwcBeneficiaryId(b.getAwcBeneficiaryId());
        dto.setFullName(b.getFullName());
        dto.setDateOfBirth(b.getDateOfBirth());
        dto.setGender(b.getGender().name());
        dto.setAadhaarNumber(b.getAadhaarNumber());
        dto.setParentName(b.getParentName());
        dto.setParentMobile(b.getParentMobile());
        dto.setCenterId(b.getCenter().getId());
        dto.setActive(b.getActive());
        return dto;
    }
}
