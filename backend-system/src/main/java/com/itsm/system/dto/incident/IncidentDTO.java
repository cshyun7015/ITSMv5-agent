package com.itsm.system.dto.incident;

import com.itsm.system.domain.incident.IncidentImpact;
import com.itsm.system.domain.incident.IncidentStatus;
import com.itsm.system.domain.incident.IncidentUrgency;
import com.itsm.system.domain.incident.IncidentPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class IncidentDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String tenantId;
        
        @NotBlank(message = "Title is required")
        private String title;
        
        @NotBlank(message = "Description is required")
        private String description;
        
        @NotNull(message = "Impact is required")
        private IncidentImpact impact;
        
        @NotNull(message = "Urgency is required")
        private IncidentUrgency urgency;
        
        @NotBlank(message = "Category is required")
        private String category;
        
        private String source;
        @JsonProperty("isMajor")
        private boolean isMajor;
        private String affectedService;
        private IncidentStatus status; // 명시적 상태 변경을 위해 추가
        private Long assigneeId;
        private String resolution;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Resolve {
        private String resolution;
    }

    @Getter
    @Builder
    public static class Response {
        private Long incidentId;
        private String tenantId;
        private String title;
        private String description;
        private IncidentStatus status;
        private IncidentPriority priority;
        private IncidentImpact impact;
        private IncidentUrgency urgency;
        private String category;
        private String source;
        private String reporterName;
        private String assigneeName;
        private Long assigneeId;
        @JsonProperty("isMajor")
        private boolean isMajor;
        private String affectedService;
        private String resolution;
        private LocalDateTime slaDeadline;
        private LocalDateTime createdAt;
        private String syncId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class WorkNoteRequest {
        @NotBlank(message = "Note is required")
        private String note;
    }

    @Getter
    @Builder
    public static class HistoryResponse {
        private Long id;
        private String authorName;
        private String type;
        private String note;
        private String oldValue;
        private String newValue;
        private LocalDateTime createdAt;
    }
}
