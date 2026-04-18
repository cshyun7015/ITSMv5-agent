package com.itsm.system.dto.change;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChangeRequestDTO {
    private Long changeId;
    private String tenantId;
    private String title;
    private String reason;
    private String description;
    private String statusCode;
    private String typeCode;
    private String priorityCode;
    private String impactCode;
    private String urgencyCode;
    private Long requesterId;
    private String requesterName;
    private Long assigneeId;
    private String assigneeName;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime plannedStartDate;

    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime plannedEndDate;
    private String implementationPlan;
    private String backoutPlan;
    private String testPlan;
    private String affectedCis;
    private String reviewNotes;
    private List<Long> relatedIncidentIds;
    private List<ApprovalDTO> approvals;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ApprovalDTO {
        private Long approvalId;
        private Long approverId;
        private String approverName;
        private Integer stepOrder;
        private String status;
        private String comment;
    }
}
