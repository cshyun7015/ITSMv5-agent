package com.itsm.system.domain.member;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    Optional<Member> findByUsername(String username);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    Optional<Member> findByTenant_TenantIdAndUsername(String tenantId, String username);
    java.util.List<Member> findByTenant_TenantIdAndRoles_RoleId(String tenantId, String roleId);
    long countByTeam_TeamId(Long teamId);
}
