package com.itsm.system.service.dashboard;

import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.incident.IncidentPriority;
import com.itsm.system.domain.incident.IncidentStatus;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.request.ServiceRequest;
import com.itsm.system.domain.request.ServiceRequestRepository;
import com.itsm.system.domain.request.ServiceRequestStatus;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.domain.tenant.TenantRelationRepository;
import com.itsm.system.domain.tenant.TenantRelation;
import com.itsm.system.dto.dashboard.OperatorDashboardDTO;
import com.itsm.system.repository.incident.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OperatorDashboardService {

    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final TenantRepository tenantRepository;
    private final TenantRelationRepository tenantRelationRepository;

    @Transactional(readOnly = true)
    public OperatorDashboardDTO getOperatorDashboardSummary(@NonNull Member currentMember) {
        if (currentMember.getTenant() == null) {
            throw new IllegalArgumentException("Tenant information missing for member");
        }
        String tenantId = Objects.requireNonNull(currentMember.getTenant().getTenantId(), "Tenant ID must not be null");
        Tenant currentTenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        // 권한 체크: MSP 또는 운영사 소속 사용자만 접근 가능
        String currentTenantType = currentTenant.getType();
        if (!"MSP".equals(currentTenantType) && !"OPERATOR".equals(currentTenantType)) {
            throw new org.springframework.security.access.AccessDeniedException("Only MSP or Operators can access this dashboard");
        }

        String currentTenantId = currentTenant.getTenantId();

        List<Tenant> managedTenants;
        if ("MSP".equals(currentTenantType)) {
            // MSP 관리자는 모든 테넌트 조회 (본인 제외)
            managedTenants = tenantRepository.findAll().stream()
                    .filter(t -> !"OPER_MSP".equals(t.getTenantId()))
                    .collect(Collectors.toList());
        } else {
            // 개별 운영사는 본인이 관리하는 테넌트만 조회
            managedTenants = tenantRelationRepository.findByOperator_TenantId(currentTenantId).stream()
                    .map(TenantRelation::getCustomer)
                    .collect(Collectors.toList());
        }

        List<String> managedTenantIds = managedTenants.stream()
                .map(Tenant::getTenantId)
                .collect(Collectors.toList());

        List<Incident> allIncidents = incidentRepository.findAll().stream()
                .filter(i -> managedTenantIds.contains(i.getTenant().getTenantId()))
                .collect(Collectors.toList());
                
        List<ServiceRequest> allRequests = serviceRequestRepository.findAll().stream()
                .filter(sr -> managedTenantIds.contains(sr.getTenant().getTenantId()))
                .collect(Collectors.toList());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime slaRiskLimit = now.plusHours(2);

        // 1. Metrics for Managed Tenants
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
        List<OperatorDashboardDTO.TenantSummary> tenantSummaries = managedTenants.stream()
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
