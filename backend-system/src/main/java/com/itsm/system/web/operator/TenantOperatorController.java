package com.itsm.system.web.operator;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.tenant.TenantDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/operator/tenants")
@RequiredArgsConstructor
public class TenantOperatorController {

    private final TenantRepository tenantRepository;

    @GetMapping
    public ResponseEntity<?> getAllTenants(@AuthenticationPrincipal Member currentMember) {
        if (!"MSP_CORE".equals(currentMember.getTenant().getTenantId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only MSP operators can list tenants");
        }

        List<TenantDTO> tenants = tenantRepository.findAll().stream()
                .filter(t -> !"MSP_CORE".equals(t.getTenantId()))
                .map(t -> TenantDTO.builder()
                        .tenantId(t.getTenantId())
                        .name(t.getName())
                        .brandColor(t.getBrandColor())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(tenants);
    }
}
