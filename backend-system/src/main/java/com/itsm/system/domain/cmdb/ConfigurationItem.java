package com.itsm.system.domain.cmdb;

import com.itsm.system.domain.common.BaseEntity;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "configuration_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ConfigurationItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ciId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "type_code", nullable = false, length = 50)
    private String typeCode;

    @Column(name = "status_code", nullable = false, length = 50)
    private String statusCode;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private Member owner;

    @Column(length = 200)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    public void updateInfo(String name, String typeCode, String serialNumber, String location, String description) {
        this.name = name;
        this.typeCode = typeCode;
        this.serialNumber = serialNumber;
        this.location = location;
        this.description = description;
    }

    public void updateStatus(String status) {
        this.statusCode = status;
    }

    public void setOwner(Member owner) {
        this.owner = owner;
    }
}
