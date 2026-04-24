package com.itsm.system.repository.incident;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.incident.IncidentStatus;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByTenant_TenantId(String tenantId);
    List<Incident> findByStatusNot(IncidentStatus status);
    @Query("SELECT i FROM Incident i ORDER BY i.createdAt DESC")
    List<Incident> findAllByOrderByCreatedAtDesc();

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "UPDATE incidents SET status = :status WHERE incident_id = :id", nativeQuery = true)
    void updateStatusNative(@org.springframework.data.repository.query.Param("id") Long id, @org.springframework.data.repository.query.Param("status") String status);
}
