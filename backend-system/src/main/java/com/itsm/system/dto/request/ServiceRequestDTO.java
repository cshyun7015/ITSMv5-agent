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
        private LocalDateTime createdAt;
    }
}
