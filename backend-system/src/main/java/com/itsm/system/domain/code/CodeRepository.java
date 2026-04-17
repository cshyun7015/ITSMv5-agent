package com.itsm.system.domain.code;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepository extends JpaRepository<Code, Long> {
    List<Code> findByGroupId(String groupId);
    java.util.Optional<Code> findByGroupIdAndCodeId(String groupId, String codeId);
    List<Code> findByIsActiveTrueOrderBySortOrderAsc();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT c.groupId FROM Code c WHERE c.isDeleted = false")
    List<String> findDistinctGroupIds();
}
