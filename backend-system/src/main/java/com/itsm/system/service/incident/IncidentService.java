package com.itsm.system.service.incident;

import com.itsm.system.domain.incident.*;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.repository.incident.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final TenantRepository tenantRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public Incident reportIncident(@NonNull String tenantId, @NonNull String title, @NonNull String description, 
                                   @NonNull IncidentImpact impact, @NonNull IncidentUrgency urgency, 
                                   @NonNull String category, @NonNull Long reporterId, @NonNull String source,
                                   boolean isMajor, String affectedService) {
        
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        Member reporter = memberRepository.findById(reporterId)
                .orElseThrow(() -> new IllegalArgumentException("Reporter not found"));

        Incident incident = Incident.builder()
                .tenant(tenant)
                .title(title)
                .description(description)
                .impact(impact)
                .urgency(urgency)
                .category(category)
                .reporter(reporter)
                .source(source)
                .isMajor(isMajor)
                .affectedService(affectedService)
                .build();

        incident.calculatePriority();
        return incidentRepository.save(incident);
    }

    @Transactional
    public void assignSpecialist(@NonNull Long incidentId, @NonNull Long specialistId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        Member specialist = memberRepository.findById(specialistId)
                .orElseThrow(() -> new IllegalArgumentException("Specialist not found"));
        
        incident.assign(specialist);
    }

    @Transactional
    public void resolveIncident(@NonNull Long incidentId, @NonNull String resolution) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        incident.resolve(resolution);
    }

    @Transactional(readOnly = true)
    public List<Incident> listAllIncidents() {
        return incidentRepository.findAll();
    }

    @Transactional(readOnly = true)
    @NonNull
    public Incident getIncident(@NonNull Long id) {
        return Objects.requireNonNull(incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found")));
    }

    @Transactional
    public Incident updateIncident(@NonNull Long id, @NonNull String title, @NonNull String description, 
                                   @NonNull IncidentImpact impact, @NonNull IncidentUrgency urgency, 
                                   @NonNull String category, boolean isMajor, String affectedService,
                                   @NonNull IncidentStatus status, Long assigneeId, String resolution) {
        Incident incident = getIncident(id);
        
        Member assignee = null;
        if (assigneeId != null) {
            assignee = memberRepository.findById(assigneeId)
                    .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));
        } else if (status != IncidentStatus.NEW) {
            // ASSIGNED, IN_PROGRESS, RESOLVED, CLOSED statuses require an assignee
            throw new IllegalArgumentException("Assignee is required for status: " + status);
        }

        if ((status == IncidentStatus.RESOLVED || status == IncidentStatus.CLOSED) && 
            (resolution == null || resolution.trim().isEmpty())) {
            throw new IllegalArgumentException("Resolution is required when resolving or closing an incident");
        }
        
        incident.update(title, description, impact, urgency, category, isMajor, affectedService, status, assignee, resolution);
        return incidentRepository.save(incident);
    }

    @Transactional
    public void deleteIncident(@NonNull Long id) {
        Incident incident = getIncident(id);
        incidentRepository.delete(incident);
    }
}
