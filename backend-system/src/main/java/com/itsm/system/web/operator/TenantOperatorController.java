package com.itsm.system.web.operator;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.domain.tenant.TenantRelationRepository;
import com.itsm.system.dto.member.MemberDTO;
import com.itsm.system.dto.tenant.TenantDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/operator/tenants")
@RequiredArgsConstructor
public class TenantOperatorController {

    private final TenantRepository tenantRepository;
    private final TenantRelationRepository tenantRelationRepository;
    private final MemberRepository memberRepository;

    @GetMapping
    public ResponseEntity<?> getAllTenants(@AuthenticationPrincipal Member currentMember) {
        String tenantId = currentMember.getTenant().getTenantId();
        Tenant currentTenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        String type = currentTenant.getType();
        
        List<Tenant> managedTenants;
        if ("MSP".equals(type)) {
            // MSP 관리자는 모든 테넌트 조회 (본인 제외)
            managedTenants = tenantRepository.findAll().stream()
                    .filter(t -> !"OPER_MSP".equals(t.getTenantId()))
                    .collect(Collectors.toList());
        } else if ("OPERATOR".equals(type)) {
            // 개별 운영사는 본인이 관리하는 테넌트만 조회
            managedTenants = tenantRelationRepository.findByOperator_TenantId(tenantId).stream()
                    .map(com.itsm.system.domain.tenant.TenantRelation::getCustomer)
                    .collect(Collectors.toList());
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only MSP or Operators can list tenants");
        }

        List<TenantDTO> tenantDTOs = managedTenants.stream()
                .map(t -> TenantDTO.builder()
                        .tenantId(t.getTenantId())
                        .name(t.getName())
                        .brandColor(t.getBrandColor())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(tenantDTOs);
    }

    @GetMapping("/{targetTenantId}/users")
    public ResponseEntity<?> getTenantUsers(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable String targetTenantId) {
        
        // 보안 검증: 현재 사용자가 대상 테넌트에 대한 관리 권한이 있는지 확인
        String currentTenantId = currentMember.getTenant().getTenantId();
        Tenant currentTenant = tenantRepository.findById(currentTenantId).orElseThrow();
        
        boolean hasAccess = false;
        if ("MSP".equals(currentTenant.getType())) {
            hasAccess = true;
        } else if ("OPERATOR".equals(currentTenant.getType())) {
            hasAccess = tenantRelationRepository.findByOperator_TenantId(currentTenantId).stream()
                    .anyMatch(rel -> rel.getCustomer().getTenantId().equals(targetTenantId));
        }

        if (!hasAccess && !currentTenantId.equals(targetTenantId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have access to this tenant's users");
        }

        List<MemberDTO.Response> users = memberRepository.findAll().stream()
                .filter(m -> m.getTenant().getTenantId().equals(targetTenantId))
                .map(MemberDTO.Response::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }
}
