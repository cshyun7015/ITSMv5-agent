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
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.change.ChangeRequestRepository;
import com.itsm.system.domain.cmdb.ConfigurationItemRepository;
import com.itsm.system.domain.incident.IncidentHistoryRepository;
import com.itsm.system.domain.incident.IncidentHistory;
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
    private final IncidentHistoryRepository incidentHistoryRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final TenantRepository tenantRepository;
    private final TenantRelationRepository tenantRelationRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final ChangeRequestRepository changeRequestRepository;
    private final ConfigurationItemRepository configurationItemRepository;

    @Transactional(readOnly = true)
    public OperatorDashboardDTO getOperatorDashboardSummary(
            @NonNull Member currentMember, 
            LocalDateTime startDate, 
            LocalDateTime endDate) {
        
        if (currentMember.getTenant() == null) {
            throw new IllegalArgumentException("Tenant information missing for member");
        }
        String tenantId = Objects.requireNonNull(currentMember.getTenant().getTenantId(), "Tenant ID must not be null");
        Tenant currentTenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + tenantId));

        // Authority Check
        String currentTenantType = currentTenant.getType();
        if (!"MSP".equals(currentTenantType) && !"OPERATOR".equals(currentTenantType)) {
            throw new org.springframework.security.access.AccessDeniedException("Only MSP or Operators can access this dashboard");
        }

        String currentTenantId = currentTenant.getTenantId();

        List<Tenant> managedTenants;
        if ("MSP".equals(currentTenantType)) {
            managedTenants = tenantRepository.findAll().stream()
                    .filter(t -> !"OPER_MSP".equals(t.getTenantId()))
                    .collect(Collectors.toList());
        } else {
            managedTenants = tenantRelationRepository.findByOperator_TenantId(currentTenantId).stream()
                    .map(TenantRelation::getCustomer)
                    .collect(Collectors.toList());
        }

        List<String> managedTenantIds = managedTenants.stream()
                .map(Tenant::getTenantId)
                .collect(Collectors.toList());

        // Baseline datasets
        List<Incident> allIncidents = incidentRepository.findAll().stream()
                .filter(i -> i.getTenant() != null && managedTenantIds.contains(i.getTenant().getTenantId()))
                .collect(Collectors.toList());

        // Global CI Distribution (Customer Tenants ONLY)
        java.util.Map<String, Long> ciDistribution = configurationItemRepository.findAll().stream()
                .filter(ci -> ci.getTenant() != null && managedTenantIds.contains(ci.getTenant().getTenantId()))
                .filter(ci -> !ci.getIsDeleted())
                .collect(Collectors.groupingBy(com.itsm.system.domain.cmdb.ConfigurationItem::getTypeCode, Collectors.counting()));
        
        List<Incident> activeIncidentsList = allIncidents.stream()
                .filter(i -> i.getStatus() != IncidentStatus.RESOLVED && i.getStatus() != IncidentStatus.CLOSED)
                .collect(Collectors.toList());
                
        List<ServiceRequest> allRequests = serviceRequestRepository.findAll().stream()
                .filter(sr -> managedTenantIds.contains(sr.getTenant().getTenantId()))
                .collect(Collectors.toList());

        // 1. Core Metrics
        long totalTenants = managedTenants.size();
        long totalCatalogs = serviceCatalogRepository.countByIsTemplateTrue();
        long activeIncidents = activeIncidentsList.size();

        long activeRequests = allRequests.stream()
                .filter(sr -> sr.getStatus() != ServiceRequestStatus.RESOLVED && sr.getStatus() != ServiceRequestStatus.CLOSED)
                .count();

        long activeChanges = changeRequestRepository.findAll().stream()
                .filter(cr -> managedTenantIds.contains(cr.getTenant().getTenantId()))
                .filter(cr -> !"CLOSED".equals(cr.getStatusCode()) && !"REJECTED".equals(cr.getStatusCode()))
                .count();

        long activeCIs = configurationItemRepository.findAll().stream()
                .filter(ci -> ci.getTenant() != null && managedTenantIds.contains(ci.getTenant().getTenantId()))
                .filter(ci -> !ci.getIsDeleted())
                .filter(ci -> "ACTIVE".equals(ci.getStatusCode()))
                .count();

        // 2. Priority Breakdown & SLA Risk
        long p1Count = activeIncidentsList.stream().filter(i -> i.getPriority() == IncidentPriority.P1).count();
        long p2Count = activeIncidentsList.stream().filter(i -> i.getPriority() == IncidentPriority.P2).count();
        long p3Count = activeIncidentsList.stream().filter(i -> i.getPriority() == IncidentPriority.P3).count();
        long p4Count = activeIncidentsList.stream().filter(i -> i.getPriority() == IncidentPriority.P4).count();

        LocalDateTime slaThreshold = LocalDateTime.now().plusHours(1);
        long slaRiskCount = activeIncidentsList.stream()
                .filter(i -> i.getSlaDeadline() != null && i.getSlaDeadline().isBefore(slaThreshold))
                .count();

        // 3. Tenant Summaries (with dynamic MTTR/SLA)
        List<OperatorDashboardDTO.TenantSummary> tenantSummaries = managedTenants.stream()
                .map(tenant -> {
                    List<Incident> tenantIncidents = activeIncidentsList.stream()
                            .filter(i -> i.getTenant().getTenantId().equals(tenant.getTenantId()))
                            .collect(Collectors.toList());

                    // Period-based Performance Analysis
                    List<Incident> resolvedInPeriod = allIncidents.stream()
                            .filter(i -> i.getTenant().getTenantId().equals(tenant.getTenantId()))
                            .filter(i -> i.getStatus() == IncidentStatus.RESOLVED || i.getStatus() == IncidentStatus.CLOSED)
                            .filter(i -> i.getResolvedAt() != null)
                            .filter(i -> (startDate == null || !i.getResolvedAt().isBefore(startDate)) && 
                                         (endDate == null || !i.getResolvedAt().isAfter(endDate)))
                            .collect(Collectors.toList());

                    long mttr = 0;
                    double slaRate = 100.0;

                    if (!resolvedInPeriod.isEmpty()) {
                        long totalMinutes = resolvedInPeriod.stream()
                                .mapToLong(i -> java.time.Duration.between(i.getCreatedAt(), i.getResolvedAt()).toMinutes())
                                .sum();
                        mttr = totalMinutes / resolvedInPeriod.size();

                        long compliantCount = resolvedInPeriod.stream()
                                .filter(i -> i.getSlaDeadline() == null || !i.getResolvedAt().isAfter(i.getSlaDeadline()))
                                .count();
                        slaRate = (compliantCount * 100.0) / resolvedInPeriod.size();
                    }

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
                            .mttr(mttr)
                            .slaComplianceRate(Math.round(slaRate * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());

        // 4. Activity Feed
        List<OperatorDashboardDTO.RecentActivity> recentActivities = incidentHistoryRepository.findTop15ByIncidentInOrderByCreatedAtDesc(allIncidents).stream()
                .map(h -> {
                    String type = "ACTIVITY";
                    String message = String.format("[%s] %s: %s", h.getIncident().getTitle(), h.getType(), h.getNote());
                    
                    if (h.getType() == IncidentHistory.HistoryType.STATUS_CHANGE) {
                        type = "STATUS_CHANGE";
                        message = String.format("[%s] Status change: %s -> %s", h.getIncident().getTitle(), h.getOldValue(), h.getNewValue());
                    }

                    return OperatorDashboardDTO.RecentActivity.builder()
                        .timestamp(h.getCreatedAt().toString())
                        .type(type)
                        .message(message)
                        .tenantId(h.getIncident().getTenant().getTenantId())
                        .build();
                })
                .collect(Collectors.toList());

        return OperatorDashboardDTO.builder()
                .ciDistribution(ciDistribution)
                .totalTenants(totalTenants)
                .totalCatalogs(totalCatalogs)
                .totalActiveIncidents(activeIncidents)
                .totalActiveRequests(activeRequests)
                .totalActiveChanges(activeChanges)
                .totalActiveCIs(activeCIs)
                .priorityP1Count(p1Count)
                .priorityP2Count(p2Count)
                .priorityP3Count(p3Count)
                .priorityP4Count(p4Count)
                .slaRiskCount(slaRiskCount)
                .tenantSummaries(tenantSummaries)
                .recentActivities(recentActivities)
                .build();
    }
}
