package com.itsm.system.domain.cmdb;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CIRelationshipRepository extends JpaRepository<CIRelationship, Long> {

    @Query("SELECT r FROM CIRelationship r JOIN FETCH r.target WHERE r.source.ciId = :ciId")
    List<CIRelationship> findBySourceCiId(@Param("ciId") Long ciId);

    @Query("SELECT r FROM CIRelationship r JOIN FETCH r.source WHERE r.target.ciId = :ciId")
    List<CIRelationship> findByTargetCiId(@Param("ciId") Long ciId);

    void deleteBySourceCiIdAndTargetCiId(Long sourceId, Long targetId);
}
