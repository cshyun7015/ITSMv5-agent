package com.itsm.system.domain.cmdb;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfigurationItemRepository extends JpaRepository<ConfigurationItem, Long> {
    List<ConfigurationItem> findByTenant_TenantId(String tenantId);
    List<ConfigurationItem> findByTenant_TenantIdAndTypeCode(String tenantId, String typeCode);
}
