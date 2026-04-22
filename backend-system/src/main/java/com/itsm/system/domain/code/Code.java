package com.itsm.system.domain.code;

import com.itsm.system.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(
    name = "codes", 
    schema = "system_mgmt",
    uniqueConstraints = {@UniqueConstraint(name = "uk_code_group_id", columnNames = {"group_id", "code_id"})}
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE codes SET is_deleted = 1 WHERE id = ?")
@org.hibernate.annotations.Where(clause = "is_deleted = 0")
public class Code extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false, length = 50)
    private String groupId;

    @Column(name = "code_id", nullable = false, length = 50)
    private String codeId;

    @Column(name = "code_name", nullable = false, length = 100)
    private String codeName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active")
    private Boolean isActive;
}
