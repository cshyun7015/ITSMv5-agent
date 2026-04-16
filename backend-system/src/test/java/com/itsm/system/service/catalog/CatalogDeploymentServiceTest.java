package com.itsm.system.service.catalog;

import com.itsm.system.domain.catalog.CatalogCategory;
import com.itsm.system.domain.catalog.CatalogCategoryRepository;
import com.itsm.system.domain.catalog.ServiceCatalog;
import com.itsm.system.domain.catalog.ServiceCatalogRepository;
import com.itsm.system.domain.tenant.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
    private CatalogCategory templateCategory;
    private ServiceCatalog templateService;

    @BeforeEach
    void setUp() {
        mspTenant = Tenant.builder().tenantId("MSP_CORE").build();
        customerTenant = Tenant.builder().tenantId("CUSTOMER_01").build();
        
        templateCategory = CatalogCategory.builder()
                .id(1L)
                .name("Cloud Services")
                .tenant(mspTenant)
                .isTemplate(true)
                .build();
                
        templateService = ServiceCatalog.builder()
                .id(100L)
                .name("VM Provisioning")
                .category(templateCategory)
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
        given(catalogCategoryRepository.findAllByTenant(customerTenant)).willReturn(Collections.emptyList());
        given(catalogCategoryRepository.save(any(CatalogCategory.class))).willAnswer(inv -> inv.getArgument(0));

        // when
        catalogDeploymentService.deployTemplate(100L, customerTenant);

        // then
        verify(serviceCatalogRepository).save(argThat(service -> {
            assertThat(service.getName()).isEqualTo(templateService.getName());
            assertThat(service.getTenant()).isEqualTo(customerTenant);
            assertThat(service.isTemplate()).isFalse();
            assertThat(service.getTemplateSourceId()).isEqualTo(100L);
            return true;
        }));
        verify(catalogCategoryRepository).save(any(CatalogCategory.class));
    }

    @Test
    @DisplayName("이미 존재하는 카테고리가 있는 경우 새로 생성하지 않고 재사용해야 함")
    void deployTemplateWithExistingCategory() {
        // given
        CatalogCategory existingCategory = CatalogCategory.builder()
                .name("Cloud Services")
                .tenant(customerTenant)
                .build();
                
        given(serviceCatalogRepository.findById(100L)).willReturn(Optional.of(templateService));
        given(catalogCategoryRepository.findAllByTenant(customerTenant)).willReturn(List.of(existingCategory));

        // when
        catalogDeploymentService.deployTemplate(100L, customerTenant);

        // then
        verify(catalogCategoryRepository, never()).save(any(CatalogCategory.class));
        verify(serviceCatalogRepository).save(argThat(service -> {
            assertThat(service.getCategory()).isEqualTo(existingCategory);
            return true;
        }));
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
        assertThatThrownBy(() -> catalogDeploymentService.deployTemplate(200L, customerTenant))
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
