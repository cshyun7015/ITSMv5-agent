package com.itsm.system.domain.request;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
    @EntityGraph(attributePaths = {"tenant", "requester", "assignee", "catalog", "attachments"})
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.tenant.tenantId = :tenantId AND sr.isDeleted = false")
    List<ServiceRequest> findByTenantId(@Param("tenantId") String tenantId);

    @EntityGraph(attributePaths = {"tenant", "requester", "assignee", "catalog", "attachments"})
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.tenant.tenantId = :tenantId")
    List<ServiceRequest> findAllByTenantIdIncludingDeleted(@Param("tenantId") String tenantId);

    @EntityGraph(attributePaths = {"tenant", "requester", "assignee", "catalog", "attachments"})
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.tenant.tenantId IN :tenantIds AND sr.isDeleted = false")
    List<ServiceRequest> findByTenantIdIn(@Param("tenantIds") List<String> tenantIds);

    @EntityGraph(attributePaths = {"tenant", "requester", "assignee", "catalog", "attachments"})
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.tenant.tenantId IN :tenantIds")
    List<ServiceRequest> findByTenantIdInIncludingDeleted(@Param("tenantIds") List<String> tenantIds);

    @EntityGraph(attributePaths = {"tenant", "requester", "assignee", "catalog", "attachments"})
    @Query("SELECT sr FROM ServiceRequest sr WHERE sr.isDeleted = false")
    List<ServiceRequest> findAllActive();

    @EntityGraph(attributePaths = {"tenant", "requester", "assignee", "catalog", "attachments"})
    @Override
    @org.springframework.lang.NonNull
    List<ServiceRequest> findAll();

    boolean existsByCatalogId(Long catalogId);
}
