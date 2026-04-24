package com.itsm.system.service.request;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.request.*;
import com.itsm.system.domain.tenant.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceRequestServiceTest {

    @Mock private ServiceRequestRepository requestRepository;
    @Mock private MemberRepository memberRepository;
    @Mock private ServiceRequestApprovalRepository approvalRepository;
    @Mock private SlaService slaService;

    @InjectMocks
    private ServiceRequestService serviceRequestService;

    private Tenant customerTenant;
    private Tenant mspTenant;
    private Member customerUser;
    private Member mspAdmin;

    @BeforeEach
    void setUp() {
        customerTenant = Tenant.builder().tenantId("CUST_001").name("Customer").build();
        mspTenant = Tenant.builder().tenantId("OPER_MSP").name("MSP Center").build();

        customerUser = mock(Member.class);
        lenient().when(customerUser.getTenant()).thenReturn(customerTenant);
        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> auths = 
                java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_USER"));
        lenient().doReturn(auths).when(customerUser).getAuthorities();

        mspAdmin = mock(Member.class);
        lenient().when(mspAdmin.getTenant()).thenReturn(mspTenant);
        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> mspAuths = 
                java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
        lenient().doReturn(mspAuths).when(mspAdmin).getAuthorities();
    }

    @Test
    @DisplayName("일반 테넌트 사용자가 삭제 요청 시 소프트 삭제가 수행되어야 한다")
    void deleteRequest_SoftDeleteForRegularTenant() {
        // given
        Long requestId = 1L;
        ServiceRequest request = ServiceRequest.builder()
                .requestId(requestId)
                .tenant(customerTenant)
                .status(ServiceRequestStatus.DRAFT)
                .build();
        given(requestRepository.findById(requestId)).willReturn(Optional.of(request));

        // when
        serviceRequestService.deleteRequest(requestId, Objects.requireNonNull(customerUser));

        // then
        assertThat(request.getIsDeleted()).isTrue();
        verify(requestRepository, never()).delete(Objects.requireNonNull(any(ServiceRequest.class)));
        verify(requestRepository).save(Objects.requireNonNull(request));
    }

    @Test
    @DisplayName("MSP 테넌트 사용자가 삭제 요청 시 물리적 삭제가 수행되어야 한다")
    void deleteRequest_PhysicalDeleteForMsp() {
        // given
        Long requestId = 1L;
        ServiceRequest request = ServiceRequest.builder()
                .requestId(requestId)
                .tenant(customerTenant)
                .status(ServiceRequestStatus.OPEN)
                .build();
        given(requestRepository.findById(requestId)).willReturn(Optional.of(request));

        // when
        serviceRequestService.deleteRequest(requestId, Objects.requireNonNull(mspAdmin));

        // then
        verify(requestRepository).delete(Objects.requireNonNull(request));
        verify(requestRepository, never()).save(Objects.requireNonNull(any(ServiceRequest.class)));
    }

    @Test
    @DisplayName("잘못된 상태 전이 시 예외가 발생해야 한다 (DRAFT가 아닌 상태에서 SUBMIT)")
    void submitRequest_InvalidStatus() {
        // given
        Long requestId = 1L;
        Long approverId = 2L;
        ServiceRequest request = ServiceRequest.builder()
                .requestId(requestId)
                .tenant(customerTenant)
                .status(ServiceRequestStatus.OPEN)
                .build();
        given(requestRepository.findById(requestId)).willReturn(Optional.of(request));
        
        Member approver = mock(Member.class);
        given(approver.getTenant()).willReturn(customerTenant);
        given(memberRepository.findById(approverId)).willReturn(Optional.of(approver));

        // when & then
        assertThatThrownBy(() -> serviceRequestService.submitRequest(requestId, Objects.requireNonNull(List.of(approverId))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only DRAFT requests can be submitted");
    }

    @Test
    @DisplayName("MSP 관리자는 삭제된 항목을 포함하여 모든 요청을 조회할 수 있어야 한다")
    void listRequestsByMember_MspSeesAll() {
        // when
        serviceRequestService.listRequestsByMember(mspAdmin);

        // then
        verify(requestRepository).findAll();
        verify(requestRepository, never()).findAllActive();
    }

    @Test
    @DisplayName("일반 관리자는 활성 상태의 요청만 조회할 수 있어야 한다")
    void listRequestsByMember_RegularAdminSeesActiveOnly() {
        // given
        Member regularAdmin = mock(Member.class);
        given(regularAdmin.getTenant()).willReturn(customerTenant);
        java.util.Collection<? extends org.springframework.security.core.GrantedAuthority> auths = 
                java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"));
        doReturn(auths).when(regularAdmin).getAuthorities();

        // when
        serviceRequestService.listRequestsByMember(regularAdmin);

        // then
        verify(requestRepository).findAllActive();
        verify(requestRepository, never()).findAll();
    }
}
