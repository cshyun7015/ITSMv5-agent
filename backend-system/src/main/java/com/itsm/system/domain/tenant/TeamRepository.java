package com.itsm.system.domain.tenant;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByOrganization_OrgId(Long orgId);
}
