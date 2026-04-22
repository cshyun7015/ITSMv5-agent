package com.itsm.system.service.operator;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.member.Role;
import com.itsm.system.domain.member.RoleRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.domain.tenant.TeamRepository;
import com.itsm.system.dto.operator.OperatorDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
class OperatorServiceTest {

    @MockBean
    private MemberRepository memberRepository;
    @MockBean
    private RoleRepository roleRepository;
    @MockBean
    private TenantRepository tenantRepository;
    @MockBean
    private TeamRepository teamRepository;
    @MockBean
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OperatorService operatorService;

    private Tenant mspTenant;
    private Tenant customerTenant;
    private Role operatorRole;
    private Member operatorMember;

    @BeforeEach
    void setUp() {
        mspTenant = Tenant.builder().tenantId("OPER_MSP").name("MSP Tenant").type("MSP").build();
        customerTenant = Tenant.builder().tenantId("CUST_001").name("Customer Tenant").type("CUSTOMER").build();
        
        operatorRole = Role.builder().roleId("ROLE_OPERATOR").description("Operator").build();
        
        operatorMember = Member.builder()
                .memberId(1L)
                .username("test_op")
                .email("test@itsm.com")
                .tenant(mspTenant)
                .isActive(true)
                .isDeleted(false)
                .roles(new HashSet<>(Collections.singletonList(operatorRole)))
                .build();
    }

    @Test
    @DisplayName("MSP 운영자는 본인 테넌트의 운영자 목록을 조회할 수 있다")
    void listOperators_MspSuccess() {
        // given
        given(memberRepository.findByTenant_TypeNot("CUSTOMER")).willReturn(Collections.singletonList(operatorMember));

        // when
        List<OperatorDTO> result = operatorService.listOperatorsByTenant("OPER_MSP");

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("test_op");
        verify(memberRepository).findByTenant_TypeNot("CUSTOMER");
    }

    @Test
    @DisplayName("일반 테넌트 운영자는 소속 테넌트의 운영자만 조회할 수 있다")
    void listOperators_RegularTenantSuccess() {
        // given
        given(memberRepository.findByTenant_TenantId("CUST_001")).willReturn(Collections.singletonList(operatorMember));

        // when
        List<OperatorDTO> result = operatorService.listOperatorsByTenant("CUST_001");

        // then
        assertThat(result).hasSize(1);
        verify(memberRepository).findByTenant_TenantId("CUST_001");
    }

    @Test
    @DisplayName("운영자 상세 정보를 조회할 수 있다")
    void getOperator_Success() {
        // given
        given(memberRepository.findById(1L)).willReturn(Optional.of(operatorMember));

        // when
        OperatorDTO result = operatorService.getOperator(1L, "OPER_MSP");

        // then
        assertThat(result.getUsername()).isEqualTo("test_op");
    }

