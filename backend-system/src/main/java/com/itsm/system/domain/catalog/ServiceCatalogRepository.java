package com.itsm.system.domain.catalog;

import com.itsm.system.domain.tenant.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {
    List<ServiceCatalog> findAllByTenant(Tenant tenant);
    List<ServiceCatalog> findAllByIsTemplateTrue();
    List<ServiceCatalog> findAllByTemplateSourceId(Long templateSourceId);
    boolean existsByTenant_TenantIdAndTemplateSourceId(String tenantId, Long templateSourceId);
    List<ServiceCatalog> findAllByTenantAndCategory(Tenant tenant, CatalogCategory category);
    long countByCategory(CatalogCategory category);
    long countByIsTemplateTrue();
}
