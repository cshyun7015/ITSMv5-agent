package com.itsm.system.web.code;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.code.CodeDTO;
import com.itsm.system.service.code.CodeService;
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

import java.util.Arrays;
import java.util.Objects;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CodeService codeService;

    @Autowired
    private ObjectMapper objectMapper;

    private CodeDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleDTO = CodeDTO.builder()
                .id(1L)
                .groupId("STATUS")
                .codeId("ACTIVE")
                .codeName("Active")
                .sortOrder(1)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/codes - Success")
    @WithMockUser
    void getAllCodes_Success() throws Exception {
        when(codeService.getAllCodes()).thenReturn(Arrays.asList(sampleDTO));

        mockMvc.perform(get("/api/v1/codes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codeId").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /api/v1/codes/group/{groupId} - Success")
    @WithMockUser
    void getCodesByGroup_Success() throws Exception {
        when(codeService.getCodesByGroup("STATUS")).thenReturn(Arrays.asList(sampleDTO));

        mockMvc.perform(get("/api/v1/codes/group/STATUS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].groupId").value("STATUS"));
    }

    @Test
    @DisplayName("POST /api/v1/codes - Success as ADMIN")
    @WithMockUser(roles = "ADMIN")
    void createCode_Success() throws Exception {
        when(codeService.createCode(Objects.requireNonNull(any(CodeDTO.class)))).thenReturn(sampleDTO);

        mockMvc.perform(post("/api/v1/codes")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(sampleDTO))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codeId").value("ACTIVE"));
    }

    @Test
    @DisplayName("POST /api/v1/codes - Forbidden as USER")
    @WithMockUser(roles = "USER")
    void createCode_Forbidden() throws Exception {
        mockMvc.perform(post("/api/v1/codes")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(sampleDTO))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /api/v1/codes - Validation Error")
    @WithMockUser(roles = "ADMIN")
    void createCode_ValidationError() throws Exception {
        CodeDTO invalidDTO = CodeDTO.builder().groupId("").build(); // Missing required fields

        mockMvc.perform(post("/api/v1/codes")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(invalidDTO))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.groupId").exists());
    }

    @Test
    @DisplayName("PUT /api/v1/codes/{id} - Success as ADMIN")
    @WithMockUser(roles = "ADMIN")
    void updateCode_Success() throws Exception {
        when(codeService.updateCode(eq(1L), Objects.requireNonNull(any(CodeDTO.class)))).thenReturn(sampleDTO);

        mockMvc.perform(put("/api/v1/codes/1")
                .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON))
                .content(Objects.requireNonNull(objectMapper.writeValueAsString(sampleDTO))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("DELETE /api/v1/codes/{id} - Success as ADMIN")
    @WithMockUser(roles = "ADMIN")
    void deleteCode_Success() throws Exception {
        mockMvc.perform(delete("/api/v1/codes/1"))
                .andExpect(status().isNoContent());
    }
}