    @Test
    @DisplayName("운영자 생성 시 중복된 아이디가 있으면 예외가 발생한다")
    void createOperator_DuplicateUsername() {
        // given
        OperatorDTO dto = OperatorDTO.builder().username("test_op").build();
        given(memberRepository.existsByUsername("test_op")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> operatorService.createOperator(dto, "OPER_MSP"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("정상적인 정보로 운영자를 생성할 수 있다")
    void createOperator_Success() {
        // given
        OperatorDTO dto = OperatorDTO.builder()
                .username("new_op")
                .password("password")
                .email("new@itsm.com")
                .tenantId("OPER_MSP")
                .build();

        given(memberRepository.existsByUsername("new_op")).willReturn(false);
        given(tenantRepository.findById("OPER_MSP")).willReturn(Optional.of(mspTenant));
        given(roleRepository.findByRoleId("ROLE_OPERATOR")).willReturn(Optional.of(operatorRole));
        given(passwordEncoder.encode("password")).willReturn("encoded_pwd");
        given(memberRepository.save(any(Member.class))).willReturn(operatorMember);

        // when
        OperatorDTO result = operatorService.createOperator(dto, "OPER_MSP");

        // then
        assertThat(result).isNotNull();
        verify(memberRepository).save(any(Member.class));
    }

    @Test
    @DisplayName("운영자 정보를 수정할 수 있다 (비밀번호 및 권한 포함)")
    void updateOperator_FullSuccess() {
        // given
        given(memberRepository.findById(1L)).willReturn(Optional.of(operatorMember));
        given(roleRepository.findByRoleId("ROLE_ADMIN")).willReturn(Optional.of(Role.builder().roleId("ROLE_ADMIN").build()));
        given(passwordEncoder.encode("new_pwd")).willReturn("encoded_new_pwd");
        given(memberRepository.save(any(Member.class))).willReturn(operatorMember);

        OperatorDTO updateDto = OperatorDTO.builder()
                .email("updated@itsm.com")
                .password("new_pwd")
                .roleId("ROLE_ADMIN")
                .isActive(false)
                .build();

        // when
        OperatorDTO result = operatorService.updateOperator(1L, updateDto, "OPER_MSP");

        // then
        assertThat(result).isNotNull();
        verify(memberRepository).save(operatorMember);
    }

    @Test
    @DisplayName("다른 테넌트의 운영자 정보를 수정하려고 하면 거부된다")
    void updateOperator_AccessDenied() {
        // given
        given(memberRepository.findById(1L)).willReturn(Optional.of(operatorMember)); 

        OperatorDTO updateDto = OperatorDTO.builder().email("hack@hack.com").build();

        // when & then
        assertThatThrownBy(() -> operatorService.updateOperator(1L, updateDto, "CUST_001"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("운영자를 논리 삭제할 수 있다")
    void deleteOperator_Success() {
        // given
        given(memberRepository.findById(1L)).willReturn(Optional.of(operatorMember));

        // when
        operatorService.deleteOperator(1L, "OPER_MSP");

        // then
        assertThat(operatorMember.getIsDeleted()).isTrue();
        verify(memberRepository).save(operatorMember);
    }

    @Test
    @DisplayName("다른 테넌트의 운영자를 삭제하려고 하면 거부된다")
    void deleteOperator_AccessDenied() {
        // given
        given(memberRepository.findById(1L)).willReturn(Optional.of(operatorMember));

        // when & then
        assertThatThrownBy(() -> operatorService.deleteOperator(1L, "CUST_001"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("존재하지 않는 운영자를 조회하면 예외가 발생한다")
    void getOperator_NotFound() {
        // given
        given(memberRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> operatorService.getOperator(999L, "OPER_MSP"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("운영자 정보를 수정할 때 팀 정보를 할당하거나 제거할 수 있다")
    void updateOperator_TeamManagement() {
        // given
        com.itsm.system.domain.tenant.Team team = com.itsm.system.domain.tenant.Team.builder()
                .teamId(101L).name("Dev Team").build();
        
        given(memberRepository.findById(1L)).willReturn(Optional.of(operatorMember));
        given(teamRepository.findById(101L)).willReturn(Optional.of(team));
        given(memberRepository.save(any(Member.class))).willReturn(operatorMember);

        // Case 1: Assign Team
        OperatorDTO assignTeamDto = OperatorDTO.builder().teamId(101L).build();
        operatorService.updateOperator(1L, assignTeamDto, "OPER_MSP");
        assertThat(operatorMember.getTeam()).isEqualTo(team);

        // Case 2: Clear Team
        OperatorDTO clearTeamDto = OperatorDTO.builder().teamId(null).build();
        operatorService.updateOperator(1L, clearTeamDto, "OPER_MSP");
        assertThat(operatorMember.getTeam()).isNull();
    }

    @Test
    @DisplayName("MSP 운영자는 다른 테넌트에 운영자를 생성할 수 있다")
    void createOperator_MspPrivilege() {
        // given
        OperatorDTO dto = OperatorDTO.builder()
                .username("msp_created_op")
                .tenantId("CUST_001")
                .build();

        given(memberRepository.existsByUsername("msp_created_op")).willReturn(false);
        given(tenantRepository.findById("CUST_001")).willReturn(Optional.of(customerTenant));
        given(roleRepository.findByRoleId("ROLE_OPERATOR")).willReturn(Optional.of(operatorRole));
        given(memberRepository.save(any(Member.class))).willReturn(operatorMember);

        // when
        operatorService.createOperator(dto, "OPER_MSP");

        // then
        verify(tenantRepository).findById("CUST_001");
    }
}
