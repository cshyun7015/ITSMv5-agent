package com.itsm.system.domain.tenant;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "it_tenant_relation", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"operator_tenant_id", "customer_tenant_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class TenantRelation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_tenant_id", nullable = false)
    private Tenant operator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_tenant_id", nullable = false)
    private Tenant customer;

    @Column(name = "relation_type", length = 20)
    private String relationType; // MANAGEMENT, PARTNERSHIP

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.relationType == null) {
            this.relationType = "MANAGEMENT";
        }
    }
}
