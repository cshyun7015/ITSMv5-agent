package com.itsm.system.domain.tenant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TenantRelationRepository extends JpaRepository<TenantRelation, Long> {
    List<TenantRelation> findByOperator_TenantId(String operatorTenantId);
}
