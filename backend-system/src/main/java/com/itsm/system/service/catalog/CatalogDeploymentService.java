package com.itsm.system.service.catalog;

import com.itsm.system.domain.catalog.CatalogCategory;
import com.itsm.system.domain.catalog.CatalogCategoryRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.tenant.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogDeploymentService {

    private final ServiceCatalogRepository serviceCatalogRepository;
    private final CatalogCategoryRepository catalogCategoryRepository;

    /**
     * 템플릿 서비스를 특정 테넌트에 배포합니다.
     * 이미 동일한 소스에서 복제된 이력이 있다면 기존 항목을 업데이트하거나 생략할 수 있습니다.
     */
    @Transactional
    public void deployTemplate(Long templateId, Tenant targetTenant) {
        ServiceCatalog template = serviceCatalogRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));

        if (!template.isTemplate()) {
            throw new IllegalArgumentException("Target is not a template");
        }

        // 1. 카테고리 매칭 또는 복제
        CatalogCategory targetCategory = findOrCreateCategory(template.getCategory(), targetTenant);

        // 2. 서비스 복제
        ServiceCatalog deployedService = ServiceCatalog.builder()
                .name(template.getName())
                .description(template.getDescription())
                .icon(template.getIcon())
                .category(targetCategory)
                .jsonSchema(template.getJsonSchema())
                .approvalRequired(template.isApprovalRequired())
                .tenant(targetTenant)
                .isTemplate(false)
                .templateSourceId(template.getId())
                .build();

        serviceCatalogRepository.save(deployedService);
    }

    private CatalogCategory findOrCreateCategory(CatalogCategory sourceCategory, Tenant targetTenant) {
        // 동일한 이름의 템플릿 기반 카테고리가 이미 존재하는지 확인
        return catalogCategoryRepository.findAllByTenant(targetTenant).stream()
                .filter(c -> c.getName().equals(sourceCategory.getName()))
                .findFirst()
                .orElseGet(() -> {
                    CatalogCategory newCategory = CatalogCategory.builder()
                            .name(sourceCategory.getName())
                            .description(sourceCategory.getDescription())
                            .icon(sourceCategory.getIcon())
                            .tenant(targetTenant)
                            .isTemplate(false)
                            .build();
                    return catalogCategoryRepository.save(newCategory);
                });
    }

    /**
     * 특정 테넌트의 모든 서비스 카탈로그 조회
     */
    public List<ServiceCatalog> getCatalogForTenant(Tenant tenant) {
        return serviceCatalogRepository.findAllByTenant(tenant);
    }
}
