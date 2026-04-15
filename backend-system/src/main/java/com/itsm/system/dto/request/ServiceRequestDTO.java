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
    public static class Create {
        private String title;
        private String description;
        private ServiceRequestPriority priority;
        private Long catalogId;
        private String dynamicFields;
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
    public static class Response {
        private Long requestId;
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
        private Long catalogId;
        private String catalogName;
        private String dynamicFields;
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
}
