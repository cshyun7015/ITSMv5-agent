package com.itsm.system.domain.incident;

import com.itsm.system.domain.common.BaseEntity;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Incident extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long incidentId;

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
    private IncidentStatus status = IncidentStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentImpact impact;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentUrgency urgency;

    @Column(length = 50)
    private String category;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Member reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignee_id")
    private Member assignee;

    @Column(name = "source", length = 30)
    @Builder.Default
    private String source = "USER";

    @Column(name = "resolution", columnDefinition = "TEXT")
    private String resolution;

    /**
     * ITIL 우선순위 매트릭스 기반 초기 설정
     */
    public void calculatePriority() {
        if (impact == IncidentImpact.HIGH && urgency == IncidentUrgency.HIGH) {
            this.priority = IncidentPriority.P1;
        } else if (impact == IncidentImpact.HIGH || urgency == IncidentUrgency.HIGH) {
            this.priority = IncidentPriority.P2;
        } else if (impact == IncidentImpact.LOW && urgency == IncidentUrgency.LOW) {
            this.priority = IncidentPriority.P4;
        } else {
            this.priority = IncidentPriority.P3;
        }
        
        this.slaDeadline = LocalDateTime.now().plusHours(this.priority.getTargetHours());
    }

    public void assign(Member specialist) {
        this.assignee = specialist;
        this.status = IncidentStatus.ASSIGNED;
    }

    public void startProgress() {
        this.status = IncidentStatus.IN_PROGRESS;
    }

    public void resolve(String resolution) {
        this.resolution = resolution;
        this.status = IncidentStatus.RESOLVED;
    }

    public void close() {
        this.status = IncidentStatus.CLOSED;
    }
}
