package com.itsm.system.service.dashboard;

import com.itsm.system.domain.incident.IncidentPriority;
import com.itsm.system.domain.incident.IncidentStatus;
import com.itsm.system.domain.request.ServiceRequestStatus;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.dashboard.DashboardDTO;
import com.itsm.system.repository.incident.IncidentRepository;
import com.itsm.system.domain.request.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final TenantRepository tenantRepository;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardSummary(String tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        // 1. 인시던트 집계
        long activeIncidents = incidentRepository.findAll().stream()
                .filter(i -> i.getTenant().getTenantId().equals(tenantId))
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                .count();

        long p1Incidents = incidentRepository.findAll().stream()
                .filter(i -> i.getTenant().getTenantId().equals(tenantId))
                .filter(i -> i.getPriority() == IncidentPriority.P1)
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                .count();

        long p2Incidents = incidentRepository.findAll().stream()
                .filter(i -> i.getTenant().getTenantId().equals(tenantId))
                .filter(i -> i.getPriority() == IncidentPriority.P2)
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                .count();

        // 2. 서비스 요청 집계
        long pendingApprovals = serviceRequestRepository.findAll().stream()
                .filter(sr -> sr.getTenant().getTenantId().equals(tenantId))
                .filter(sr -> sr.getStatus() == ServiceRequestStatus.PENDING_APPROVAL)
                .count();

        long inProgress = serviceRequestRepository.findAll().stream()
                .filter(sr -> sr.getTenant().getTenantId().equals(tenantId))
                .filter(sr -> sr.getStatus() == ServiceRequestStatus.IN_PROGRESS || sr.getStatus() == ServiceRequestStatus.OPEN)
                .count();

        // 3. 건강 상태 (Traffic Light)
        String serviceStatus = "GREEN";
        if (p1Incidents > 0) {
            serviceStatus = "RED";
        } else if (p2Incidents > 0) {
            serviceStatus = "YELLOW";
        }

        // 4. 가용성 계산 (임시 로직: P1 장애가 없으면 99.9%, 있으면 장애 비중에 따라 하락)
        double availability = 99.99;
        if (p1Incidents > 0) {
            availability = Math.max(90.0, 99.99 - (p1Incidents * 1.5));
        }

        return DashboardDTO.builder()
                .serviceStatus(serviceStatus)
                .availability(availability)
                .activeIncidents(activeIncidents)
                .highPriorityIncidents(p1Incidents + p2Incidents)
                .pendingApprovals(pendingApprovals)
                .inProgressRequests(inProgress)
                .logoUrl(tenant.getLogoUrl())
                .brandColor(tenant.getBrandColor())
                .build();
    }
}
