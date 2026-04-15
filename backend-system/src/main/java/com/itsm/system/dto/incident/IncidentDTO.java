package com.itsm.system.dto.incident;

import com.itsm.system.domain.incident.IncidentImpact;
import com.itsm.system.domain.incident.IncidentStatus;
import com.itsm.system.domain.incident.IncidentUrgency;
import com.itsm.system.domain.incident.IncidentPriority;
import lombok.*;

import java.time.LocalDateTime;

public class IncidentDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        private String tenantId;
        private String title;
        private String description;
        private IncidentImpact impact;
        private IncidentUrgency urgency;
        private String category;
        private String source;
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
        private String category;
        private String source;
        private String reporterName;
        private String assigneeName;
        private String resolution;
        private LocalDateTime slaDeadline;
        private LocalDateTime createdAt;
    }
}
