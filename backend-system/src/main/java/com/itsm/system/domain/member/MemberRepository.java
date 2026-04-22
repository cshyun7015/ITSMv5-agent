package com.itsm.system.domain.member;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    Optional<Member> findByUsername(String username);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    @org.springframework.lang.NonNull
    java.util.List<Member> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    java.util.List<Member> findByTenant_TenantId(String tenantId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    java.util.List<Member> findByTenant_TypeNot(String type);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tenant", "roles"})
    java.util.Optional<Member> findByTenant_TenantIdAndUsername(String tenantId, String username);

    java.util.List<Member> findByTenant_TenantIdAndRoles_RoleId(String tenantId, String roleId);

    boolean existsByUsername(String username);

    long countByTeam_TeamId(Long teamId);
}
