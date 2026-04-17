package com.itsm.system.domain.request;

import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.common.BaseEntity;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "service_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ServiceRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ServiceRequestStatus status = ServiceRequestStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceRequestPriority priority;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Member requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Member assignee;

    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    @OneToMany(mappedBy = "serviceRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceRequestApproval> approvals = new ArrayList<>();

    @OneToMany(mappedBy = "serviceRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceRequestAttachment> attachments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id")
    private ServiceCatalog catalog;

    @Lob
    @Column(name = "dynamic_fields", columnDefinition = "LONGTEXT")
    private String dynamicFields;

    // Status transition methods
    public void submit(LocalDateTime deadline, List<ServiceRequestApproval> approvalSteps) {
        this.slaDeadline = deadline;
        if (this.priority.isApprovalRequired() && !approvalSteps.isEmpty()) {
            this.status = ServiceRequestStatus.PENDING_APPROVAL;
            this.approvals.addAll(approvalSteps);
        } else {
            this.status = ServiceRequestStatus.OPEN;
        }
    }

    public void approve() {
        this.status = ServiceRequestStatus.OPEN;
    }

    public void reject() {
        this.status = ServiceRequestStatus.DRAFT;
        this.approvals.clear(); // Clear approval lines for re-submission
    }

    public void assign(Member operator) {
        this.assignee = operator;
        this.status = ServiceRequestStatus.IN_PROGRESS;
    }

    public void resolve(String resolution) {
        this.resolution = resolution;
        this.status = ServiceRequestStatus.RESOLVED;
    }

    public void close() {
        this.status = ServiceRequestStatus.CLOSED;
    }
}
