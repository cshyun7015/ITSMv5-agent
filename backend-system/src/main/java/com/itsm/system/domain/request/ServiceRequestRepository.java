package com.itsm.system.domain.request;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.tenant.tenantId = :tenantId AND sr.isDeleted = false")
    List<ServiceRequest> findByTenantId(@Param("tenantId") String tenantId);
}
