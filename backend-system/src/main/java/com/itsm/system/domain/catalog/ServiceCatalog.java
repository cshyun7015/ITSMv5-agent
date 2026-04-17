package com.itsm.system.domain.catalog;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.itsm.system.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "it_service_catalog")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ServiceCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    private String icon;

    @JsonIgnore
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CatalogCategory category;

    @Column(name = "category_code", length = 50)
    private String categoryCode;

    @Lob
    @Column(name = "json_schema", columnDefinition = "LONGTEXT")
    private String jsonSchema;

    @Column(name = "approval_required")
    private boolean approvalRequired;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "is_template")
    private boolean isTemplate;

    @Column(name = "template_source_id")
    private Long templateSourceId;

    public void update(String name, String description, String icon, String jsonSchema, boolean approvalRequired, String categoryCode) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.jsonSchema = jsonSchema;
        this.approvalRequired = approvalRequired;
        this.categoryCode = categoryCode;
    }
}
