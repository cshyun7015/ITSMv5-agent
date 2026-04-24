package com.itsm.system.web.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.request.*;
import com.itsm.system.dto.request.ServiceRequestDTO;
import com.itsm.system.service.request.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<ServiceRequestDTO.Response> createDraft(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @RequestPart("request") ServiceRequestDTO.Create dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        
        ServiceRequest request = requestService.createDraft(currentMember, Objects.requireNonNull(dto), files);
        return ResponseEntity.ok(ServiceRequestDTO.Response.fromEntity(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<Void> updateRequest(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id,
            @RequestPart("request") ServiceRequestDTO.Update dto,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        requestService.updateRequest(id, currentMember, Objects.requireNonNull(dto), files);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<Void> deleteRequest(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        requestService.deleteRequest(id, currentMember);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/attachments/{attachmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<byte[]> downloadAttachment(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long attachmentId) {
        
        ServiceRequestAttachment attachment = requestService.getAttachment(attachmentId);
        ServiceRequest request = attachment.getServiceRequest();
        
        // 보안 검증: MSP가 아니면 본인 테넌트 파일만 다운로드 가능
        String userTenantId = currentMember.getTenant().getTenantId();
        if (!"OPER_MSP".equals(userTenantId) && !request.getTenant().getTenantId().equals(userTenantId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(Objects.requireNonNull(attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream")))
                .body(attachment.getFileData());
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> submit(
            @PathVariable @NonNull Long id,
            @RequestBody ServiceRequestDTO.Submit dto) {
        requestService.submitRequest(id, Objects.requireNonNull(dto.getApproverIds()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/approvals/{approvalId}")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> approve(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long approvalId,
            @RequestBody ServiceRequestDTO.Approve dto) {
        requestService.processApproval(approvalId, Objects.requireNonNull(currentMember.getMemberId()), dto.isApproved(), dto.getComment());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> assign(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        requestService.assignRequest(id, Objects.requireNonNull(currentMember.getMemberId()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> resolve(
            @PathVariable @NonNull Long id,
            @RequestBody ServiceRequestDTO.Resolve dto) {
        requestService.resolveRequest(id, Objects.requireNonNull(dto.getResolution()));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('USER', 'MANAGER', 'ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> close(
            @PathVariable @NonNull Long id) {
        requestService.closeRequest(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<List<ServiceRequestDTO.Response>> listAllRequests(
            @AuthenticationPrincipal @NonNull Member currentMember) {
        List<ServiceRequest> requests = requestService.listRequestsByMember(currentMember);
        return ResponseEntity.ok(requests.stream().map(ServiceRequestDTO.Response::fromEntity).toList());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<List<ServiceRequestDTO.Response>> listRequests(
            @AuthenticationPrincipal @NonNull Member currentMember) {
        // 기본 목록 조회도 listRequestsByMember를 사용하여 권한별 필터링 적용
        List<ServiceRequest> requests = requestService.listRequestsByMember(currentMember);
        return ResponseEntity.ok(requests.stream().map(ServiceRequestDTO.Response::fromEntity).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<ServiceRequestDTO.Response> getRequest(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        ServiceRequest request = requestService.getRequest(id);
        
        // 보안 검증
        String userTenantId = currentMember.getTenant().getTenantId();
        if (!"OPER_MSP".equals(userTenantId) && !request.getTenant().getTenantId().equals(userTenantId)) {
            return ResponseEntity.status(403).build();
        }
        
        return ResponseEntity.ok(ServiceRequestDTO.Response.fromEntity(request));
    }

    @GetMapping("/{id}/approvals")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
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
}
