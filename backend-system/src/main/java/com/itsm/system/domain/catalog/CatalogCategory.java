package com.itsm.system.domain.catalog;

import com.itsm.system.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "it_catalog_category")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CatalogCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String icon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "is_template")
    private boolean isTemplate;

    public void update(String name, String description, String icon) {
        this.name = name;
        this.description = description;
        this.icon = icon;
    }
}
