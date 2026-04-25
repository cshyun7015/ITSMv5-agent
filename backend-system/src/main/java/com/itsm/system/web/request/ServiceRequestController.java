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
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Page;

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
            return ResponseEntity.status(403).header("X-Error-Message", "Access denied to attachment from other tenant").build();
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
    public ResponseEntity<ServiceRequestDTO.PaginatedResponse<ServiceRequestDTO.Response>> listAllRequests(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @RequestParam(required = false) ServiceRequestStatus status,
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        ServiceRequestDTO.Search search = ServiceRequestDTO.Search.builder()
                .status(status)
                .tenantId(tenantId)
                .keyword(keyword)
                .startDate(startDate)
                .endDate(endDate)
                .page(page)
                .size(size)
                .build();
        
        Page<ServiceRequest> requestPage = requestService.searchRequests(currentMember, search);
        
        ServiceRequestDTO.PaginatedResponse<ServiceRequestDTO.Response> response = ServiceRequestDTO.PaginatedResponse.<ServiceRequestDTO.Response>builder()
                .content(requestPage.getContent().stream().map(ServiceRequestDTO.Response::fromEntity).toList())
                .totalElements(requestPage.getTotalElements())
                .totalPages(requestPage.getTotalPages())
                .size(requestPage.getSize())
                .number(requestPage.getNumber())
                .build();

        return ResponseEntity.ok(response);
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
        
        // 보안 검증: MSP는 전체 조회 가능, 일반 운영자는 관리 테넌트만 조회 가능
        String userTenantId = currentMember.getTenant().getTenantId();
        if (!"OPER_MSP".equalsIgnoreCase(userTenantId)) {
            boolean isStaff = currentMember.getAuthorities().stream()
                    .anyMatch(a -> {
                        String auth = a.getAuthority();
                        return auth.equals("OPERATOR") || auth.equals("ROLE_OPERATOR") || 
                               auth.equals("ADMIN") || auth.equals("ROLE_ADMIN");
                    });

            if (isStaff) {
                List<String> managedTenantIds = requestService.getManagedTenantIds(userTenantId);
                String requestTenantId = request.getTenant().getTenantId();
                boolean isAuthorized = managedTenantIds.stream()
                        .anyMatch(tid -> tid.equalsIgnoreCase(requestTenantId));
                
                if (!isAuthorized) {
                    return ResponseEntity.status(403).header("X-Error-Message", "Access denied: Unauthorized access attempt").build();
                }
            } else {
                // 일반 사용자는 본인 테넌트만 가능
                if (!request.getTenant().getTenantId().equalsIgnoreCase(userTenantId)) {
                    return ResponseEntity.status(403).header("X-Error-Message", "Access denied: Request belongs to another tenant").build();
                }
            }
        }
        
        return ResponseEntity.ok(ServiceRequestDTO.Response.fromEntity(request));
    }

    @GetMapping("/{id}/approvals")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR', 'USER', 'MANAGER')")
    public ResponseEntity<List<ServiceRequestDTO.ApprovalResponse>> getApprovals(
            @AuthenticationPrincipal @NonNull Member currentMember,
            @PathVariable @NonNull Long id) {
        ServiceRequest request = requestService.getRequest(id);
        
        // 보안 검증
        String userTenantId = currentMember.getTenant().getTenantId();
        if (!"OPER_MSP".equalsIgnoreCase(userTenantId)) {
            boolean isStaff = currentMember.getAuthorities().stream()
                    .anyMatch(a -> {
                        String auth = a.getAuthority();
                        return auth.equals("OPERATOR") || auth.equals("ROLE_OPERATOR") || 
                               auth.equals("ADMIN") || auth.equals("ROLE_ADMIN");
                    });

            if (isStaff) {
                List<String> managedTenantIds = requestService.getManagedTenantIds(userTenantId);
                String requestTenantId = request.getTenant().getTenantId();
                boolean isAuthorized = managedTenantIds.stream()
                        .anyMatch(tid -> tid.equalsIgnoreCase(requestTenantId));
                
                if (!isAuthorized) {
                    return ResponseEntity.status(403).header("X-Error-Message", "Access denied: Unauthorized access attempt").build();
                }
            } else {
                if (!request.getTenant().getTenantId().equalsIgnoreCase(userTenantId)) {
                    return ResponseEntity.status(403).header("X-Error-Message", "Access denied: You can only view your own tenant's approvals").build();
                }
            }
        }

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
