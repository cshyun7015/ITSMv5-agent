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

    @Setter
    @Column(name = "request_no", unique = true, length = 30)
    private String requestNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Setter
    @Column(nullable = false, length = 200)
    private String title;

    @Setter
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ServiceRequestStatus status = ServiceRequestStatus.DRAFT;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ServiceRequestPriority priority;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Member requester;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Member assignee;

    @Setter
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

    // Manual setters for specific logic
    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }

    public void setRequester(Member requester) {
        this.requester = requester;
    }

    public void setCatalog(ServiceCatalog catalog) {
        this.catalog = catalog;
    }

    public void setDynamicFields(String dynamicFields) {
        this.dynamicFields = dynamicFields;
    }

    public void setStatus(ServiceRequestStatus status) {
        if (this.status == status) return;
        
        this.status = status;
        
        // Update timestamps based on the new status
        LocalDateTime now = LocalDateTime.now();
        if (status == ServiceRequestStatus.OPEN && this.submittedAt == null) {
            this.submittedAt = now;
        } else if (status == ServiceRequestStatus.RESOLVED && this.resolvedAt == null) {
            this.resolvedAt = now;
        } else if (status == ServiceRequestStatus.CLOSED && this.closedAt == null) {
            this.closedAt = now;
        }
    }

    // Status transition methods with validation
    public void submit(LocalDateTime deadline, List<ServiceRequestApproval> approvalSteps) {
        if (this.status != ServiceRequestStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT requests can be submitted. Current: " + this.status);
        }
        this.slaDeadline = deadline;
        this.submittedAt = LocalDateTime.now();
        if (this.priority != null && this.priority.isApprovalRequired() && approvalSteps != null && !approvalSteps.isEmpty()) {
            this.status = ServiceRequestStatus.PENDING_APPROVAL;
            this.approvals.clear();
            this.approvals.addAll(approvalSteps);
        } else {
            this.status = ServiceRequestStatus.OPEN;
        }
    }

    public void approve() {
        if (this.status != ServiceRequestStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only PENDING_APPROVAL requests can be approved.");
        }
        this.status = ServiceRequestStatus.OPEN;
    }

    public void reject() {
        if (this.status != ServiceRequestStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Only PENDING_APPROVAL requests can be rejected.");
        }
        this.status = ServiceRequestStatus.DRAFT;
        this.submittedAt = null;
        this.approvals.clear(); 
    }

    public void assign(Member operator) {
        if (this.status != ServiceRequestStatus.OPEN && this.status != ServiceRequestStatus.IN_PROGRESS) {
            throw new IllegalStateException("Can only assign OPEN or IN_PROGRESS requests.");
        }
        this.assignee = operator;
        this.status = ServiceRequestStatus.IN_PROGRESS;
    }

    public void resolve(String resolution) {
        if (this.status != ServiceRequestStatus.IN_PROGRESS && this.status != ServiceRequestStatus.OPEN) {
            throw new IllegalStateException("Can only resolve OPEN or IN_PROGRESS requests.");
        }
        this.resolution = resolution;
        this.status = ServiceRequestStatus.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
    }

    public void close() {
        if (this.status != ServiceRequestStatus.RESOLVED) {
            throw new IllegalStateException("Only RESOLVED requests can be closed.");
        }
        this.status = ServiceRequestStatus.CLOSED;
        this.closedAt = LocalDateTime.now();
    }
}
