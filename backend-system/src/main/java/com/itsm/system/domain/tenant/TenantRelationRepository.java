package com.itsm.system.domain.tenant;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TenantRelationRepository extends JpaRepository<TenantRelation, Long> {
    List<TenantRelation> findByOperator_TenantId(String operatorTenantId);
}
