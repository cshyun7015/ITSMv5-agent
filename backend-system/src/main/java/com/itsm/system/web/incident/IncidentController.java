package com.itsm.system.web.incident;

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
        
        return ResponseEntity.ok(incidentService.reportIncident(
                Objects.requireNonNull(dto.getTenantId()), 
                Objects.requireNonNull(dto.getTitle()), 
                Objects.requireNonNull(dto.getDescription()),
                Objects.requireNonNull(dto.getImpact()), 
                Objects.requireNonNull(dto.getUrgency()), 
                Objects.requireNonNull(dto.getCategory()),
                Objects.requireNonNull(currentMember.getMemberId()), "USER",
                dto.isMajor(), dto.getAffectedService()
        ));
    }

    @PostMapping("/alerts")
    public ResponseEntity<IncidentDTO.Response> reportAlert(
            @AuthenticationPrincipal Member currentMember,
            @Valid @RequestBody IncidentDTO.Request dto) {
        
        Long reporterId = (currentMember != null) ? currentMember.getMemberId() : 1L;
        
        return ResponseEntity.ok(incidentService.reportIncident(
                Objects.requireNonNull(dto.getTenantId()), 
                Objects.requireNonNull(dto.getTitle()), 
                Objects.requireNonNull(dto.getDescription()),
                Objects.requireNonNull(dto.getImpact()), 
                Objects.requireNonNull(dto.getUrgency()), 
                Objects.requireNonNull(dto.getCategory()),
                Objects.requireNonNull(reporterId), "SYSTEM",
                dto.isMajor(), dto.getAffectedService()
        ));
    }

    @GetMapping
    public ResponseEntity<List<IncidentDTO.Response>> listAll() {
        return ResponseEntity.ok(incidentService.listAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDTO.Response> getIncident(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getIncidentResponse(Objects.requireNonNull(id)));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assign(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        incidentService.assignSpecialist(Objects.requireNonNull(id), Objects.requireNonNull(currentMember.getMemberId()), Objects.requireNonNull(currentMember.getMemberId()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id,
            @RequestBody IncidentDTO.Resolve dto) {
        incidentService.resolveIncident(Objects.requireNonNull(id), Objects.requireNonNull(dto.getResolution()), Objects.requireNonNull(currentMember.getMemberId()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> close(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        incidentService.closeIncident(Objects.requireNonNull(id), Objects.requireNonNull(currentMember.getMemberId()));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentDTO.Response> update(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable Long id,
            @Valid @RequestBody IncidentDTO.Request dto) {
        
        return ResponseEntity.ok(incidentService.updateIncident(
                Objects.requireNonNull(id), Objects.requireNonNull(dto.getTitle()), Objects.requireNonNull(dto.getDescription()),
                Objects.requireNonNull(dto.getImpact()), Objects.requireNonNull(dto.getUrgency()), Objects.requireNonNull(dto.getCategory()),
                dto.isMajor(), dto.getAffectedService(),
                Objects.requireNonNull(dto.getStatus()), dto.getAssigneeId(), dto.getResolution(),
                Objects.requireNonNull(currentMember.getMemberId())
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incidentService.deleteIncident(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentDTO.HistoryResponse>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getHistory(Objects.requireNonNull(id)));
    }

    @PostMapping("/{id}/notes")
    public ResponseEntity<IncidentDTO.Response> addWorkNote(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable Long id,
            @Valid @RequestBody IncidentDTO.WorkNoteRequest dto) {
        incidentService.addWorkNote(Objects.requireNonNull(id), Objects.requireNonNull(dto.getNote()), Objects.requireNonNull(currentMember.getMemberId()));
        // Return the updated incident directly — eliminates the frontend race condition
        // where a separate GET request would race against the just-committed transaction.
        return ResponseEntity.ok(incidentService.getIncidentResponse(Objects.requireNonNull(id)));
    }
}
