package com.itsm.system.service.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.request.*;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.domain.tenant.TenantRelationRepository;
import com.itsm.system.dto.request.ServiceRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import java.util.stream.IntStream;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final ServiceRequestApprovalRepository approvalRepository;
    private final ServiceRequestAttachmentRepository attachmentRepository;
    private final MemberRepository memberRepository;
    private final TenantRepository tenantRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final TenantRelationRepository tenantRelationRepository;
    private final SlaService slaService;

    @Transactional
    public ServiceRequest createDraft(@NonNull Member currentMember, @NonNull ServiceRequestDTO.Create dto, List<MultipartFile> files) {
        Tenant tenant = currentMember.getTenant();
        Member requester = currentMember;

        // 1. 운영자/관리자가 타 테넌트용 요청을 생성하는 경우
        if (dto.getTargetTenantId() != null && !dto.getTargetTenantId().equals(tenant.getTenantId())) {
            // 권한 체크: 현재 사용자가 대상 테넌트에 대한 관리 권한이 있는지 확인
            // (컨트롤러에서 해도 되지만 서비스에서 보수적으로 한 번 더 체크 가능)
            String targetId = Objects.requireNonNull(dto.getTargetTenantId());
            tenant = tenantRepository.findById(targetId)
                    .orElseThrow(() -> new IllegalArgumentException("Target tenant not found: " + targetId));
        }

        // 2. 신청자를 별도로 지정하는 경우 (고객사 사용자 대행 등록)
        if (dto.getRequesterId() != null) {
            Long reqId = Objects.requireNonNull(dto.getRequesterId());
            requester = memberRepository.findById(reqId)
                    .orElseThrow(() -> new IllegalArgumentException("Requester not found: " + reqId));
            
            // 신청자가 대상 테넌트 소속인지 검증
            if (!requester.getTenant().getTenantId().equals(tenant.getTenantId())) {
                throw new SecurityException("Selected requester does not belong to the target tenant");
            }
        }

        ServiceCatalog catalog = null;
        if (dto.getCatalogId() != null) {
            Long catId = Objects.requireNonNull(dto.getCatalogId());
            catalog = serviceCatalogRepository.findById(catId)
                    .orElseThrow(() -> new IllegalArgumentException("Catalog not found: " + catId));
        }

        ServiceRequest request = Objects.requireNonNull(ServiceRequest.builder()
                .tenant(tenant)
                .requester(requester)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .catalog(catalog)
                .dynamicFields(dto.getDynamicFields())
                .status(ServiceRequestStatus.DRAFT)
                .build());
        
        ServiceRequest savedRequest = requestRepository.save(request);

        if (files != null && !files.isEmpty()) {
            List<ServiceRequestAttachment> attachments = files.stream()
                    .map(file -> {
                        try {
                            return ServiceRequestAttachment.builder()
                                    .serviceRequest(savedRequest)
                                    .fileName(file.getOriginalFilename())
                                    .contentType(file.getContentType())
                                    .fileSize(file.getSize())
                                    .fileData(file.getBytes())
                                    .build();
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to read attachment data", e);
                        }
                    })
                    .toList();
            if (attachments != null) {
                attachmentRepository.saveAll(attachments);
            }
        }

        return savedRequest;
    }

    @Transactional
    public void submitRequest(@NonNull Long requestId, @NonNull List<Long> approverIds) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() != ServiceRequestStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requests can be submitted");
        }

        LocalDateTime deadline = slaService.calculateDeadline(request.getPriority());
        
        List<ServiceRequestApproval> approvalSteps = IntStream.range(0, approverIds.size())
                .mapToObj(i -> {
                    Long approverId = Objects.requireNonNull(approverIds.get(i));
                    Member approver = memberRepository.findById(approverId)
                            .orElseThrow(() -> new IllegalArgumentException("Approver not found: " + approverId));
                    
                    // 보안 검증: 결재자는 신청자와 동일한 테넌트여야 함
                    if (!approver.getTenant().getTenantId().equals(request.getTenant().getTenantId())) {
                        throw new SecurityException("Approver must belong to the same tenant");
                    }

                    return ServiceRequestApproval.builder()
                            .serviceRequest(request)
                            .approver(approver)
                            .stepOrder(i + 1)
                            .status(ServiceRequestApproval.ApprovalStatus.PENDING)
                            .build();
                })
                .toList();

        request.submit(deadline, approvalSteps);
        requestRepository.save(request);
    }

    @Transactional
    public void processApproval(@NonNull Long approvalId, @NonNull Long currentMemberId, boolean approved, String comment) {
        ServiceRequestApproval currentApproval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("Approval step not found"));

        if (!currentApproval.getApprover().getMemberId().equals(currentMemberId)) {
            throw new SecurityException("You are not authorized to process this approval");
        }

        if (approved) {
            currentApproval.approve(comment);
            checkAndAdvanceRequest(currentApproval.getServiceRequest());
        } else {
            currentApproval.reject(comment);
            currentApproval.getServiceRequest().reject();
        }
        approvalRepository.save(currentApproval);
    }

    private void checkAndAdvanceRequest(ServiceRequest request) {
        List<ServiceRequestApproval> approvals = approvalRepository.findByServiceRequest_RequestIdOrderByStepOrderAsc(request.getRequestId());
        
        boolean allApproved = approvals.stream()
                .allMatch(a -> a.getStatus() == ServiceRequestApproval.ApprovalStatus.APPROVED);

        if (allApproved) {
            request.approve();
            requestRepository.save(request);
        }
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> listTenantRequests(@NonNull String tenantId) {
        return requestRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public ServiceRequest getRequest(@NonNull Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
    }
    @Transactional(readOnly = true)
    public List<ServiceRequestApproval> getApprovalSteps(Long requestId) {
        return approvalRepository.findByServiceRequest_RequestIdOrderByStepOrderAsc(requestId);
    }

    @Transactional
    public void assignRequest(@NonNull Long requestId, @NonNull Long operatorId) {
        ServiceRequest request = getRequest(requestId);
        Member operator = memberRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
        request.assign(operator);
    }

    @Transactional
    public void resolveRequest(@NonNull Long requestId, @NonNull String resolution) {
        ServiceRequest request = getRequest(requestId);
        request.resolve(resolution);
    }

    @Transactional
    public void closeRequest(@NonNull Long requestId) {
        ServiceRequest request = getRequest(requestId);
        request.close();
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> listRequestsByMember(Member member) {
        String tenantId = member.getTenant().getTenantId();
        
        // 1. System Admin (MSP) -> 전체 조회
        if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return requestRepository.findAll();
        }
        
        // 2. Operator -> 본인이 담당하는 고객사 테넌트 목록 조회 후 필터링
        if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR"))) {
            List<String> managedTenantIds = tenantRelationRepository.findByOperator_TenantId(tenantId)
                    .stream()
                    .map(rel -> rel.getCustomer().getTenantId())
                    .collect(java.util.stream.Collectors.toList());
            
            // 본인 운영사 테넌트도 포함 (운영사 내부 요청)
            managedTenantIds.add(tenantId);
            
            return requestRepository.findByTenantIdIn(managedTenantIds);
        }
        
        // 3. Customer User/Manager -> 본인 테넌트만 조회
        return requestRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public ServiceRequestAttachment getAttachment(@NonNull Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
    }

    @Transactional
    public void updateRequest(@NonNull Long requestId, @NonNull Member currentMember, @NonNull ServiceRequestDTO.Update dto, List<MultipartFile> files) {
        ServiceRequest request = getRequest(requestId);

        // 보안 검증: 운영자가 아닌 사용자는 OPEN 이후 상태의 요청을 수정할 수 없음
        boolean isStaff = currentMember.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isStaff) {
            ServiceRequestStatus s = request.getStatus();
            if (s == ServiceRequestStatus.OPEN || s == ServiceRequestStatus.IN_PROGRESS || 
                s == ServiceRequestStatus.RESOLVED || s == ServiceRequestStatus.CLOSED) {
                throw new IllegalStateException("접수 완료된 요청은 수정할 수 없습니다.");
            }
        }
        
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setPriority(dto.getPriority());
        
        if (dto.getStatus() != null) {
            request.setStatus(dto.getStatus());
        }
        
        if (dto.getResolution() != null) {
            request.setResolution(dto.getResolution());
        }
        
        requestRepository.save(request);
        
        if (files != null && !files.isEmpty()) {
            List<ServiceRequestAttachment> attachments = files.stream()
                    .map(file -> {
                        try {
                            return ServiceRequestAttachment.builder()
                                    .serviceRequest(request)
                                    .fileName(file.getOriginalFilename())
                                    .contentType(file.getContentType())
                                    .fileSize(file.getSize())
                                    .fileData(file.getBytes())
                                    .build();
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to read attachment data", e);
                        }
                    })
                    .toList();
            attachmentRepository.saveAll(Objects.requireNonNull(attachments));
        }
    }

    @Transactional
    public void deleteRequest(@NonNull Long requestId, @NonNull Member currentMember) {
        ServiceRequest request = getRequest(requestId);

        // 보안 검증: 운영자가 아닌 사용자는 OPEN 이후 상태의 요청을 삭제할 수 없음
        boolean isStaff = currentMember.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isStaff) {
            ServiceRequestStatus s = request.getStatus();
            if (s == ServiceRequestStatus.OPEN || s == ServiceRequestStatus.IN_PROGRESS || 
                s == ServiceRequestStatus.RESOLVED || s == ServiceRequestStatus.CLOSED) {
                throw new IllegalStateException("접수 완료된 요청은 삭제할 수 없습니다.");
            }
        }

        request.setIsDeleted(true);
        requestRepository.save(request);
    }
}
