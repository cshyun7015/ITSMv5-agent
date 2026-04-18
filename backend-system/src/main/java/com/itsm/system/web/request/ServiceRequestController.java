package com.itsm.system.web.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.request.*;
import com.itsm.system.dto.request.ServiceRequestDTO;
import com.itsm.system.service.request.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.lang.NonNull;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService requestService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServiceRequestDTO.Response> createDraft(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @RequestPart("request") ServiceRequestDTO.Create dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        
        ServiceRequest request = requestService.createDraft(currentMember, Objects.requireNonNull(dto), files);
        return ResponseEntity.ok(convertToResponse(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateRequest(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id,
            @RequestPart("request") ServiceRequestDTO.Update dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        requestService.updateRequest(id, currentMember, Objects.requireNonNull(dto), files);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        requestService.deleteRequest(id, currentMember);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/attachments/{attachmentId}")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable @NonNull Long attachmentId) {
        ServiceRequestAttachment attachment = requestService.getAttachment(attachmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(Objects.requireNonNull(attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream")))
                .body(attachment.getFileData());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Void> submit(
            @PathVariable @NonNull Long id,
            @RequestBody ServiceRequestDTO.Submit dto) {
        requestService.submitRequest(id, Objects.requireNonNull(dto.getApproverIds()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/approvals/{approvalId}")
    public ResponseEntity<Void> approve(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long approvalId,
            @RequestBody ServiceRequestDTO.Approve dto) {
        requestService.processApproval(approvalId, Objects.requireNonNull(currentMember.getMemberId()), dto.isApproved(), dto.getComment());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<Void> assign(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        // 현재 로그인한 운영자 본인에게 배정
        requestService.assignRequest(id, Objects.requireNonNull(currentMember.getMemberId()));
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<Void> resolve(
            @PathVariable @NonNull Long id,
            @RequestBody ServiceRequestDTO.Resolve dto) {
        requestService.resolveRequest(id, Objects.requireNonNull(dto.getResolution()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Void> close(
            @PathVariable @NonNull Long id) {
        requestService.closeRequest(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    public ResponseEntity<List<ServiceRequestDTO.Response>> listAllRequests(
            @AuthenticationPrincipal @NonNull Member currentMember) {
        List<ServiceRequest> requests = requestService.listRequestsByMember(currentMember);
        return ResponseEntity.ok(requests.stream().map(this::convertToResponse).toList());
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequestDTO.Response>> listRequests(
            @AuthenticationPrincipal @NonNull Member currentMember) {
        List<ServiceRequest> requests = requestService.listTenantRequests(Objects.requireNonNull(currentMember.getTenant().getTenantId()));
        return ResponseEntity.ok(requests.stream().map(this::convertToResponse).toList());
    }

    public ResponseEntity<ServiceRequestDTO.Response> getRequest(
            @PathVariable @NonNull Long id) {
        ServiceRequest request = requestService.getRequest(id);
        return ResponseEntity.ok(convertToResponse(request));
    }

    public ResponseEntity<List<ServiceRequestDTO.ApprovalResponse>> getApprovals(
            @PathVariable @NonNull Long id) {
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
