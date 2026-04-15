package com.itsm.system.web.catalog;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.service.catalog.CatalogDeploymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
public class TenantCatalogController {

    private final CatalogDeploymentService catalogDeploymentService;

    @GetMapping
    public ResponseEntity<List<CatalogResponse>> getMyCatalog(@AuthenticationPrincipal Member currentMember) {
        List<ServiceCatalog> catalog = catalogDeploymentService.getCatalogForTenant(currentMember.getTenant());
        
        List<CatalogResponse> response = catalog.stream()
                .map(c -> CatalogResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .description(c.getDescription())
                        .icon(c.getIcon())
                        .categoryName(c.getCategory().getName())
                        .jsonSchema(c.getJsonSchema())
                        .approvalRequired(c.isApprovalRequired())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @lombok.Builder
    @lombok.Getter
    public static class CatalogResponse {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private String categoryName;
        private String jsonSchema;
        private boolean approvalRequired;
    }
}
