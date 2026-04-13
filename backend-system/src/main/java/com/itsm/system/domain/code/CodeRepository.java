package com.itsm.system.domain.code;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CodeRepository extends JpaRepository<Code, Long> {
    List<Code> findByGroupId(String groupId);
    List<Code> findByIsActiveTrueOrderBySortOrderAsc();
}
