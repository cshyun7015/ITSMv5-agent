package com.itsm.system.web.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.domain.auth.TokenBlacklistRepository;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.auth.LoginRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenBlacklistRepository tokenBlacklistRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String testToken;

    @BeforeEach
    void setUp() throws Exception {
        // 테넌트 생성
        Tenant tenant = Tenant.builder()
                .tenantId("ucomp1")
                .name("Test Tenant")
                .type("CUSTOMER")
                .build();
        tenantRepository.save(tenant);

        // 사용자 생성
        String encodedPassword = passwordEncoder.encode("pwd");
        System.out.println("GENERATED_HASH_FOR_PWD: " + encodedPassword);
        Member member = Member.builder()
                .tenant(tenant)
                .username("user1")
                .password(encodedPassword)
                .email("user1@test.com")
                .build();
        memberRepository.save(member);
    }

    @Test
    void loginSuccess() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setTenantId("ucomp1");
        loginRequest.setUsername("user1");
        loginRequest.setPassword("pwd");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void loginFailure() throws Exception {
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setTenantId("ucomp1");
        loginRequest.setUsername("user1");
        loginRequest.setPassword("wrong-password");

        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutAndAccessDenied() throws Exception {
        // 1. Login to get token
        LoginRequestDTO loginRequest = new LoginRequestDTO();
        loginRequest.setTenantId("ucomp1");
        loginRequest.setUsername("user1");
        loginRequest.setPassword("pwd");

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("accessToken").asText();

        // 2. Validate token works (e.g., access a protected endpoint)
        mockMvc.perform(get("/api/v1/requests/all")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 3. Logout
        mockMvc.perform(post("/api/v1/auth/logout")
                .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 4. Verify token is in blacklist
        assertTrue(tokenBlacklistRepository.existsByToken(token));

        // 5. Access protected endpoint again (should be denied)
        mockMvc.perform(get("/api/v1/requests/all")
                .header("Authorization", "Bearer " + token))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isUnauthorized());
    }
}
