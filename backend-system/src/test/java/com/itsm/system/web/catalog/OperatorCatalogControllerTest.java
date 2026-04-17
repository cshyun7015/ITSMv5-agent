package com.itsm.system.web.catalog;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.domain.catalog.CatalogCategoryRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.service.catalog.CatalogDeploymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.test.context.ActiveProfiles("test")
@org.springframework.boot.test.context.SpringBootTest
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
class OperatorCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ServiceCatalogRepository serviceCatalogRepository;
    @MockBean
    private CatalogCategoryRepository catalogCategoryRepository;
    @MockBean
    private CatalogDeploymentService catalogDeploymentService;
    @MockBean
    private TenantRepository tenantRepository;
    @MockBean
    private com.itsm.system.security.jwt.JwtTokenProvider jwtTokenProvider;
    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private Member mspAdmin;
    private Tenant mspTenant;

    @BeforeEach
    void setUp() {
        mspTenant = Tenant.builder().tenantId("MSP_CORE").build();
        mspAdmin = Member.builder()
                .memberId(1L)
                .username("admin")
                .tenant(mspTenant)
                .build();
    }

    @Test
    @DisplayName("MSP 운영자는 모든 템플릿 목록을 조회할 수 있어야 함")
    void getTemplatesSuccess() throws Exception {
        // given
        ServiceCatalog template = ServiceCatalog.builder().id(100L).name("Template 1").isTemplate(true).build();
        given(serviceCatalogRepository.findAllByIsTemplateTrue()).willReturn(List.of(template));

        // when & then
        mockMvc.perform(get("/api/v1/operator/catalog/templates")
                        .with(user(mspAdmin))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Template 1"));
    }

    @Test
    @DisplayName("MSP 소속이 아닌 경우 템플릿 조회가 거부되어야 함")
    void getTemplatesForbidden() throws Exception {
        // given
        Tenant customerTenant = Tenant.builder().tenantId("CUSTOMER_01").build();
        Member customerUser = Member.builder().username("user").tenant(customerTenant).build();

        // when & then
        mockMvc.perform(get("/api/v1/operator/catalog/templates")
                        .with(user(customerUser))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("새로운 템플릿 생성이 정상 동작해야 함")
    void createTemplateSuccess() throws Exception {
        // given
        OperatorCatalogController.CatalogCreateRequest request = new OperatorCatalogController.CatalogCreateRequest();
        request.setName("New Template");
        request.setCategoryCode("CAT-01");
        request.setJsonSchema("{}");

        given(serviceCatalogRepository.save(any(ServiceCatalog.class))).willAnswer(inv -> inv.getArgument(0));

        // when & then
        mockMvc.perform(post("/api/v1/operator/catalog/templates")
                        .with(user(mspAdmin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Template"))
                .andExpect(jsonPath("$.template").value(true));
    }

    @Test
    @DisplayName("특정 테넌트에 템플릿 배포 API 요청 시 정상 응답을 반환해야 함")
    void deployToTenantSuccess() throws Exception {
        // given
        OperatorCatalogController.DeployRequest request = new OperatorCatalogController.DeployRequest();
        request.setTemplateId(100L);
        request.setTargetTenantIds(List.of("CUST01"));

        Tenant targetTenant = Tenant.builder().tenantId("CUST01").build();
        given(tenantRepository.findById("CUST01")).willReturn(Optional.of(targetTenant));

        // when & then
        mockMvc.perform(post("/api/v1/operator/catalog/deploy")
                        .with(user(mspAdmin))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}
