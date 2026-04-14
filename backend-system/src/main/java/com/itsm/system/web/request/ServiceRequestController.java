package com.itsm.system.web.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.request.ServiceRequest;
import com.itsm.system.dto.request.ServiceRequestDTO;
import com.itsm.system.service.request.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    @PostMapping
    public ResponseEntity<ServiceRequestDTO.Response> createDraft(
            @AuthenticationPrincipal Member currentMember,
            @RequestBody ServiceRequestDTO.Create dto) {
        
        ServiceRequest request = requestService.createDraft(
                currentMember.getTenant(),
                currentMember,
                dto.getTitle(),
                dto.getDescription(),
                dto.getPriority()
        );
        return ResponseEntity.ok(convertToResponse(request));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Void> submit(
            @PathVariable Long id,
            @RequestBody ServiceRequestDTO.Submit dto) {
        requestService.submitRequest(id, dto.getApproverIds());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/approvals/{approvalId}")
    public ResponseEntity<Void> approve(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long approvalId,
            @RequestBody ServiceRequestDTO.Approve dto) {
        requestService.processApproval(approvalId, currentMember.getMemberId(), dto.isApproved(), dto.getComment());
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDTO.Response>> listRequests(
            @AuthenticationPrincipal Member currentMember) {
        List<ServiceRequest> requests = requestService.listTenantRequests(currentMember.getTenant().getTenantId());
        return ResponseEntity.ok(requests.stream().map(this::convertToResponse).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceRequestDTO.Response> getRequest(
            @PathVariable Long id) {
        ServiceRequest request = requestService.getRequest(id);
        return ResponseEntity.ok(convertToResponse(request));
    }

    private ServiceRequestDTO.Response convertToResponse(ServiceRequest request) {
        return ServiceRequestDTO.Response.builder()
                .requestId(request.getRequestId())
                .tenantId(request.getTenant().getTenantId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus())
                .priority(request.getPriority())
                .slaDeadline(request.getSlaDeadline())
                .requesterName(request.getRequester().getUsername())
                .assigneeName(request.getAssignee() != null ? request.getAssignee().getUsername() : null)
                .createdAt(request.getCreatedAt())
                .build();
    }
}
