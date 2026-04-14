package com.itsm.system.web.request;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.request.ServiceRequestPriority;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.request.ServiceRequestDTO;
import com.itsm.system.security.jwt.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ServiceRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private MemberRepository memberRepository;

    private String token;
    private Long memberId;

    @BeforeEach
    void setUp() {
        // 기존 데이터가 있을 수 있으므로 조회하거나 새로 생성
        Tenant tenant = tenantRepository.findById("MSP_CORE")
                .orElseGet(() -> tenantRepository.save(Tenant.builder().tenantId("MSP_CORE").name("MSP Core").build()));

        Member admin = memberRepository.findAll().stream()
                .filter(m -> m.getUsername().equals("admin"))
                .findFirst()
                .orElseGet(() -> memberRepository.save(Member.builder()
                        .username("admin")
                        .password("password")
                        .tenant(tenant)
                        .isActive(true)
                        .build()));

        memberId = admin.getMemberId();
        token = "Bearer " + jwtTokenProvider.createToken("admin", "MSP_CORE", List.of("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("인증된 사용자는 서비스 요청 Draft를 생성할 수 있어야 함")
    void createRequestSuccess() throws Exception {
        ServiceRequestDTO.Create createDto = ServiceRequestDTO.Create.builder()
                .title("Network Issue")
                .description("Internet is slow")
                .priority(ServiceRequestPriority.NORMAL)
                .build();

        mockMvc.perform(post("/api/v1/requests")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Network Issue"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    @DisplayName("인증 없이 요청 시 403 Forbidden을 반환해야 함")
    void createRequestUnauthorized() throws Exception {
        ServiceRequestDTO.Create createDto = ServiceRequestDTO.Create.builder()
                .title("Should Fail")
                .priority(ServiceRequestPriority.LOW)
                .build();

        mockMvc.perform(post("/api/v1/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("본인의 테넌트 요청 목록을 조회할 수 있어야 함")
    void listRequestsSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/requests")
                        .header("Authorization", token))
                .andExpect(status().isOk());
    }
}
