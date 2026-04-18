package com.itsm.system.service.incident;

import com.itsm.system.domain.incident.*;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.repository.incident.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final TenantRepository tenantRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public Incident reportIncident(String tenantId, String title, String description, 
                                   IncidentImpact impact, IncidentUrgency urgency, 
                                   String category, Long reporterId, String source) {
        
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
                .build();

        incident.calculatePriority();
        return incidentRepository.save(incident);
    }

    @Transactional
    public void assignSpecialist(Long incidentId, Long specialistId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        Member specialist = memberRepository.findById(specialistId)
                .orElseThrow(() -> new IllegalArgumentException("Specialist not found"));
        
        incident.assign(specialist);
    }

    @Transactional
    public void resolveIncident(Long incidentId, String resolution) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        incident.resolve(resolution);
    }

    @Transactional(readOnly = true)
    public List<Incident> listAllIncidents() {
        return incidentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Incident getIncident(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
    }

    @Transactional
    public Incident updateIncident(Long id, String title, String description, 
                                   IncidentImpact impact, IncidentUrgency urgency, 
                                   String category) {
        Incident incident = getIncident(id);
        incident.update(title, description, impact, urgency, category);
        return incidentRepository.save(incident);
    }

    @Transactional
    public void deleteIncident(Long id) {
        Incident incident = getIncident(id);
        incidentRepository.delete(incident);
    }
}
