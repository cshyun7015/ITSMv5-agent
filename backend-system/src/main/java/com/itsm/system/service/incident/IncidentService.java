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
import com.itsm.system.dto.incident.IncidentDTO;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final TenantRepository tenantRepository;
    private final MemberRepository memberRepository;
    private final IncidentHistoryRepository incidentHistoryRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public IncidentDTO.Response reportIncident(@NonNull String tenantId, @NonNull String title, @NonNull String description, 
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
        Incident savedIncident = incidentRepository.save(incident);

        // Initial history log
        logHistory(savedIncident, reporter, IncidentHistory.HistoryType.SYSTEM_LOG, 
                "Incident created via " + source, null, IncidentStatus.NEW.name());
        
        return convertToResponse(savedIncident);
    }

    @Transactional
    public void assignSpecialist(@NonNull Long incidentId, @NonNull Long specialistId, @NonNull Long authorId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        Member specialist = memberRepository.findById(specialistId)
                .orElseThrow(() -> new IllegalArgumentException("Specialist not found"));
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
        
        String oldAssignee = incident.getAssignee() != null ? incident.getAssignee().getUsername() : "Unassigned";
        incident.assign(specialist);
        incidentRepository.saveAndFlush(incident);
        
        logHistory(incident, author, IncidentHistory.HistoryType.STATUS_CHANGE, 
                "Incident status changed to ASSIGNED", "NEW", "ASSIGNED");
        
        logHistory(incident, author, IncidentHistory.HistoryType.ASSIGNMENT, 
                "Incident assigned to " + specialist.getUsername(), oldAssignee, specialist.getUsername());
    }

    @Transactional
    public void resolveIncident(@NonNull Long incidentId, @NonNull String resolution, @NonNull Long authorId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found"));
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
        
        IncidentStatus oldStatus = incident.getStatus();
        incident.resolve(resolution);
        incidentRepository.saveAndFlush(incident);
        
        logHistory(incident, author, IncidentHistory.HistoryType.STATUS_CHANGE, 
                "Incident resolved: " + resolution, oldStatus.name(), IncidentStatus.RESOLVED.name());
    }

    @Transactional(readOnly = true)
    public List<IncidentDTO.Response> listAllIncidents() {
        return incidentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public IncidentDTO.Response getIncidentResponse(@NonNull Long id) {
        Incident incident = getIncident(id);
        // Force refresh to bypass any Hibernate session caching (L1/OSIV)
        entityManager.refresh(incident);
        System.out.println("[DEBUG_FINAL] Status before response for IncidentID " + id + ": " + incident.getStatus());
        return convertToResponse(incident);
    }

    @Transactional(readOnly = true)
    @NonNull
    public Incident getIncident(@NonNull Long id) {
        return Objects.requireNonNull(incidentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Incident not found")));
    }

    @Transactional
    public IncidentDTO.Response updateIncident(@NonNull Long id, @NonNull String title, @NonNull String description, 
                                   @NonNull IncidentImpact impact, @NonNull IncidentUrgency urgency, 
                                   @NonNull String category, boolean isMajor, String affectedService,
                                   @NonNull IncidentStatus status, Long assigneeId, String resolution,
                                   @NonNull Long authorId) {
        Incident incident = getIncident(id);
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
        
        IncidentStatus oldStatus = incident.getStatus();
        Member oldAssignee = incident.getAssignee();
        
        Member assignee = null;
        if (assigneeId != null) {
            assignee = memberRepository.findById(assigneeId)
                    .orElseThrow(() -> new IllegalArgumentException("Assignee not found"));
        } else if (status != IncidentStatus.NEW) {
            throw new IllegalArgumentException("Assignee is required for status: " + status);
        }

        if ((status == IncidentStatus.RESOLVED || status == IncidentStatus.CLOSED) && 
            (resolution == null || resolution.trim().isEmpty())) {
            throw new IllegalArgumentException("Resolution is required when resolving or closing an incident");
        }
        
        incident.update(title, description, impact, urgency, category, isMajor, affectedService, status, assignee, resolution);
        Incident updatedIncident = incidentRepository.save(incident);

        // Selective logging for major changes
        if (oldStatus != status) {
            logHistory(updatedIncident, author, IncidentHistory.HistoryType.STATUS_CHANGE, 
                    "Status updated to " + status, oldStatus.name(), status.name());
        }
        if (!Objects.equals(oldAssignee, assignee)) {
            logHistory(updatedIncident, author, IncidentHistory.HistoryType.ASSIGNMENT, 
                    "Assignee updated", 
                    oldAssignee != null ? oldAssignee.getUsername() : "Unassigned", 
                    assignee != null ? assignee.getUsername() : "Unassigned");
        }
        
        return convertToResponse(updatedIncident);
    }

    private IncidentDTO.Response convertToResponse(Incident incident) {
        return IncidentDTO.Response.builder()
                .incidentId(incident.getIncidentId())
                .tenantId(incident.getTenant().getTenantId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .status(incident.getStatus())
                .priority(incident.getPriority())
                .impact(incident.getImpact())
                .urgency(incident.getUrgency())
                .category(incident.getCategory())
                .source(incident.getSource())
                .reporterName(incident.getReporter().getUsername())
                .assigneeName(incident.getAssignee() != null ? incident.getAssignee().getUsername() : null)
                .assigneeId(incident.getAssignee() != null ? incident.getAssignee().getMemberId() : null)
                .isMajor(incident.isMajor())
                .affectedService(incident.getAffectedService())
                .resolution(incident.getResolution())
                .slaDeadline(incident.getSlaDeadline())
                .createdAt(incident.getCreatedAt())
                .syncId("V440_FINAL")
                .build();
    }

    @Transactional
    public void addWorkNote(@NonNull Long incidentId, @NonNull String note, @NonNull Long authorId) {
        Incident incident = getIncident(incidentId);
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
        
        IncidentStatus oldStatus = incident.getStatus();
        System.out.println("[DEBUG_V440] addWorkNote - IncidentID: " + incidentId + ", OldStatus: " + (oldStatus != null ? oldStatus.name() : "NULL") + ", AuthorID: " + authorId);
        
        // Auto-transition to IN_PROGRESS if currently ASSIGNED
        // TOTAL DATA COMMAND: Manual native update + flush + refresh for 100% synchronization
        if (oldStatus != null && "ASSIGNED".equals(oldStatus.name())) {
            entityManager.createNativeQuery("UPDATE incidents SET status = 'IN_PROGRESS' WHERE incident_id = ?")
                    .setParameter(1, incidentId)
                    .executeUpdate();
            
            // Force physical write and session refresh
            entityManager.flush();
            entityManager.refresh(incident);
            
            logHistory(incident, author, IncidentHistory.HistoryType.STATUS_CHANGE, 
                    "Auto-transitioned to IN_PROGRESS via work note", "ASSIGNED", "IN_PROGRESS");
        }
        
        logHistory(incident, author, IncidentHistory.HistoryType.WORK_NOTE, note, null, null);
    }

    @Transactional
    public void closeIncident(@NonNull Long incidentId, @NonNull Long authorId) {
        Incident incident = getIncident(incidentId);
        Member author = memberRepository.findById(authorId)
                .orElseThrow(() -> new IllegalArgumentException("Author not found"));
        
        if (incident.getStatus() != IncidentStatus.RESOLVED) {
            throw new IllegalStateException("Only resolved incidents can be closed");
        }
        
        IncidentStatus oldStatus = incident.getStatus();
        incident.close();
        incidentRepository.saveAndFlush(incident);
        
        logHistory(incident, author, IncidentHistory.HistoryType.STATUS_CHANGE, 
                "Incident closed", oldStatus.name(), IncidentStatus.CLOSED.name());
    }

    @Transactional(readOnly = true)
    public List<IncidentDTO.HistoryResponse> getHistory(@NonNull Long incidentId) {
        Incident incident = getIncident(incidentId);
        List<IncidentHistory> history = incidentHistoryRepository.findByIncidentOrderByCreatedAtDesc(incident);
        return history.stream()
                .map(h -> IncidentDTO.HistoryResponse.builder()
                        .id(h.getId())
                        .authorName(h.getAuthor() != null ? h.getAuthor().getUsername() : "System")
                        .type(h.getType().name())
                        .note(h.getNote())
                        .oldValue(h.getOldValue())
                        .newValue(h.getNewValue())
                        .createdAt(h.getCreatedAt())
                        .build())
                .toList();
    }

    @Transactional
    public void deleteIncident(@NonNull Long id) {
        Incident incident = getIncident(id);
        incidentRepository.delete(incident);
    }

    private void logHistory(Incident incident, Member author, IncidentHistory.HistoryType type, 
                            String note, String oldValue, String newValue) {
        try {
            System.out.println("[INCIDENT-LOG] Creating history for Incident #" + incident.getIncidentId() + 
                               " by Author ID: " + (author != null ? author.getMemberId() : "NULL") + 
                               ", Type: " + type + ", Note: " + note);
                               
            IncidentHistory history = IncidentHistory.builder()
                    .incident(incident)
                    .author(author)
                    .type(type)
                    .note(note)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .build();
            incidentHistoryRepository.saveAndFlush(Objects.requireNonNull(history));
        } catch (Exception e) {
            System.err.println("[INCIDENT-LOG-ERROR] Failed to save history for Incident #" + incident.getIncidentId());
            e.printStackTrace();
            // Re-throw to make sure the transaction fails if mandatory history log fails
            throw e;
        }
    }
}
