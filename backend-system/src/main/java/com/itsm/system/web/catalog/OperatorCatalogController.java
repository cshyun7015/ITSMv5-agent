package com.itsm.system.web.catalog;

import com.itsm.system.domain.catalog.CatalogCategory;
import com.itsm.system.domain.catalog.CatalogCategoryRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.service.catalog.CatalogDeploymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@lombok.extern.slf4j.Slf4j
@RestController
@RequestMapping("/api/v1/operator/catalog")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperatorCatalogController {

    private final ServiceCatalogRepository serviceCatalogRepository;
    private final CatalogCategoryRepository catalogCategoryRepository;
    private final CatalogDeploymentService catalogDeploymentService;
    private final TenantRepository tenantRepository;

    private boolean isCustomerTenant(Member member) {
        if (member == null || member.getTenant() == null) {
            log.warn("Security check failed: Member or Tenant information is missing");
            return true; // 기본적으로 차단
        }
        
        String tenantId = member.getTenant().getTenantId();
        return tenantRepository.findById(tenantId)
                .map(t -> "CUSTOMER".equals(t.getType()))
                .orElseGet(() -> {
                    log.error("Tenant not found in DB: {}", tenantId);
                    return true; // 테넌트 정보가 없으면 안전하게 차단
                });
    }

    @GetMapping("/templates")
    public ResponseEntity<List<CatalogTemplateResponse>> getTemplates(@AuthenticationPrincipal Member currentMember) {
        if (isCustomerTenant(currentMember)) {
            log.warn("Access denied for customer tenant user: {}", currentMember.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<ServiceCatalog> templates = serviceCatalogRepository.findAllByIsTemplateTrue();
        List<CatalogTemplateResponse> response = templates.stream()
                .map(t -> CatalogTemplateResponse.builder()
                        .id(t.getId())
                        .name(t.getName())
                        .description(t.getDescription())
                        .icon(t.getIcon())
                        .categoryCode(t.getCategoryCode())
                        .jsonSchema(t.getJsonSchema())
                        .approvalRequired(t.isApprovalRequired())
                        .isTemplate(t.isTemplate())
                        .build())
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/templates")
    public ResponseEntity<ServiceCatalog> createTemplate(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody CatalogCreateRequest request) {
        
        if (isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ServiceCatalog template = ServiceCatalog.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .jsonSchema(request.getJsonSchema())
                .approvalRequired(request.isApprovalRequired())
                .categoryCode(request.getCategoryCode())
                .tenant(currentMember.getTenant())
                .isTemplate(true)
                .build();

        return ResponseEntity.ok(serviceCatalogRepository.save(template));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ServiceCatalog> updateTemplate(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long id,
            @RequestBody CatalogCreateRequest request) {

        if (isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ServiceCatalog template = serviceCatalogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        if (!template.isTemplate()) {
            throw new IllegalArgumentException("Target is not a template");
        }

        template.update(request.getName(), request.getDescription(), request.getIcon(), request.getJsonSchema(), request.isApprovalRequired(), request.getCategoryCode());
        
        return ResponseEntity.ok(serviceCatalogRepository.save(template));
    }

    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long id) {

        if (isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        ServiceCatalog template = serviceCatalogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Template not found"));

        if (!template.isTemplate()) {
            throw new IllegalArgumentException("Only templates can be deleted via this endpoint");
        }

        serviceCatalogRepository.delete(template);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/templates/{templateId}/deployments")
    public ResponseEntity<List<String>> getDeployments(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long templateId) {
        
        if (isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        List<ServiceCatalog> deployments = serviceCatalogRepository.findAllByTemplateSourceId(templateId);
        List<String> deployedTenantIds = deployments.stream()
                .map(d -> d.getTenant().getTenantId())
                .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(deployedTenantIds);
    }

    @PostMapping("/deploy")
    public ResponseEntity<Void> deployToTenant(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody CatalogDeployRequest request) {
        
        if (isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        catalogDeploymentService.syncDeployments(request.getTemplateId(), request.getTargetTenantIds());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CatalogCategory>> getCategories(@AuthenticationPrincipal Member currentMember) {
        return ResponseEntity.ok(catalogCategoryRepository.findAllByTenant(currentMember.getTenant()));
    }

    @PostMapping("/categories")
    public ResponseEntity<CatalogCategory> createCategory(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody CategoryRequest request) {
        
        CatalogCategory category = CatalogCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .tenant(currentMember.getTenant())
                .isTemplate(!isCustomerTenant(currentMember))
                .build();

        return ResponseEntity.ok(catalogCategoryRepository.save(category));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<CatalogCategory> updateCategory(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long id,
            @RequestBody CategoryRequest request) {

        CatalogCategory category = catalogCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        // Only MSP/Operator can edit global templates categories
        if (category.isTemplate() && isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        category.update(request.getName(), request.getDescription(), request.getIcon());
        return ResponseEntity.ok(catalogCategoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long id) {

        CatalogCategory category = catalogCategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        if (category.isTemplate() && isCustomerTenant(currentMember)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Dependency check
        if (serviceCatalogRepository.countByCategory(category) > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        catalogCategoryRepository.delete(category);
        return ResponseEntity.ok().build();
    }

    @lombok.Data
    public static class CatalogCreateRequest {
        private String name;
        private String description;
        private String icon;
        private String jsonSchema;
        private boolean approvalRequired;
        private String categoryCode;
    }

    @lombok.Data
    public static class CatalogDeployRequest {
        private Long templateId;
        private List<String> targetTenantIds;
    }

    @lombok.Builder
    @lombok.Getter
    public static class CatalogTemplateResponse {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private String categoryCode;
        private String jsonSchema;
        private boolean approvalRequired;
        private boolean isTemplate;
    }

    @lombok.Data
    public static class CategoryRequest {
        private String name;
        private String description;
        private String icon;
    }
}
