package com.itsm.system.service.operator;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.member.Role;
import com.itsm.system.domain.member.RoleRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.operator.OperatorDTO;
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
public class OperatorService {

    private final MemberRepository memberRepository;
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final com.itsm.system.domain.tenant.TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<OperatorDTO> listOperatorsByTenant(String tenantId) {
        List<Member> members;
        if ("MSP_CORE".equals(tenantId)) {
            members = memberRepository.findAll();
        } else {
            // Find ROLE_OPERATOR and ROLE_ADMIN in the specific tenant
            // Note: In MemberRepository we have findByTenant_TenantIdAndRoles_RoleId
            // But for simplicity in service, we filter here or use custom repo methods
            members = memberRepository.findAll().stream()
                    .filter(m -> m.getTenant() != null && m.getTenant().getTenantId().equals(tenantId))
                    .collect(Collectors.toList());
        }

        return members.stream()
                .filter(m -> !m.getIsDeleted())
                .filter(m -> m.getRoles().stream()
                        .anyMatch(r -> r.getRoleId().equals("ROLE_OPERATOR") || r.getRoleId().equals("ROLE_ADMIN")))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OperatorDTO getOperator(Long id, String tenantId) {
        Member operator = memberRepository.findById(Objects.requireNonNull(id))
                .filter(m -> !m.getIsDeleted())
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));

        if (!"MSP_CORE".equals(tenantId) && !operator.getTenant().getTenantId().equals(tenantId)) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied to operator in another tenant");
        }

        return convertToDTO(operator);
    }

    @Transactional
    public OperatorDTO createOperator(OperatorDTO dto, String tenantId) {
        // Allow administrators to specify a different tenant
        String targetTenantId = (("MSP_CORE".equals(tenantId) || "OPER_MSP".equals(tenantId)) && dto.getTenantId() != null)
                ? dto.getTenantId()
                : tenantId;

        Tenant tenant = tenantRepository.findById(Objects.requireNonNull(targetTenantId))
                .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + targetTenantId));

        String roleToAssign = dto.getRoleId() != null ? dto.getRoleId() : "ROLE_OPERATOR";
        Role operatorRole = roleRepository.findByRoleId(roleToAssign)
                .orElseThrow(() -> new IllegalArgumentException(roleToAssign + " not found"));

        Member operator = Member.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .tenant(tenant)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .roles(new HashSet<>(Collections.singletonList(operatorRole)))
                .build();

        if (dto.getTeamId() != null) {
            teamRepository.findById(Objects.requireNonNull(dto.getTeamId()))
                    .ifPresent(operator::updateTeam);
        }

        return convertToDTO(memberRepository.save(Objects.requireNonNull(operator)));
    }

    @Transactional
    public OperatorDTO updateOperator(Long id, OperatorDTO dto, String tenantId) {
        Member operator = memberRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));

        if (!"MSP_CORE".equals(tenantId) && !operator.getTenant().getTenantId().equals(tenantId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot update operator in another tenant");
        }

        operator.updateInfo(dto.getEmail(), dto.getIsActive());
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            operator.updatePassword(passwordEncoder.encode(dto.getPassword()));
        }

        if (dto.getRoleId() != null && !dto.getRoleId().isEmpty()) {
            Role newRole = roleRepository.findByRoleId(dto.getRoleId())
                    .orElseThrow(() -> new IllegalArgumentException("Role not found: " + dto.getRoleId()));
            operator.assignRoles(new HashSet<>(Collections.singletonList(newRole)));
        }

        if (dto.getTeamId() != null) {
            teamRepository.findById(Objects.requireNonNull(dto.getTeamId()))
                    .ifPresent(operator::updateTeam);
        } else if (dto.getTeamId() == null && "null".equals(String.valueOf(dto.getTeamId()))) { // Handle explicit clear if needed
             operator.updateTeam(null);
        }

        return convertToDTO(memberRepository.save(operator));
    }

    @Transactional
    public void deleteOperator(Long id, String tenantId) {
        Member operator = memberRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
        
        if (!"MSP_CORE".equals(tenantId) && !operator.getTenant().getTenantId().equals(tenantId)) {
            throw new org.springframework.security.access.AccessDeniedException("Cannot delete operator in another tenant");
        }

        operator.delete();
        memberRepository.save(operator);
    }

    private OperatorDTO convertToDTO(Member member) {
        String roleId = member.getRoles().stream()
                .map(Role::getRoleId)
                .filter(r -> r.equals("ROLE_ADMIN") || r.equals("ROLE_OPERATOR"))
                .findFirst()
                .orElse("ROLE_OPERATOR");

        return OperatorDTO.builder()
                .memberId(member.getMemberId())
                .username(member.getUsername())
                .email(member.getEmail())
                .roleId(roleId)
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
