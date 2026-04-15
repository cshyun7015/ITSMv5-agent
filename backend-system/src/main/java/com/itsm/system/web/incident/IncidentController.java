package com.itsm.system.web.incident;

import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.member.Member;
import com.itsm.system.dto.incident.IncidentDTO;
import com.itsm.system.service.incident.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    public ResponseEntity<IncidentDTO.Response> reportIncident(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody IncidentDTO.Request dto) {
        
        Incident incident = incidentService.reportIncident(
                dto.getTenantId(), dto.getTitle(), dto.getDescription(),
                dto.getImpact(), dto.getUrgency(), dto.getCategory(),
                currentMember.getMemberId(), "USER"
        );
        return ResponseEntity.ok(convertToResponse(incident));
    }

    @PostMapping("/alerts")
    public ResponseEntity<IncidentDTO.Response> reportAlert(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody IncidentDTO.Request dto) {
        
        // 시스템 알람 수신 (외부 모니터링 시스템용). 인증 정보가 없으면 관리자(ID: 1)로 기록.
        Long reporterId = (currentMember != null) ? currentMember.getMemberId() : 1L;
        
        Incident incident = incidentService.reportIncident(
                dto.getTenantId(), dto.getTitle(), dto.getDescription(),
                dto.getImpact(), dto.getUrgency(), dto.getCategory(),
                reporterId, "SYSTEM"
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
        Incident incident = incidentService.getIncident(id);
        return ResponseEntity.ok(convertToResponse(incident));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assign(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long id) {
        incidentService.assignSpecialist(id, currentMember.getMemberId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(
            @PathVariable Long id,
            @RequestBody IncidentDTO.Resolve dto) {
        incidentService.resolveIncident(id, dto.getResolution());
        return ResponseEntity.ok().build();
    }

    private IncidentDTO.Response convertToResponse(Incident incident) {
        return IncidentDTO.Response.builder()
                .incidentId(incident.getIncidentId())
                .tenantId(incident.getTenant().getTenantId())
                .title(incident.getTitle())
                .description(incident.getDescription())
                .status(incident.getStatus())
                .priority(incident.getPriority())
                .category(incident.getCategory())
                .source(incident.getSource())
                .reporterName(incident.getReporter().getUsername())
                .assigneeName(incident.getAssignee() != null ? incident.getAssignee().getUsername() : null)
                .resolution(incident.getResolution())
                .slaDeadline(incident.getSlaDeadline())
                .createdAt(incident.getCreatedAt())
                .build();
    }
}
