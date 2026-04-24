package com.itsm.system.domain.incident;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    @EntityGraph(attributePaths = {"author", "incident", "incident.tenant"})
    List<IncidentHistory> findByIncidentOrderByCreatedAtDesc(Incident incident);
    List<IncidentHistory> findByIncidentOrderByCreatedAtAsc(Incident incident);
    
    @EntityGraph(attributePaths = {"author", "incident", "incident.tenant"})
    List<IncidentHistory> findTop15ByIncidentInOrderByCreatedAtDesc(List<Incident> incidents);
}
