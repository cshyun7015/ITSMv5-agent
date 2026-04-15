package com.itsm.system.dto.dashboard;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DashboardDTO {
    
    // 서비스 건강 상태 (GREEN, YELLOW, RED)
    private String serviceStatus;
    
    // 서비스 가용성 (%)
    private double availability;
    
    // 인시던트 통계
    private long activeIncidents;
    private long highPriorityIncidents;
    private long resolvedIncidentsThisMonth;
    
    // 서비스 요청 통계
    private long pendingApprovals;
    private long inProgressRequests;
    private long completedRequestsThisMonth;
    
    // 테넌트 브랜딩 정보
    private String logoUrl;
    private String brandColor;
}
