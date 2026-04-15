package com.itsm.system.repository.incident;

import com.itsm.system.domain.incident.Incident;
import com.itsm.system.domain.incident.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByTenant_TenantId(String tenantId);
    List<Incident> findByStatusNot(IncidentStatus status);
}
