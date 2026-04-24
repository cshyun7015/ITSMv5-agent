package com.itsm.system.domain.change;

import com.itsm.system.domain.common.BaseEntity;
import com.itsm.system.domain.member.Member;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "change_approvals")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ChangeApproval extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long approvalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_id", nullable = false)
    private ChangeRequest changeRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    private Member approver;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(length = 500)
    private String comment;

    public void approve(String comment) {
        this.status = "APPROVED";
        this.comment = comment;
    }

    public void reject(String comment) {
        this.status = "REJECTED";
        this.comment = comment;
    }
}
