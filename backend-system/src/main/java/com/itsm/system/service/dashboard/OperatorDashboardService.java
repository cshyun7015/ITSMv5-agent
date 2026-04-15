package com.itsm.system.service.dashboard;

import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.incident.IncidentPriority;
import com.itsm.system.domain.incident.IncidentStatus;
import com.itsm.system.domain.request.ServiceRequest;
import com.itsm.system.domain.request.ServiceRequestRepository;
import com.itsm.system.domain.request.ServiceRequestStatus;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.dashboard.OperatorDashboardDTO;
import com.itsm.system.repository.incident.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperatorDashboardService {

    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public OperatorDashboardDTO getOperatorDashboardSummary() {
        List<Incident> allIncidents = incidentRepository.findAll();
        List<ServiceRequest> allRequests = serviceRequestRepository.findAll();
        List<Tenant> allTenants = tenantRepository.findAll().stream()
                .filter(t -> !"MSP_CORE".equals(t.getTenantId()))
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime slaRiskLimit = now.plusHours(2);

        // 1. Global Metrics
        long activeIncidents = allIncidents.stream()
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                .count();

        long pendingRequests = allRequests.stream()
                .filter(sr -> sr.getStatus() != ServiceRequestStatus.RESOLVED && sr.getStatus() != ServiceRequestStatus.CLOSED)
                .count();

        long slaRiskCount = allIncidents.stream()
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                .filter(i -> i.getSlaDeadline() != null && i.getSlaDeadline().isBefore(slaRiskLimit))
                .count();

        // 2. Tenant Summaries
        List<OperatorDashboardDTO.TenantSummary> tenantSummaries = allTenants.stream()
                .map(tenant -> {
                    List<Incident> tenantIncidents = allIncidents.stream()
                            .filter(i -> i.getTenant().getTenantId().equals(tenant.getTenantId()))
                            .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                            .collect(Collectors.toList());

                    String status = "GREEN";
                    if (tenantIncidents.stream().anyMatch(i -> i.getPriority() == IncidentPriority.P1)) {
                        status = "RED";
                    } else if (tenantIncidents.stream().anyMatch(i -> i.getPriority() == IncidentPriority.P2)) {
                        status = "YELLOW";
                    }

                    return OperatorDashboardDTO.TenantSummary.builder()
                            .tenantId(tenant.getTenantId())
                            .tenantName(tenant.getName())
                            .serviceStatus(status)
                            .incidentCount(tenantIncidents.size())
                            .brandColor(tenant.getBrandColor())
                            .build();
                })
                .collect(Collectors.toList());

        return OperatorDashboardDTO.builder()
                .totalActiveIncidents(activeIncidents)
                .totalPendingRequests(pendingRequests)
                .slaRiskCount(slaRiskCount)
                .tenantSummaries(tenantSummaries)
                .build();
    }
}
