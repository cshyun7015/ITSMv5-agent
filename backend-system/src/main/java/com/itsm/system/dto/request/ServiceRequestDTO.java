package com.itsm.system.dto.request;

import com.itsm.system.domain.request.ServiceRequestPriority;
import com.itsm.system.domain.request.ServiceRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class ServiceRequestDTO {

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Search {
        private ServiceRequestStatus status;
        private String tenantId;
        private String keyword;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Integer page;
        private Integer size;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Create {
        private String title;
        private String description;
        private ServiceRequestPriority priority;
        private Long catalogId;
        private String dynamicFields;
        private String targetTenantId; // 운영자용: 대상 고객사
        private Long requesterId;      // 운영자용: 대행 신청자 (선택)
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Update {
        private String title;
        private String description;
        private ServiceRequestPriority priority;
        private ServiceRequestStatus status;
        private String resolution;
        private Long assigneeId;   // 담당자 재배정
        private Long requesterId;  // 대리 요청자 변경 (DRAFT only)
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Submit {
        private List<Long> approverIds;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Approve {
        private boolean approved;
        private String comment;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Resolve {
        private String resolution;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long requestId;
        private String requestNo;
        private String tenantId;
        private String title;
        private String description;
        private ServiceRequestStatus status;
        private ServiceRequestPriority priority;
        private LocalDateTime slaDeadline;
        private String requesterName;
        private String assigneeName;
        private String resolution;
        private LocalDateTime createdAt;
        private LocalDateTime submittedAt;
        private LocalDateTime resolvedAt;
        private LocalDateTime closedAt;
        private Long catalogId;
        private String catalogName;
        private String dynamicFields;
        private List<AttachmentInfo> attachments;

        public static Response fromEntity(com.itsm.system.domain.request.ServiceRequest request) {
            return Response.builder()
                    .requestId(request.getRequestId())
                    .requestNo(request.getRequestNo())
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
                    .submittedAt(request.getSubmittedAt())
                    .resolvedAt(request.getResolvedAt())
                    .closedAt(request.getClosedAt())
                    .catalogId(request.getCatalog() != null ? request.getCatalog().getId() : null)
                    .catalogName(request.getCatalog() != null ? request.getCatalog().getName() : null)
                    .dynamicFields(request.getDynamicFields())
                    .attachments(request.getAttachments().stream()
                            .map(a -> AttachmentInfo.builder()
                                    .id(a.getId())
                                    .fileName(a.getFileName())
                                    .fileSize(a.getFileSize())
                                    .build())
                            .toList())
                    .build();
        }
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentInfo {
        private Long id;
        private String fileName;
        private Long fileSize;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalResponse {
        private Long approvalId;
        private String approverName;
        private String status;
        private Integer stepOrder;
        private String comment;
        private LocalDateTime updatedAt;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginatedResponse<T> {
        private List<T> content;
        private long totalElements;
        private int totalPages;
        private int size;
        private int number;
    }
}
