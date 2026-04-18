package com.itsm.system.web.cmdb;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.config.SecurityConfig;
import com.itsm.system.dto.cmdb.ConfigurationItemDTO;
import com.itsm.system.security.jwt.JwtTokenProvider;
import com.itsm.system.service.cmdb.ConfigurationItemService;
import com.itsm.system.domain.auth.TokenBlacklistRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Objects;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ConfigurationItemController.class)
@Import(SecurityConfig.class)
class ConfigurationItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ConfigurationItemService configurationItemService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    @MockBean
    private TokenBlacklistRepository tokenBlacklistRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "OPERATOR")
    @DisplayName("CI 목록 조회 API 테스트")
    void listCIs_ShouldReturnOk() throws Exception {
        // given
        ConfigurationItemDTO dto = ConfigurationItemDTO.builder().name("Test CI").build();
        given(configurationItemService.listCIs("ocomp1")).willReturn(Arrays.asList(dto));

        // when & then
        mockMvc.perform(get("/api/v1/cis")
                        .param("tenantId", "ocomp1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test CI"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    @DisplayName("CI 생성 API 테스트")
    void createCI_ShouldReturnOk() throws Exception {
        // given
        ConfigurationItemDTO dto = ConfigurationItemDTO.builder().name("New CI").build();
        given(configurationItemService.createCI(any(ConfigurationItemDTO.class))).willReturn(dto);

        // when & then
        mockMvc.perform(post("/api/v1/cis")
                        .with(Objects.requireNonNull(csrf()))
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(dto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New CI"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    @DisplayName("CI 수정 API 테스트")
    void updateCI_ShouldReturnOk() throws Exception {
        // given
        ConfigurationItemDTO dto = ConfigurationItemDTO.builder().name("Updated CI").build();
        given(configurationItemService.updateCI(eq(1L), any(ConfigurationItemDTO.class))).willReturn(dto);

        // when & then
        mockMvc.perform(put("/api/v1/cis/1")
                        .with(Objects.requireNonNull(csrf()))
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                        .content(Objects.requireNonNull(objectMapper.writeValueAsString(dto))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated CI"));
    }

    @Test
    @WithMockUser(roles = "OPERATOR")
    @DisplayName("CI 논리 삭제 API 테스트")
    void deleteCI_Soft_ShouldReturnOk() throws Exception {
        // when & then
        mockMvc.perform(delete("/api/v1/cis/1")
                        .param("hard", "false")
                        .with(Objects.requireNonNull(csrf())))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("CI 물리 삭제 API 테스트")
    void deleteCI_Hard_ShouldReturnOk() throws Exception {
        // when & then
        mockMvc.perform(delete("/api/v1/cis/1")
                        .param("hard", "true")
                        .with(Objects.requireNonNull(csrf())))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("로그인하지 않은 경우 접근 차단 테스트")
    void shouldDenyUnauthenticatedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/cis"))
                .andExpect(status().isForbidden());
    }
}
