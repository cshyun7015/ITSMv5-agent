package com.itsm.system.web.incident;

import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.member.Member;
import com.itsm.system.dto.incident.IncidentDTO;
import com.itsm.system.service.incident.IncidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<IncidentDTO.Response> reportIncident(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @Valid @RequestBody IncidentDTO.Request dto) {
        
        Incident incident = incidentService.reportIncident(
                Objects.requireNonNull(dto.getTenantId()), 
                Objects.requireNonNull(dto.getTitle()), 
                Objects.requireNonNull(dto.getDescription()),
                Objects.requireNonNull(dto.getImpact()), 
                Objects.requireNonNull(dto.getUrgency()), 
                Objects.requireNonNull(dto.getCategory()),
                Objects.requireNonNull(currentMember.getMemberId()), "USER",
                dto.isMajor(), dto.getAffectedService()
        );
        return ResponseEntity.ok(convertToResponse(incident));
    }

    @PostMapping("/alerts")
    public ResponseEntity<IncidentDTO.Response> reportAlert(
            @AuthenticationPrincipal Member currentMember,
            @Valid @RequestBody IncidentDTO.Request dto) {
        
        // 시스템 알람 수신 (외부 모니터링 시스템용). 인증 정보가 없으면 관리자(ID: 1)로 기록.
        Long reporterId = (currentMember != null) ? currentMember.getMemberId() : 1L;
        
        Incident incident = incidentService.reportIncident(
                Objects.requireNonNull(dto.getTenantId()), 
                Objects.requireNonNull(dto.getTitle()), 
                Objects.requireNonNull(dto.getDescription()),
                Objects.requireNonNull(dto.getImpact()), 
                Objects.requireNonNull(dto.getUrgency()), 
                Objects.requireNonNull(dto.getCategory()),
                Objects.requireNonNull(reporterId), "SYSTEM",
                dto.isMajor(), dto.getAffectedService()
        );
        return ResponseEntity.ok(convertToResponse(incident));
    }

    @GetMapping
    public ResponseEntity<List<IncidentDTO.Response>> listAll() {
        List<Incident> incidents = incidentService.listAllIncidents();
        return ResponseEntity.ok(incidents.stream().map(this::convertToResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDTO.Response> getIncident(@PathVariable Long id) {
        Incident incident = incidentService.getIncident(Objects.requireNonNull(id));
        return ResponseEntity.ok(convertToResponse(incident));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assign(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        incidentService.assignSpecialist(Objects.requireNonNull(id), Objects.requireNonNull(currentMember.getMemberId()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(
            @PathVariable @NonNull Long id,
            @RequestBody IncidentDTO.Resolve dto) {
        incidentService.resolveIncident(Objects.requireNonNull(id), Objects.requireNonNull(dto.getResolution()));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentDTO.Response> updateIncident(
            @PathVariable @NonNull Long id,
            @Valid @RequestBody IncidentDTO.Request dto) {
        Incident incident = incidentService.updateIncident(
                Objects.requireNonNull(id), 
                Objects.requireNonNull(dto.getTitle()), 
                Objects.requireNonNull(dto.getDescription()),
                Objects.requireNonNull(dto.getImpact()), 
                Objects.requireNonNull(dto.getUrgency()), 
                Objects.requireNonNull(dto.getCategory()),
                dto.isMajor(), dto.getAffectedService(),
                Objects.requireNonNull(dto.getStatus()), 
                dto.getAssigneeId(), dto.getResolution()
        );
        return ResponseEntity.ok(convertToResponse(incident));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncident(@PathVariable @NonNull Long id) {
        incidentService.deleteIncident(Objects.requireNonNull(id));
        return ResponseEntity.noContent().build();
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
                .build();
    }
}
