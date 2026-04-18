package com.itsm.system.service.change;

import com.itsm.system.domain.change.ChangeApproval;
import com.itsm.system.domain.change.ChangeRequest;
import com.itsm.system.domain.change.ChangeRequestRepository;
import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.change.ChangeRequestDTO;
import com.itsm.system.repository.incident.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final TenantRepository tenantRepository;
    private final MemberRepository memberRepository;
    private final IncidentRepository incidentRepository;

    @Transactional
    public ChangeRequestDTO createDraft(@NonNull ChangeRequestDTO dto) {
        Tenant tenant = tenantRepository.findById(dto.getTenantId())
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));
        Member requester = memberRepository.findById(dto.getRequesterId())
                .orElseThrow(() -> new IllegalArgumentException("Requester not found"));

        if (dto.getTypeCode() == null) dto.setTypeCode("NORMAL");
        if (dto.getImpactCode() == null) dto.setImpactCode("MEDIUM");
        if (dto.getUrgencyCode() == null) dto.setUrgencyCode("MEDIUM");

        ChangeRequest changeRequest = ChangeRequest.builder()
                .tenant(tenant)
                .requester(requester)
                .title(dto.getTitle())
                .reason(dto.getReason())
                .description(dto.getDescription())
                .typeCode(dto.getTypeCode())
                .impactCode(dto.getImpactCode())
                .urgencyCode(dto.getUrgencyCode())
                .statusCode("DRAFT")
                .plannedStartDate(dto.getPlannedStartDate())
                .plannedEndDate(dto.getPlannedEndDate())
                .implementationPlan(dto.getImplementationPlan())
                .backoutPlan(dto.getBackoutPlan())
                .testPlan(dto.getTestPlan())
                .affectedCis(dto.getAffectedCis())
                .build();

        changeRequest.calculatePriority();
        
        if (changeRequest.getPriorityCode() == null) {
            throw new IllegalStateException("Priority calculation failed - mandatory codes missing");
        }
        
        if (dto.getRelatedIncidentIds() != null) {
            for (Long incId : dto.getRelatedIncidentIds()) {
                incidentRepository.findById(incId).ifPresent(changeRequest::addRelatedIncident);
            }
        }

        return convertToDTO(changeRequestRepository.save(changeRequest));
    }

    @Transactional
    public ChangeRequestDTO updateChange(@NonNull Long changeId, @NonNull ChangeRequestDTO dto) {
        ChangeRequest change = changeRequestRepository.findById(changeId)
                .orElseThrow(() -> new IllegalArgumentException("Change request not found"));

        String status = change.getStatusCode();
        
        // 1. DRAFT/REJECTED 상태: 전체 수정 가능
        if ("DRAFT".equals(status) || "REJECTED".equals(status)) {
            change.updateBasicInfo(dto.getTitle(), dto.getReason(), dto.getDescription());
            change.updateClassification(dto.getTypeCode(), dto.getImpactCode(), dto.getUrgencyCode());
            change.calculatePriority();
        } 
        
        // 2. CAB_APPROVAL/SCHEDULED 단계에서도 수정 가능한 공통 필드 (계획 정보)
        if (!"CLOSED".equals(status)) {
            change.updatePlanningInfo(
                dto.getPlannedStartDate(), 
                dto.getPlannedEndDate(),
                dto.getImplementationPlan(),
                dto.getBackoutPlan(),
                dto.getTestPlan(),
                dto.getAffectedCis()
            );
            change.updateReviewNotes(dto.getReviewNotes());
            
            // 상태 수동 변경 반영
            if (dto.getStatusCode() != null) {
                change.updateStatus(dto.getStatusCode());
            }
            
            // 담당자 변경 반영
            if (dto.getAssigneeId() != null) {
                Member assignee = memberRepository.findById(dto.getAssigneeId())
                        .orElseThrow(() -> new IllegalArgumentException("Assignee not found: " + dto.getAssigneeId()));
                change.setAssignee(assignee);
            }
        }

        return convertToDTO(changeRequestRepository.save(change));
    }

    @Transactional
    public ChangeRequestDTO submitRFC(@NonNull Long changeId, List<Long> approverIds) {
        ChangeRequest change = changeRequestRepository.findById(changeId)
                .orElseThrow(() -> new IllegalArgumentException("Change request not found"));
        
        if (!"DRAFT".equals(change.getStatusCode()) && !"REJECTED".equals(change.getStatusCode())) {
            throw new IllegalStateException("Only drafts or rejected requests can be submitted");
        }

        if (approverIds == null || approverIds.isEmpty()) {
            change.updateStatus("SCHEDULED"); // No approval needed (e.g. Standard Change)
        } else {
            change.updateStatus("CAB_APPROVAL");
            int order = 1;
            for (Long approverId : approverIds) {
                Member approver = memberRepository.findById(approverId)
                        .orElseThrow(() -> new IllegalArgumentException("Approver not found: " + approverId));
                change.getApprovals().add(ChangeApproval.builder()
                        .changeRequest(change)
                        .approver(approver)
                        .stepOrder(order++)
                        .status("PENDING")
                        .build());
            }
        }
        
        return convertToDTO(changeRequestRepository.save(change));
    }

    @Transactional
    public void approveStep(@NonNull Long approvalId, String comment) {
        // Implementation for step-by-step approval logic
        // If last step is approved, update change status to SCHEDULED
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestDTO> listChanges(String tenantId) {
        return changeRequestRepository.findByTenant_TenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ChangeRequestDTO convertToDTO(ChangeRequest change) {
        return ChangeRequestDTO.builder()
                .changeId(change.getChangeId())
                .tenantId(change.getTenant().getTenantId())
                .title(change.getTitle())
                .reason(change.getReason())
                .description(change.getDescription())
                .statusCode(change.getStatusCode())
                .typeCode(change.getTypeCode())
                .priorityCode(change.getPriorityCode())
                .impactCode(change.getImpactCode())
                .urgencyCode(change.getUrgencyCode())
                .requesterId(change.getRequester().getMemberId())
                .requesterName(change.getRequester().getUsername())
                .assigneeId(change.getAssignee() != null ? change.getAssignee().getMemberId() : null)
                .assigneeName(change.getAssignee() != null ? change.getAssignee().getUsername() : null)
                .plannedStartDate(change.getPlannedStartDate())
                .plannedEndDate(change.getPlannedEndDate())
                .implementationPlan(change.getImplementationPlan())
                .backoutPlan(change.getBackoutPlan())
                .testPlan(change.getTestPlan())
                .affectedCis(change.getAffectedCis())
                .reviewNotes(change.getReviewNotes())
                .relatedIncidentIds(change.getRelatedIncidents().stream().map(Incident::getIncidentId).collect(Collectors.toList()))
                .approvals(change.getApprovals().stream().map(a -> ChangeRequestDTO.ApprovalDTO.builder()
                        .approvalId(a.getApprovalId())
                        .approverId(a.getApprover().getMemberId())
                        .approverName(a.getApprover().getUsername())
                        .stepOrder(a.getStepOrder())
                        .status(a.getStatus())
                        .comment(a.getComment())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
