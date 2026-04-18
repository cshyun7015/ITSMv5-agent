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
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<OperatorDTO> listOperators() {
        return memberRepository.findAll().stream()
                .filter(m -> !m.getIsDeleted())
                .filter(m -> m.getRoles().stream()
                        .anyMatch(r -> r.getRoleId().equals("ROLE_OPERATOR") || r.getRoleId().equals("ROLE_ADMIN")))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OperatorDTO getOperator(Long id) {
        return memberRepository.findById(Objects.requireNonNull(id))
                .filter(m -> !m.getIsDeleted())
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
    }

    @Transactional
    public OperatorDTO createOperator(OperatorDTO dto) {
        // Default to MSP_CORE tenant for operators
        Tenant tenant = tenantRepository.findById("MSP_CORE")
                .orElseThrow(() -> new IllegalArgumentException("Default Tenant not found"));

        Role operatorRole = roleRepository.findByRoleId("ROLE_OPERATOR")
                .orElseThrow(() -> new IllegalArgumentException("ROLE_OPERATOR not found"));

        Member operator = Member.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .tenant(tenant)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .roles(new HashSet<>(Collections.singletonList(operatorRole)))
                .build();

        return convertToDTO(memberRepository.save(Objects.requireNonNull(operator)));
    }

    @Transactional
    public OperatorDTO updateOperator(Long id, OperatorDTO dto) {
        Member operator = memberRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));

        operator.updateInfo(dto.getEmail(), dto.getIsActive());
        
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            operator.updatePassword(passwordEncoder.encode(dto.getPassword()));
        }

        return convertToDTO(memberRepository.save(operator));
    }

    @Transactional
    public void deleteOperator(Long id) {
        Member operator = memberRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Operator not found"));
        
        operator.delete();
        memberRepository.save(operator);
    }

    private OperatorDTO convertToDTO(Member member) {
        return OperatorDTO.builder()
                .memberId(member.getMemberId())
                .username(member.getUsername())
                .email(member.getEmail())
                .tenantId(member.getTenant().getTenantId())
                .tenantName(member.getTenant().getName())
                .isActive(member.getIsActive())
                .createdAt(member.getCreatedAt())
                .updatedAt(member.getUpdatedAt())
                .build();
    }
}
