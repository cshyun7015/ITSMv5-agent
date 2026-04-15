package com.itsm.system.dto.dashboard;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class OperatorDashboardDTO {
    
    private long totalActiveIncidents;
    private long totalPendingRequests;
    private long slaRiskCount; // Deadline within 2 hours
    
    private List<TenantSummary> tenantSummaries;

    @Getter
    @Builder
    public static class TenantSummary {
        private String tenantId;
        private String tenantName;
        private String serviceStatus; // GREEN, YELLOW, RED
        private long incidentCount;
        private String brandColor;
    }
}
