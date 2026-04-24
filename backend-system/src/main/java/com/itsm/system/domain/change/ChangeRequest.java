package com.itsm.system.domain.change;

import com.itsm.system.domain.common.BaseEntity;
import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "change_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChangeRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long changeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "status_code", nullable = false, length = 50)
    private String statusCode;

    @Column(name = "type_code", nullable = false, length = 50)
    private String typeCode;

    @Column(name = "priority_code", nullable = false, length = 50)
    private String priorityCode;

    @Column(name = "impact_code", nullable = false, length = 50)
    private String impactCode;

    @Column(name = "urgency_code", nullable = false, length = 50)
    private String urgencyCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Member requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Member assignee;

    @Column(name = "planned_start_date")
    private LocalDateTime plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDateTime plannedEndDate;

    @Column(name = "implementation_plan", columnDefinition = "TEXT")
    private String implementationPlan;

    @Column(name = "backout_plan", columnDefinition = "TEXT")
    private String backoutPlan;

    @Column(name = "test_plan", columnDefinition = "TEXT")
    private String testPlan;

    @Column(name = "affected_cis", columnDefinition = "TEXT")
    private String affectedCis;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @OneToMany(mappedBy = "changeRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChangeApproval> approvals = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "change_incident_links",
        joinColumns = @JoinColumn(name = "change_id"),
        inverseJoinColumns = @JoinColumn(name = "incident_id")
    )
    @Builder.Default
    private Set<Incident> relatedIncidents = new HashSet<>();

    public void calculatePriority() {
        // High: HIGH, Medium: MEDIUM, Low: LOW (Based on CH_IMPACT/CH_URGENCY codes)
        if ("HIGH".equals(impactCode) && "HIGH".equals(urgencyCode)) {
            this.priorityCode = "P1";
        } else if ("HIGH".equals(impactCode) || "HIGH".equals(urgencyCode)) {
            this.priorityCode = "P2";
        } else if ("LOW".equals(impactCode) && "LOW".equals(urgencyCode)) {
            this.priorityCode = "P4";
        } else {
            this.priorityCode = "P3";
        }
    }

    public void updateBasicInfo(String title, String reason, String description) {
        this.title = title;
        this.reason = reason;
        this.description = description;
    }

    public void updateClassification(String typeCode, String impactCode, String urgencyCode) {
        this.typeCode = typeCode;
        this.impactCode = impactCode;
        this.urgencyCode = urgencyCode;
    }

    public void updatePlanningInfo(LocalDateTime start, LocalDateTime end, String impl, String backout, String test, String cis) {
        this.plannedStartDate = start;
        this.plannedEndDate = end;
        this.implementationPlan = impl;
        this.backoutPlan = backout;
        this.testPlan = test;
        this.affectedCis = cis;
    }

    public void updateReviewNotes(String notes) {
        this.reviewNotes = notes;
    }

    public void updateStatus(String statusCode) {
        this.statusCode = statusCode;
    }

    public void setAssignee(Member assignee) {
        this.assignee = assignee;
    }

    public void addRelatedIncident(Incident incident) {
        this.relatedIncidents.add(incident);
    }
}
