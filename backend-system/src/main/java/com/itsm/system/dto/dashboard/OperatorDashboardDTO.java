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
