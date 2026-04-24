package com.itsm.system.web.operator;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.service.operator.OperatorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Objects;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OperatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OperatorService operatorService;

    @Autowired
    private ObjectMapper objectMapper;

    private OperatorDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleDTO = OperatorDTO.builder()
                .memberId(1L)
                .username("test_op")
                .email("test@itsm.com")
                .roleId("ROLE_OPERATOR")
                .tenantId("OPER_MSP")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("운영자 목록을 조회할 수 있다")
    @WithMockUser(roles = "ADMIN")
    void listOperators_Success() throws Exception {
        when(operatorService.listOperatorsByTenant("OPER_MSP")).thenReturn(Collections.singletonList(sampleDTO));

        mockMvc.perform(get("/api/v1/operator/operators"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("test_op"));
    }

    @Test
    @DisplayName("새로운 운영자를 생성할 수 있다")
    @WithMockUser(roles = "ADMIN")
    void createOperator_Success() throws Exception {
        when(operatorService.createOperator(any(OperatorDTO.class), eq("OPER_MSP"))).thenReturn(sampleDTO);

        mockMvc.perform(post("/api/v1/operator/operators")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(sampleDTO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("test_op"));
    }

    @Test
    @DisplayName("권한이 없는 사용자는 운영자를 생성할 수 없다")
    @WithMockUser(roles = "USER")
    void createOperator_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/operator/operators")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(sampleDTO))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("운영자 정보를 수정할 수 있다")
    @WithMockUser(roles = "OPERATOR")
    void updateOperator_Success() throws Exception {
        when(operatorService.updateOperator(eq(1L), any(OperatorDTO.class), eq("OPER_MSP"))).thenReturn(sampleDTO);

        mockMvc.perform(put("/api/v1/operator/operators/1")
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(sampleDTO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("test_op"));
    }

    @Test
    @DisplayName("운영자 상세 정보를 조회할 수 있다 (Member Principal 커버리지)")
    void getOperator_WithMemberPrincipal() throws Exception {
        // Create a real Member object for the principal
        com.itsm.system.domain.member.Member memberPrincipal = com.itsm.system.domain.member.Member.builder()
                .username("test_op")
                .tenant(com.itsm.system.domain.tenant.Tenant.builder().tenantId("OPER_MSP").build())
                .roles(Collections.singleton(com.itsm.system.domain.member.Role.builder().roleId("ROLE_OPERATOR").build()))
                .build();

        when(operatorService.getOperator(eq(1L), eq("OPER_MSP"))).thenReturn(sampleDTO);

        mockMvc.perform(get("/api/v1/operator/operators/1")
                        .with(Objects.requireNonNull(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(memberPrincipal))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("test_op"));
    }

    @Test
    @DisplayName("운영자를 삭제할 수 있다")
    @WithMockUser(roles = "ADMIN")
    void deleteOperator_Success() throws Exception {
        mockMvc.perform(delete("/api/v1/operator/operators/1"))
                .andExpect(status().isOk());
    }
}
