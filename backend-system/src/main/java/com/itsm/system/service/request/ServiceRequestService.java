package com.itsm.system.service.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.request.*;
import com.itsm.system.domain.tenant.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {

    private final ServiceRequestRepository requestRepository;
    private final ServiceRequestApprovalRepository approvalRepository;
    private final MemberRepository memberRepository;
    private final SlaService slaService;

    @Transactional
    public ServiceRequest createDraft(Tenant tenant, Member requester, String title, String description, ServiceRequestPriority priority) {
        ServiceRequest request = ServiceRequest.builder()
                .tenant(tenant)
                .requester(requester)
                .title(title)
                .description(description)
                .priority(priority)
                .status(ServiceRequestStatus.DRAFT)
                .build();
        return requestRepository.save(request);
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
}
