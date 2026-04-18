package com.itsm.system.service.catalog;

import com.itsm.system.domain.catalog.CatalogCategoryRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.tenant.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogDeploymentServiceTest {

    @Mock
    private ServiceCatalogRepository serviceCatalogRepository;
    @Mock
    private CatalogCategoryRepository catalogCategoryRepository;

    @InjectMocks
    private CatalogDeploymentService catalogDeploymentService;

    private Tenant mspTenant;
    private Tenant customerTenant;
    private ServiceCatalog templateService;

    @BeforeEach
    void setUp() {
        mspTenant = Tenant.builder().tenantId("MSP_CORE").name("MSP Core").type("MSP").build();
        customerTenant = Tenant.builder().tenantId("CUSTOMER_01").name("Customer").type("CUSTOMER").build();
                
        templateService = ServiceCatalog.builder()
                .id(100L)
                .name("VM Provisioning")
                .categoryCode("CAT-001")
                .tenant(mspTenant)
                .isTemplate(true)
                .jsonSchema("{}")
                .build();
    }

    @Test
    @DisplayName("템플릿 서비스를 테넌트에게 정상적으로 배포해야 함")
    void deployTemplateSuccess() {
        // given
        given(serviceCatalogRepository.findById(100L)).willReturn(Optional.of(templateService));

        // when
        catalogDeploymentService.deployTemplate(100L, Objects.requireNonNull(customerTenant));

        // then
        ArgumentCaptor<ServiceCatalog> captor = ArgumentCaptor.forClass(ServiceCatalog.class);
        verify(serviceCatalogRepository).save(Objects.requireNonNull(captor.capture()));
        ServiceCatalog savedService = captor.getValue();

        assertThat(savedService.getName()).isEqualTo(templateService.getName());
        assertThat(savedService.getTenant()).isEqualTo(customerTenant);
        assertThat(savedService.isTemplate()).isFalse();
        assertThat(savedService.getTemplateSourceId()).isEqualTo(100L);
        assertThat(savedService.getCategoryCode()).isEqualTo("CAT-001");
    }

    @Test
    @DisplayName("템플릿 배포 시 카테고리 코드가 정상적으로 복제되어야 함")
    void deployTemplateCategoryCodeSync() {
        // given
        given(serviceCatalogRepository.findById(100L)).willReturn(Optional.of(templateService));
 
        // when
        catalogDeploymentService.deployTemplate(100L, Objects.requireNonNull(customerTenant));
 
        // then
        ArgumentCaptor<ServiceCatalog> captor = ArgumentCaptor.forClass(ServiceCatalog.class);
        verify(serviceCatalogRepository).save(Objects.requireNonNull(captor.capture()));
        ServiceCatalog savedService = captor.getValue();

        assertThat(savedService.getCategoryCode()).isEqualTo(templateService.getCategoryCode());
    }

    @Test
    @DisplayName("템플릿이 아닌 서비스를 배포하려고 하면 예외가 발생해야 함")
    void deployNonTemplateFail() {
        // given
        ServiceCatalog nonTemplate = ServiceCatalog.builder()
                .id(200L)
                .isTemplate(false)
                .build();
        given(serviceCatalogRepository.findById(200L)).willReturn(Optional.of(nonTemplate));

        // when & then
        assertThatThrownBy(() -> catalogDeploymentService.deployTemplate(200L, Objects.requireNonNull(customerTenant)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Target is not a template");
    }

    @Test
    @DisplayName("테넌트별 카탈로그 조회가 정상 동작해야 함")
    void getCatalogForTenant() {
        // given
        List<ServiceCatalog> catalogs = List.of(templateService);
        given(serviceCatalogRepository.findAllByTenant(customerTenant)).willReturn(catalogs);

        // when
        List<ServiceCatalog> result = catalogDeploymentService.getCatalogForTenant(customerTenant);

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("VM Provisioning");
    }
}
