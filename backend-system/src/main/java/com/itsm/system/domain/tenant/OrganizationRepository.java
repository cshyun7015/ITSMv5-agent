package com.itsm.system.domain.tenant;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByTenant_TenantId(String tenantId);
}
