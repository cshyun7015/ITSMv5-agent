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
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/operator/dashboard")
@RequiredArgsConstructor
public class OperatorDashboardController {

    private final OperatorDashboardService operatorDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal Member currentMember) {
        try {
            OperatorDashboardDTO summary = operatorDashboardService.getOperatorDashboardSummary(Objects.requireNonNull(currentMember));
            return ResponseEntity.ok(summary);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
