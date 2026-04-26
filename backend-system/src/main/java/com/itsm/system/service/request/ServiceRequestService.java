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
import org.springframework.data.jpa.domain.Specification;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.IntStream;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

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

        if (dto.getTargetTenantId() != null && !dto.getTargetTenantId().equals(tenant.getTenantId())) {
            String targetId = Objects.requireNonNull(dto.getTargetTenantId());
            tenant = tenantRepository.findById(targetId)
                    .orElseThrow(() -> new IllegalArgumentException("Target tenant not found: " + targetId));
        }

        if (dto.getRequesterId() != null) {
            Long reqId = Objects.requireNonNull(dto.getRequesterId());
            requester = memberRepository.findById(reqId)
                    .orElseThrow(() -> new IllegalArgumentException("Requester not found: " + reqId));
            
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

        String requestNo = generateRequestNo();
        
        ServiceRequest request = ServiceRequest.builder()
                .tenant(tenant)
                .requester(requester)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .priority(dto.getPriority())
                .catalog(catalog)
                .customCatalogName(dto.getCustomCatalogName())
                .dynamicFields(dto.getDynamicFields())
                .status(ServiceRequestStatus.DRAFT)
                .requestNo(requestNo)
                .build();
        
        ServiceRequest savedRequest = requestRepository.save(Objects.requireNonNull(request));
        processAttachments(savedRequest, files);

        return savedRequest;
    }

    private String generateRequestNo() {
        String datePart = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd").format(java.time.LocalDate.now());
        String prefix = "SR-" + datePart + "-";
        long count = requestRepository.countByRequestNoStartingWith(prefix);
        return prefix + String.format("%06d", count + 1);
    }

    private void processAttachments(ServiceRequest request, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) return;

        List<ServiceRequestAttachment> attachments = files.stream()
                .filter(file -> !file.isEmpty())
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

        if (!attachments.isEmpty()) {
            attachmentRepository.saveAll(attachments);
            request.getAttachments().addAll(attachments);
        }
    }

    @Transactional
    public void submitRequest(@NonNull Long requestId, @NonNull List<Long> approverIds) {
        ServiceRequest request = getRequest(requestId);
        LocalDateTime deadline = slaService.calculateDeadline(request.getPriority());
        
        List<ServiceRequestApproval> approvalSteps = IntStream.range(0, approverIds.size())
                .mapToObj(i -> {
                    Long approverId = Objects.requireNonNull(approverIds.get(i));
                    Member approver = memberRepository.findById(approverId)
                            .orElseThrow(() -> new IllegalArgumentException("Approver not found: " + approverId));
                    
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
        requestRepository.save(Objects.requireNonNull(request));
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
            requestRepository.save(Objects.requireNonNull(request));
        }
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> listTenantRequests(@NonNull String tenantId) {
        if ("OPER_MSP".equals(tenantId)) {
            return requestRepository.findAll();
        }
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

    @Transactional(readOnly = true)
    public List<String> getManagedTenantIds(String operatorTenantId) {
        List<String> managedTenantIds = tenantRelationRepository.findByOperator_TenantId(operatorTenantId)
                .stream()
                .map(rel -> rel.getCustomer().getTenantId())
                .collect(java.util.stream.Collectors.toList());
        managedTenantIds.add(operatorTenantId);
        return managedTenantIds;
    }

    @Transactional
    public void assignRequest(@NonNull Long requestId, @NonNull Long operatorId) {
        ServiceRequest request = getRequest(requestId);
        Member operator = memberRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
        request.assign(operator);
        requestRepository.save(Objects.requireNonNull(request));
    }

    @Transactional
    public void resolveRequest(@NonNull Long requestId, @NonNull String resolution) {
        ServiceRequest request = getRequest(requestId);
        request.resolve(resolution);
        requestRepository.save(Objects.requireNonNull(request));
    }

    @Transactional
    public void closeRequest(@NonNull Long requestId) {
        ServiceRequest request = getRequest(requestId);
        request.close();
        requestRepository.save(Objects.requireNonNull(request));
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> listRequestsByMember(Member member) {
        String tenantId = member.getTenant().getTenantId();
        boolean isMsp = "OPER_MSP".equals(tenantId);
        
        if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return isMsp ? requestRepository.findAll() : requestRepository.findAllActive();
        }
        
        if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR"))) {
            List<String> managedTenantIds = getManagedTenantIds(tenantId);
            
            return isMsp ? 
                requestRepository.findByTenantIdInIncludingDeleted(managedTenantIds) : 
                requestRepository.findByTenantIdIn(managedTenantIds);
        }
        
        return isMsp ? 
            requestRepository.findAllByTenantIdIncludingDeleted(tenantId) : 
            requestRepository.findByTenantId(tenantId);
    }

    @Transactional(readOnly = true)
    public ServiceRequestAttachment getAttachment(@NonNull Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
    }

    @Transactional
    public void updateRequest(@NonNull Long requestId, @NonNull Member currentMember, @NonNull ServiceRequestDTO.Update dto, List<MultipartFile> files) {
        ServiceRequest request = getRequest(requestId);

        boolean isStaff = currentMember.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isStaff) {
            ServiceRequestStatus s = request.getStatus();
            if (s != ServiceRequestStatus.DRAFT && s != ServiceRequestStatus.PENDING_APPROVAL) {
                throw new IllegalStateException("접수 완료된 요청은 수정할 수 없습니다.");
            }
        }
        
        if (dto.getTitle() != null) request.setTitle(dto.getTitle());
        if (dto.getDescription() != null) request.setDescription(dto.getDescription());
        if (dto.getPriority() != null) request.setPriority(dto.getPriority());
        ServiceRequestStatus oldStatus = request.getStatus();
        if (dto.getStatus() != null) request.setStatus(dto.getStatus());
        if (dto.getResolution() != null) request.setResolution(dto.getResolution());

        // 담당자 재배정: 현재 또는 변경될 상태가 OPEN, IN_PROGRESS인 경우 허용
        if (dto.getAssigneeId() != null && isStaff) {
            ServiceRequestStatus currentTargetStatus = dto.getStatus() != null ? dto.getStatus() : oldStatus;
            if (currentTargetStatus == ServiceRequestStatus.OPEN || currentTargetStatus == ServiceRequestStatus.IN_PROGRESS) {
                Member newAssignee = memberRepository.findById(Objects.requireNonNull(dto.getAssigneeId()))
                        .orElseThrow(() -> new IllegalArgumentException("Assignee not found: " + dto.getAssigneeId()));
                request.setAssignee(newAssignee);
            }
        }

        // 대리 요청자 변경: DRAFT 상태에서만 허용, 동일 고객사 소속 검증
        if (dto.getRequesterId() != null && isStaff) {
            if (oldStatus == ServiceRequestStatus.DRAFT) {
                Member newRequester = memberRepository.findById(Objects.requireNonNull(dto.getRequesterId()))
                        .orElseThrow(() -> new IllegalArgumentException("Requester not found: " + dto.getRequesterId()));
                if (!newRequester.getTenant().getTenantId().equals(request.getTenant().getTenantId())) {
                    throw new SecurityException("Requester must belong to the same tenant as the request.");
                }
                request.setRequester(newRequester);
            }
        }

        // 카탈로그 정보 수정 (DRAFT 전용)
        if (oldStatus == ServiceRequestStatus.DRAFT) {
            if (dto.getCustomCatalogName() != null) {
                request.setCustomCatalogName(dto.getCustomCatalogName());
                request.setCatalog(null);
            } else if (dto.getCatalogId() != null) {
                ServiceCatalog catalog = serviceCatalogRepository.findById(Objects.requireNonNull(dto.getCatalogId()))
                        .orElseThrow(() -> new IllegalArgumentException("Catalog not found: " + dto.getCatalogId()));
                request.setCatalog(catalog);
                request.setCustomCatalogName(null);
            }
        }

        // 기존 첨부파일 삭제: orphanRemoval=true를 활용하기 위해 리스트에서 제거
        if (dto.getDeleteAttachmentIds() != null && !dto.getDeleteAttachmentIds().isEmpty()) {
            request.getAttachments().removeIf(a -> dto.getDeleteAttachmentIds().contains(a.getId()));
        }

        requestRepository.save(Objects.requireNonNull(request));
        processAttachments(request, files);
    }

    @Transactional
    public void deleteRequest(@NonNull Long requestId, @NonNull Member currentMember) {
        ServiceRequest request = getRequest(requestId);
        String tenantId = currentMember.getTenant().getTenantId();
        boolean isMsp = "OPER_MSP".equals(tenantId);

        boolean isStaff = currentMember.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR") || a.getAuthority().equals("ROLE_ADMIN"));

        if (!isStaff && !isMsp) {
            ServiceRequestStatus s = request.getStatus();
            if (s != ServiceRequestStatus.DRAFT) {
                throw new IllegalStateException("진행 중인 요청은 삭제할 수 없습니다.");
            }
        }

        if (isMsp) {
            requestRepository.delete(Objects.requireNonNull(request)); // Physical delete for MSP
        } else {
            request.setIsDeleted(true); // Soft delete for others
            requestRepository.save(Objects.requireNonNull(request));
        }
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequest> searchRequests(Member member, ServiceRequestDTO.Search search) {
        String tenantId = member.getTenant().getTenantId();
        boolean isMsp = "OPER_MSP".equals(tenantId);
        
        int page = search.getPage() != null ? search.getPage() : 0;
        int size = search.getSize() != null ? search.getSize() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<ServiceRequest> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            // 1. Permissions
            if (!isMsp || member.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                if (member.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_OPERATOR"))) {
                    List<String> managedTenantIds = getManagedTenantIds(tenantId);
                    predicates.add(root.get("tenant").get("tenantId").in(managedTenantIds));
                } else {
                    predicates.add(cb.equal(root.get("tenant").get("tenantId"), tenantId));
                }
            }
            
            if (!isMsp) {
                predicates.add(cb.equal(root.get("isDeleted"), false));
            }

            // 2. Filters
            if (search.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), search.getStatus()));
            }
            
            if (search.getTenantId() != null && !search.getTenantId().isEmpty() && !"ALL".equalsIgnoreCase(search.getTenantId())) {
                predicates.add(cb.equal(root.get("tenant").get("tenantId"), search.getTenantId()));
            }

            if (search.getKeyword() != null && !search.getKeyword().trim().isEmpty()) {
                String keyword = search.getKeyword().trim();
                String pattern = "%" + keyword.toLowerCase() + "%";
                
                List<jakarta.persistence.criteria.Predicate> keywordPredicates = new ArrayList<>();
                keywordPredicates.add(cb.like(cb.lower(root.get("title")), pattern));
                keywordPredicates.add(cb.like(cb.lower(root.get("description")), pattern));
                keywordPredicates.add(cb.like(cb.lower(root.get("requester").get("username")), pattern));
                
                // ID 검색 지원 (#SR... 또는 SR... 또는 숫자)
                String rawKeyword = keyword.startsWith("#") ? keyword.substring(1) : keyword;
                if (rawKeyword.startsWith("SR-")) {
                    keywordPredicates.add(cb.equal(root.get("requestNo"), rawKeyword));
                } else if (rawKeyword.matches("\\d+")) {
                    // 숫자인 경우 requestNo의 마지막 부분 또는 requestId 검색
                    keywordPredicates.add(cb.equal(root.get("requestId"), Long.parseLong(rawKeyword)));
                    keywordPredicates.add(cb.like(root.get("requestNo"), "%" + rawKeyword));
                }
                
                predicates.add(cb.or(keywordPredicates.toArray(new jakarta.persistence.criteria.Predicate[0])));
            }

            if (search.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), search.getStartDate()));
            }
            if (search.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), search.getEndDate()));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return requestRepository.findAll(spec, pageable);
    }
}
