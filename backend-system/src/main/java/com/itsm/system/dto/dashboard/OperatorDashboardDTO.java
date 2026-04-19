package com.itsm.system.dto.dashboard;

import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class OperatorDashboardDTO {
    
    private long totalTenants;
    private long totalCatalogs;
    private long totalActiveIncidents;
    private long totalActiveRequests;
    private long totalActiveChanges;
    private long totalActiveCIs;
    
    // Priority Breakdown
    private long priorityP1Count;
    private long priorityP2Count;
    private long priorityP3Count;
    private long priorityP4Count;
    
    // SLA Risk (e.g., within 1 hour of breach)
    private long slaRiskCount;
    
    private List<TenantSummary> tenantSummaries;
    private List<RecentActivity> recentActivities;

    @Getter
    @Builder
    public static class TenantSummary {
        private String tenantId;
        private String tenantName;
        private String serviceStatus; // GREEN, YELLOW, RED
        private long incidentCount;
        private String brandColor;
    }

    @Getter
    @Builder
    public static class RecentActivity {
        private String timestamp;
        private String type; // INCIDENT_NEW, STATUS_CHANGE, SLA_WARNING
        private String message;
        private String tenantId;
    }
}
