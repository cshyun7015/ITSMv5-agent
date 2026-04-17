package com.itsm.system.service.catalog;

import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogDeploymentService {
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final TenantRepository tenantRepository;

    /**
     * 템플릿 서비스를 특정 테넌트에 배포합니다.
     * 카테고리 정보는 공통 코드(categoryCode)를 그대로 복제합니다.
     */
    @Transactional
    public void deployTemplate(Long templateId, Tenant targetTenant) {
        if (serviceCatalogRepository.existsByTenant_TenantIdAndTemplateSourceId(targetTenant.getTenantId(), templateId)) {
            log.info("Template {} already deployed to tenant {}, skipping.", templateId, targetTenant.getTenantId());
            return;
        }

        ServiceCatalog template = serviceCatalogRepository.findById(templateId)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + templateId));

        if (!template.isTemplate()) {
            throw new IllegalArgumentException("Target is not a template");
        }

        // 서비스 복제 (카테고리 엔티티 대신 categoryCode 사용)
        ServiceCatalog deployedService = ServiceCatalog.builder()
                .name(template.getName())
                .description(template.getDescription())
                .icon(template.getIcon())
                .categoryCode(template.getCategoryCode())
                .jsonSchema(template.getJsonSchema())
                .approvalRequired(template.isApprovalRequired())
                .tenant(targetTenant)
                .isTemplate(false)
                .templateSourceId(template.getId())
                .build();

        serviceCatalogRepository.save(deployedService);
    }

    /**
     * 템플릿의 배포 상태를 요청된 테넌트 리스트와 동기화합니다.
     * 1. 현재 배포된 테넌트 리스트 조회
     * 2. 요청 리스트에 없는데 기존에 배포된 경우 -> 삭제
     * 3. 요청 리스트에 있는데 기존에 없는 경우 -> 신규 배포
     */
    @Transactional
    public void syncDeployments(Long templateId, List<String> targetTenantIds) {
        // 기존 배포된 목록 조회
        List<ServiceCatalog> existingDeployments = serviceCatalogRepository.findAllByTemplateSourceId(templateId);
        
        // 테넌트별로 기존 배포 그룹화
        java.util.Map<String, List<ServiceCatalog>> tenantToDeployments = existingDeployments.stream()
                .collect(java.util.stream.Collectors.groupingBy(d -> d.getTenant().getTenantId()));

        // 1. 기존 배포 중 처리
        tenantToDeployments.forEach((tenantId, deployments) -> {
            if (!targetTenantIds.contains(tenantId)) {
                // 대상 리스트에 없으면 모두 삭제
                log.info("Removing all deployments for template {} from tenant {}", templateId, tenantId);
                serviceCatalogRepository.deleteAll(deployments);
            } else {
                // 대상 리스트에 있으면 중복 제거 (하나만 남기고 나머지 삭제)
                if (deployments.size() > 1) {
                    log.info("Found duplicate deployments for template {} in tenant {}, cleaning up.", templateId, tenantId);
                    serviceCatalogRepository.deleteAll(deployments.subList(1, deployments.size()));
                }
            }
        });

        // 2. 신규 배포 처리
        for (String tenantId : targetTenantIds) {
            if (!tenantToDeployments.containsKey(tenantId)) {
                Tenant tenant = tenantRepository.findById(tenantId)
                        .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));
                deployTemplate(templateId, tenant);
            }
        }
        
        // 변경사항 즉시 반영 (검증용)
        serviceCatalogRepository.flush();
    }

    /**
     * 특정 테넌트의 모든 서비스 카탈로그 조회
     */
    public List<ServiceCatalog> getCatalogForTenant(Tenant tenant) {
        return serviceCatalogRepository.findAllByTenant(tenant);
    }
}
