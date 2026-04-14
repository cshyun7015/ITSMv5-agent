package com.itsm.system.domain.tenant;

import com.itsm.system.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tenants")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Tenant extends BaseEntity {

    @Id
    @Column(name = "tenant_id", length = 50)
    private String tenantId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String type; // MSP, CUSTOMER

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;
}
