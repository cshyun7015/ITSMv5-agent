package com.itsm.system.service.tenant;

import com.itsm.system.domain.tenant.Organization;
import com.itsm.system.domain.tenant.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    @Transactional(readOnly = true)
    public List<Organization> listOrganizationsByTenant(String tenantId) {
        return organizationRepository.findByTenant_TenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public Organization getOrganization(Long orgId, String tenantId) {
        Organization org = organizationRepository.findById(Objects.requireNonNull(orgId))
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        
        // Skip tenant check for Global Admin tenants (MSP_CORE, OPER_MSP)
        if (!"MSP_CORE".equals(tenantId) && !"OPER_MSP".equals(tenantId) && 
            !org.getTenant().getTenantId().equals(tenantId)) {
            throw new SecurityException("Access denied to organization in a different tenant");
        }
        return org;
    }
}
