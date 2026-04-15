package com.itsm.system.domain.catalog;

import com.itsm.system.domain.tenant.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CatalogCategoryRepository extends JpaRepository<CatalogCategory, Long> {
    List<CatalogCategory> findAllByTenant(Tenant tenant);
    List<CatalogCategory> findAllByIsTemplateTrue();
}
