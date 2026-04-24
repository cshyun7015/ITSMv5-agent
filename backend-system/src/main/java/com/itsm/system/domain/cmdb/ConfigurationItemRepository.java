package com.itsm.system.domain.cmdb;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfigurationItemRepository extends JpaRepository<ConfigurationItem, Long> {
    
    @Query("SELECT ci FROM ConfigurationItem ci JOIN FETCH ci.tenant t LEFT JOIN FETCH ci.owner o WHERE t.tenantId = :tenantId AND ci.isDeleted = false")
    List<ConfigurationItem> findAllWithDetailsByTenantId(@Param("tenantId") String tenantId);

    @Query("SELECT ci FROM ConfigurationItem ci JOIN FETCH ci.tenant t LEFT JOIN FETCH ci.owner o WHERE t.tenantId = :tenantId")
    List<ConfigurationItem> findAllWithDetailsByTenantIdIncludingDeleted(@Param("tenantId") String tenantId);

    @Query("SELECT ci FROM ConfigurationItem ci JOIN FETCH ci.tenant t LEFT JOIN FETCH ci.owner o WHERE ci.ciId = :id AND ci.isDeleted = false")
    Optional<ConfigurationItem> findByIdWithDetails(@Param("id") Long id);
}
