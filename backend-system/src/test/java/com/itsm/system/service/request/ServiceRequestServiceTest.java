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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceRequestServiceTest {

    @Mock
    private ServiceRequestRepository requestRepository;
    @Mock
    private ServiceRequestApprovalRepository approvalRepository;
    @Mock
    private MemberRepository memberRepository;
    @Mock
    private SlaService slaService;

    @InjectMocks
    private ServiceRequestService serviceRequestService;

    private Tenant tenant;
    private Member requester;
    private Member approver;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().tenantId("TEST_TENANT").build();
        requester = Member.builder().memberId(1L).username("user").tenant(tenant).build();
        approver = Member.builder().memberId(2L).username("approver").tenant(tenant).build();
    }

    @Test
    @DisplayName("긴급(EMERGENCY) 요청 상신 시 결재 대기 상태로 변경되어야 함")
    void submitEmergencyRequest() {
        // given
        ServiceRequest request = ServiceRequest.builder()
                .requestId(100L)
                .status(ServiceRequestStatus.DRAFT)
                .priority(ServiceRequestPriority.EMERGENCY)
                .approvals(new ArrayList<>())
                .build();

        given(requestRepository.findById(100L)).willReturn(Optional.of(request));
        given(memberRepository.findById(2L)).willReturn(Optional.of(approver));
        given(slaService.calculateDeadline(ServiceRequestPriority.EMERGENCY)).willReturn(LocalDateTime.now().plusHours(4));

        // when
        serviceRequestService.submitRequest(100L, List.of(2L));

        // then
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.PENDING_APPROVAL);
        assertThat(request.getApprovals()).hasSize(1);
        verify(requestRepository).save(any(ServiceRequest.class));
    }

    @Test
    @DisplayName("낮음(LOW) 요청 상신 시 결재 없이 즉시 접수(OPEN) 상태로 변경되어야 함")
    void submitLowRequest() {
        // given
        ServiceRequest request = ServiceRequest.builder()
                .requestId(101L)
                .status(ServiceRequestStatus.DRAFT)
                .priority(ServiceRequestPriority.LOW)
                .approvals(new ArrayList<>())
                .build();

        given(requestRepository.findById(101L)).willReturn(Optional.of(request));
        given(slaService.calculateDeadline(ServiceRequestPriority.LOW)).willReturn(LocalDateTime.now().plusDays(3));

        // when
        serviceRequestService.submitRequest(101L, Collections.emptyList());

        // then
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.OPEN);
        assertThat(request.getApprovals()).isEmpty();
    }

    @Test
    @DisplayName("결재 반려 시 요청은 다시 DRAFT 상태로 돌아가야 함")
    void processRejection() {
        // given
        ServiceRequest request = ServiceRequest.builder()
                .requestId(102L)
                .status(ServiceRequestStatus.PENDING_APPROVAL)
                .build();

        ServiceRequestApproval approval = ServiceRequestApproval.builder()
                .approvalId(1L)
                .serviceRequest(request)
                .approver(approver)
                .status(ServiceRequestApproval.ApprovalStatus.PENDING)
                .build();

        given(approvalRepository.findById(1L)).willReturn(Optional.of(approval));

        // when
        serviceRequestService.processApproval(1L, 2L, false, "Rejection reason");

        // then
        assertThat(request.getStatus()).isEqualTo(ServiceRequestStatus.DRAFT);
        assertThat(approval.getStatus()).isEqualTo(ServiceRequestApproval.ApprovalStatus.REJECTED);
        verify(approvalRepository).save(any(ServiceRequestApproval.class));
    }
}
