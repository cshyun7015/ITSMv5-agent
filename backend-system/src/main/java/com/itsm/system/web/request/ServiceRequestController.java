package com.itsm.system.web.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.request.*;
import com.itsm.system.dto.request.ServiceRequestDTO;
import com.itsm.system.service.request.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.List;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServiceRequestDTO.Response> createDraft(
            @AuthenticationPrincipal Member currentMember,
            @RequestPart("request") ServiceRequestDTO.Create dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        
        ServiceRequest request = requestService.createDraft(
                currentMember.getTenant(),
                currentMember,
                dto.getTitle(),
                dto.getDescription(),
                dto.getPriority(),
                dto.getCatalogId(),
                dto.getDynamicFields(),
                files
        );
        return ResponseEntity.ok(convertToResponse(request));
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long attachmentId) {
        ServiceRequestAttachment attachment = requestService.getAttachment(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream"))
                .body(attachment.getFileData());
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

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assign(
            @AuthenticationPrincipal Member currentMember,
            @PathVariable Long id) {
        // 현재 로그인한 운영자 본인에게 배정
        requestService.assignRequest(id, currentMember.getMemberId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<Void> resolve(
            @PathVariable Long id,
            @RequestBody ServiceRequestDTO.Resolve dto) {
        requestService.resolveRequest(id, dto.getResolution());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> close(
            @PathVariable Long id) {
        requestService.closeRequest(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<ServiceRequestDTO.Response>> listAllRequests() {
        List<ServiceRequest> requests = requestService.listAllRequests();
        return ResponseEntity.ok(requests.stream().map(this::convertToResponse).toList());
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

    @GetMapping("/{id}/approvals")
    public ResponseEntity<List<ServiceRequestDTO.ApprovalResponse>> getApprovals(
            @PathVariable Long id) {
        return ResponseEntity.ok(requestService.getApprovalSteps(id).stream()
                .map(a -> ServiceRequestDTO.ApprovalResponse.builder()
                        .approvalId(a.getApprovalId())
                        .approverName(a.getApprover().getUsername())
                        .status(a.getStatus().name())
                        .stepOrder(a.getStepOrder())
                        .comment(a.getComment())
                        .updatedAt(a.getUpdatedAt())
                        .build())
                .toList());
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
                .resolution(request.getResolution())
                .createdAt(request.getCreatedAt())
                .catalogName(request.getCatalog() != null ? request.getCatalog().getName() : null)
                .dynamicFields(request.getDynamicFields())
                .attachments(request.getAttachments().stream()
                        .map(a -> ServiceRequestDTO.AttachmentInfo.builder()
                                .id(a.getId())
                                .fileName(a.getFileName())
                                .fileSize(a.getFileSize())
                                .build())
                        .toList())
                .build();
    }
}
