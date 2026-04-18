package com.itsm.system.web.catalog;

import com.itsm.system.domain.catalog.CatalogCategory;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.service.catalog.CatalogDeploymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Objects;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@org.springframework.test.context.ActiveProfiles("test")
@org.springframework.boot.test.context.SpringBootTest
@org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
class TenantCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CatalogDeploymentService catalogDeploymentService;
    @MockBean
    private com.itsm.system.security.jwt.JwtTokenProvider jwtTokenProvider;
    @MockBean
    private org.springframework.security.core.userdetails.UserDetailsService userDetailsService;

    private Member customerUser;
    private Tenant customerTenant;

    @BeforeEach
    void setUp() {
        customerTenant = Tenant.builder().tenantId("CUSTOMER_01").build();
        customerUser = Member.builder()
                .memberId(10L)
                .username("user1")
                .tenant(customerTenant)
                .build();
    }

    @Test
    @DisplayName("고객사 사용자는 본인 테넌트에 할당된 서비스 카탈로그 목록을 조회할 수 있어야 함")
    void getMyCatalogSuccess() throws Exception {
        // given
        CatalogCategory category = CatalogCategory.builder().name("General Service").build();
        ServiceCatalog catalogItem = ServiceCatalog.builder()
                .id(500L)
                .name("Laptop Repair")
                .category(category)
                .tenant(customerTenant)
                .build();

        given(catalogDeploymentService.getCatalogForTenant(customerTenant)).willReturn(List.of(catalogItem));

        // when & then
        var userPostProcessor = user(customerUser);
        if (userPostProcessor == null) {
            throw new IllegalStateException("Failed to create user post processor");
        }
        
        mockMvc.perform(get("/api/v1/catalog")
                        .with(userPostProcessor)
                        .contentType(Objects.requireNonNull(MediaType.APPLICATION_JSON)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(500))
                .andExpect(jsonPath("$[0].name").value("Laptop Repair"))
                .andExpect(jsonPath("$[0].categoryName").value("General Service"));
    }
}
