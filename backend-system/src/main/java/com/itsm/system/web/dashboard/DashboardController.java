package com.itsm.system.web.dashboard;

import com.itsm.system.domain.member.Member;
import com.itsm.system.dto.dashboard.DashboardDTO;
import com.itsm.system.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardDTO> getSummary(@AuthenticationPrincipal Member currentMember) {
        String tenantId = currentMember.getTenant().getTenantId();
        DashboardDTO summary = dashboardService.getDashboardSummary(tenantId);
        return ResponseEntity.ok(summary);
    }
}
