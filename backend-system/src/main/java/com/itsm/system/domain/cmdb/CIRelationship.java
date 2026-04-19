package com.itsm.system.domain.cmdb;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ci_relationships")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class CIRelationship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long relId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_ci_id", nullable = false)
    private ConfigurationItem source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_ci_id", nullable = false)
    private ConfigurationItem target;

    @Column(name = "relation_type", nullable = false, length = 50)
    private String relationType; // DEPENDS_ON, RUNS_ON, CONNECTS_TO

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
