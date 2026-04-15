package com.itsm.system.web.catalog;

import com.itsm.system.domain.catalog.CatalogCategory;
import com.itsm.system.domain.catalog.CatalogCategoryRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.service.catalog.CatalogDeploymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operator/catalog")
@RequiredArgsConstructor
public class OperatorCatalogController {

    private final ServiceCatalogRepository serviceCatalogRepository;
    private final CatalogCategoryRepository catalogCategoryRepository;
    private final CatalogDeploymentService catalogDeploymentService;
    private final TenantRepository tenantRepository;

    @GetMapping("/templates")
    public ResponseEntity<List<ServiceCatalog>> getTemplates(@AuthenticationPrincipal Member currentMember) {
        if (!"MSP_CORE".equals(currentMember.getTenant().getTenantId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(serviceCatalogRepository.findAllByIsTemplateTrue());
    }

    @PostMapping("/templates")
    public ResponseEntity<ServiceCatalog> createTemplate(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody CatalogCreateRequest request) {
        
        if (!"MSP_CORE".equals(currentMember.getTenant().getTenantId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CatalogCategory category = catalogCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));

        ServiceCatalog template = ServiceCatalog.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .jsonSchema(request.getJsonSchema())
                .approvalRequired(request.isApprovalRequired())
                .category(category)
                .tenant(currentMember.getTenant())
                .isTemplate(true)
                .build();

        return ResponseEntity.ok(serviceCatalogRepository.save(template));
    }

    @PostMapping("/deploy")
    public ResponseEntity<Void> deployToTenant(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody DeployRequest request) {
        
        if (!"MSP_CORE".equals(currentMember.getTenant().getTenantId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Tenant targetTenant = tenantRepository.findById(request.getTargetTenantId())
                .orElseThrow(() -> new IllegalArgumentException("Target tenant not found"));

        catalogDeploymentService.deployTemplate(request.getTemplateId(), targetTenant);
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
                .isTemplate("MSP_CORE".equals(currentMember.getTenant().getTenantId()))
                .build();

        return ResponseEntity.ok(catalogCategoryRepository.save(category));
    }

    @lombok.Data
    public static class CatalogCreateRequest {
        private String name;
        private String description;
        private String icon;
        private String jsonSchema;
        private boolean approvalRequired;
        private Long categoryId;
    }

    @lombok.Data
    public static class DeployRequest {
        private Long templateId;
        private String targetTenantId;
    }

    @lombok.Data
    public static class CategoryRequest {
        private String name;
        private String description;
        private String icon;
    }
}
