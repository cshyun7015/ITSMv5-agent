package com.itsm.system.service.operator;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.member.Role;
import com.itsm.system.domain.member.RoleRepository;
import com.itsm.system.domain.tenant.*;
import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.dto.tenant.TeamDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerManagementService {

    private final TenantRepository tenantRepository;
    private final TenantRelationRepository tenantRelationRepository;
    private final OrganizationRepository organizationRepository;
    private final TeamRepository teamRepository;
    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<Tenant> listManageableCustomers(String operatorTenantId, List<String> roles) {
        if (roles.contains("ROLE_ADMIN")) {
            return tenantRepository.findAll().stream()
                    .filter(t -> "CUSTOMER".equals(t.getType()))
                    .collect(Collectors.toList());
        }
        
        return tenantRelationRepository.findByOperator_TenantId(operatorTenantId).stream()
                .map(TenantRelation::getCustomer)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Organization> listCustomerOrganizations(String customerTenantId) {
        return organizationRepository.findByTenant_TenantId(customerTenantId);
    }

    @Transactional(readOnly = true)
    public List<TeamDTO> listCustomerTeams(String customerTenantId) {
        return organizationRepository.findByTenant_TenantId(customerTenantId).stream()
                .flatMap(org -> teamRepository.findByOrganization_OrgId(org.getOrgId()).stream())
                .map(this::convertToTeamDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OperatorDTO> listCustomerUsers(String customerTenantId) {
        return memberRepository.findAll().stream()
                .filter(m -> !m.getIsDeleted() && m.getTenant() != null && m.getTenant().getTenantId().equals(customerTenantId))
                .map(this::convertToMemberDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamDTO createCustomerTeam(TeamDTO dto) {
        Organization org = organizationRepository.findById(Objects.requireNonNull(dto.getOrgId()))
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        
        Team team = Team.builder()
                .organization(org)
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        
        return convertToTeamDTO(teamRepository.save(Objects.requireNonNull(team)));
    }

    @Transactional
    public OperatorDTO createCustomerUser(OperatorDTO dto) {
        Tenant tenant = tenantRepository.findById(Objects.requireNonNull(dto.getTenantId()))
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Role userRole = roleRepository.findByRoleId("ROLE_USER")
                .orElseThrow(() -> new IllegalArgumentException("ROLE_USER not found"));

        Member user = Member.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .tenant(tenant)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .roles(new HashSet<>(Collections.singletonList(userRole)))
                .build();

        if (dto.getTeamId() != null) {
            teamRepository.findById(Objects.requireNonNull(dto.getTeamId())).ifPresent(user::updateTeam);
        }

        return convertToMemberDTO(memberRepository.save(Objects.requireNonNull(user)));
    }

    private TeamDTO convertToTeamDTO(Team team) {
        return TeamDTO.builder()
                .teamId(team.getTeamId())
                .orgId(team.getOrganization().getOrgId())
                .orgName(team.getOrganization().getName())
                .name(team.getName())
                .description(team.getDescription())
                .build();
    }

    private OperatorDTO convertToMemberDTO(Member member) {
        return OperatorDTO.builder()
                .memberId(member.getMemberId())
                .username(member.getUsername())
                .email(member.getEmail())
                .roleId(member.getRoles().stream().findFirst().map(Role::getRoleId).orElse("ROLE_USER"))
                .tenantId(member.getTenant().getTenantId())
                .tenantName(member.getTenant().getName())
                .teamId(member.getTeam() != null ? member.getTeam().getTeamId() : null)
                .teamName(member.getTeam() != null ? member.getTeam().getName() : null)
                .isActive(member.getIsActive())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
