package com.itsm.system.domain.member;

import com.itsm.system.domain.common.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.Team;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tenant_id", "username"})
})
@org.hibernate.annotations.SQLRestriction("is_deleted = 0")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Member extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long memberId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false, length = 100)
    private String username;

    @JsonIgnore
    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 100)
    private String email;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "member_roles",
            joinColumns = @JoinColumn(name = "member_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getRoleId()))
                .collect(Collectors.toList());
    }

    @Override
    public boolean isAccountNonExpired() { return !isDeleted; }

    @Override
    public boolean isAccountNonLocked() { return isActive; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return isActive && !isDeleted; }

    public void updateInfo(String email, Boolean isActive) {
        this.email = email;
        if (isActive != null) {
            this.isActive = isActive;
        }
    }

    public void updateTeam(Team team) {
        this.team = team;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }

    public void assignRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void delete() {
        this.isDeleted = true;
    }

    public String getTenantId() {
        return this.tenant != null ? this.tenant.getTenantId() : null;
    }
}
