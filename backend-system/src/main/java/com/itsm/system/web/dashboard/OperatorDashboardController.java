package com.itsm.system.web.dashboard;

import com.itsm.system.domain.member.Member;
import com.itsm.system.dto.dashboard.OperatorDashboardDTO;
import com.itsm.system.service.dashboard.OperatorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/operator/dashboard")
@RequiredArgsConstructor
public class OperatorDashboardController {

    private final OperatorDashboardService operatorDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<OperatorDashboardDTO> getSummary(
            @AuthenticationPrincipal Member currentMember,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(operatorDashboardService.getOperatorDashboardSummary(Objects.requireNonNull(currentMember), startDate, endDate));
    }
}
