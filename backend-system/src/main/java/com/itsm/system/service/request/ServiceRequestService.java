package com.itsm.system.service.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.request.*;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRelationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final ServiceRequestApprovalRepository approvalRepository;
    private final ServiceRequestAttachmentRepository attachmentRepository;
    private final MemberRepository memberRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final TenantRelationRepository tenantRelationRepository;
    private final SlaService slaService;

    @Transactional
    public ServiceRequest createDraft(Tenant tenant, Member requester, String title, String description, 
                                     ServiceRequestPriority priority, Long catalogId, String dynamicFields, 
                                     List<MultipartFile> files) {
        ServiceCatalog catalog = null;
        if (catalogId != null) {
            catalog = serviceCatalogRepository.findById(catalogId)
                    .orElseThrow(() -> new IllegalArgumentException("Catalog not found: " + catalogId));
        }

        ServiceRequest request = ServiceRequest.builder()
                .tenant(tenant)
                .requester(requester)
                .title(title)
                .description(description)
                .priority(priority)
                .catalog(catalog)
                .dynamicFields(dynamicFields)
                .status(ServiceRequestStatus.DRAFT)
                .build();
        
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
            attachmentRepository.saveAll(attachments);
        }

        return savedRequest;
    }

    @Transactional
    public void submitRequest(Long requestId, List<Long> approverIds) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        if (request.getStatus() != ServiceRequestStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requests can be submitted");
        }

        LocalDateTime deadline = slaService.calculateDeadline(request.getPriority());
        
        List<ServiceRequestApproval> approvalSteps = IntStream.range(0, approverIds.size())
                .mapToObj(i -> {
                    Member approver = memberRepository.findById(approverIds.get(i))
                            .orElseThrow(() -> new IllegalArgumentException("Approver not found: " + approverIds.get(i)));
                    
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
    public void processApproval(Long approvalId, Long currentMemberId, boolean approved, String comment) {
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
    public List<ServiceRequest> listTenantRequests(String tenantId) {
        return requestRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public ServiceRequest getRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
    }
    @Transactional(readOnly = true)
    public List<ServiceRequestApproval> getApprovalSteps(Long requestId) {
        return approvalRepository.findByServiceRequest_RequestIdOrderByStepOrderAsc(requestId);
    }

    @Transactional
    public void assignRequest(Long requestId, Long operatorId) {
        ServiceRequest request = getRequest(requestId);
        Member operator = memberRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
        request.assign(operator);
    }

    @Transactional
    public void resolveRequest(Long requestId, String resolution) {
        ServiceRequest request = getRequest(requestId);
        request.resolve(resolution);
    }

    @Transactional
    public void closeRequest(Long requestId) {
        ServiceRequest request = getRequest(requestId);
        request.close();
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> listRequestsByMember(Member member) {
        // 1. System Admin (MSP) -> 전체 조회
        if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return requestRepository.findAll();
        }
        
        // 2. Operator -> 본인이 담당하는 고객사 테넌트 목록 조회 후 필터링
        if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR"))) {
            List<String> managedTenantIds = tenantRelationRepository.findByOperator_TenantId(member.getTenant().getTenantId())
                    .stream()
                    .map(rel -> rel.getCustomer().getTenantId())
                    .collect(java.util.stream.Collectors.toList());
            
            // 본인 운영사 테넌트도 포함 (운영사 내부 요청)
            managedTenantIds.add(member.getTenant().getTenantId());
            
            return requestRepository.findByTenantIdIn(managedTenantIds);
        }
        
        // 3. Customer User/Manager -> 본인 테넌트만 조회
        return requestRepository.findByTenantId(member.getTenant().getTenantId());
    }

    @Transactional(readOnly = true)
    public ServiceRequestAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
    }
}
