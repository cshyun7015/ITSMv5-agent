package com.itsm.system.web.dashboard;

import com.itsm.system.domain.member.Member;
import com.itsm.system.dto.dashboard.OperatorDashboardDTO;
import com.itsm.system.service.dashboard.OperatorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operator/dashboard")
@RequiredArgsConstructor
public class OperatorDashboardController {

    private final OperatorDashboardService operatorDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal Member currentMember) {
        // 권한 체크: MSP_CORE 소속 운영자만 접근 가능
        if (!"MSP_CORE".equals(currentMember.getTenant().getTenantId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied for this tenant");
        }
        
        OperatorDashboardDTO summary = operatorDashboardService.getOperatorDashboardSummary();
        return ResponseEntity.ok(summary);
    }
}
