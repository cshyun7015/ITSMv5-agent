package com.itsm.system.service.cmdb;

import com.itsm.system.domain.cmdb.ConfigurationItem;
import com.itsm.system.domain.cmdb.ConfigurationItemRepository;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.cmdb.ConfigurationItemDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConfigurationItemService {

    private final ConfigurationItemRepository configurationItemRepository;
    private final TenantRepository tenantRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public ConfigurationItemDTO createCI(ConfigurationItemDTO dto) {
        Tenant tenant = tenantRepository.findById(Objects.requireNonNull(dto.getTenantId()))
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        
        ConfigurationItem ci = ConfigurationItem.builder()
                .tenant(tenant)
                .name(dto.getName())
                .typeCode(dto.getTypeCode())
                .statusCode("PROVISIONING") // Initial state
                .serialNumber(dto.getSerialNumber())
                .location(dto.getLocation())
                .description(dto.getDescription())
                .build();

        if (dto.getOwnerId() != null) {
            memberRepository.findById(Objects.requireNonNull(dto.getOwnerId())).ifPresent(ci::setOwner);
        }

        return convertToDTO(configurationItemRepository.save(Objects.requireNonNull(ci)));
    }

    @Transactional
    public ConfigurationItemDTO updateCI(Long id, ConfigurationItemDTO dto) {
        ConfigurationItem ci = configurationItemRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("CI not found"));
        
        ci.updateInfo(dto.getName(), dto.getTypeCode(), dto.getSerialNumber(), dto.getLocation(), dto.getDescription());
        
        if (dto.getStatusCode() != null) {
            ci.updateStatus(dto.getStatusCode());
        }

        if (dto.getOwnerId() != null) {
            memberRepository.findById(Objects.requireNonNull(dto.getOwnerId())).ifPresent(ci::setOwner);
        }

        return convertToDTO(configurationItemRepository.save(ci));
    }

    @Transactional(readOnly = true)
    public List<ConfigurationItemDTO> listCIs(String tenantId) {
        return configurationItemRepository.findAllWithDetailsByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConfigurationItemDTO getCI(Long id) {
        return configurationItemRepository.findByIdWithDetails(Objects.requireNonNull(id))
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("CI not found"));
    }

    @Transactional
    public void deleteCI(Long id) {
        configurationItemRepository.deleteById(Objects.requireNonNull(id));
    }

    private ConfigurationItemDTO convertToDTO(ConfigurationItem ci) {
        return ConfigurationItemDTO.builder()
                .ciId(ci.getCiId())
                .tenantId(ci.getTenant() != null ? ci.getTenant().getTenantId() : null)
                .tenantName(ci.getTenant() != null ? ci.getTenant().getName() : "Unknown")
                .name(ci.getName())
                .typeCode(ci.getTypeCode())
                .statusCode(ci.getStatusCode())
                .serialNumber(ci.getSerialNumber())
                .location(ci.getLocation())
                .description(ci.getDescription())
                .ownerId(ci.getOwner() != null ? ci.getOwner().getMemberId() : null)
                .ownerName(ci.getOwner() != null ? ci.getOwner().getUsername() : null)
                .createdAt(ci.getCreatedAt())
                .updatedAt(ci.getUpdatedAt())
                .build();
    }
}
