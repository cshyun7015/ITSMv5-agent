package com.itsm.system.service.cmdb;

import com.itsm.system.domain.cmdb.ConfigurationItem;
import com.itsm.system.domain.cmdb.ConfigurationItemRepository;
import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import com.itsm.system.dto.cmdb.ConfigurationItemDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ConfigurationItemServiceTest {

    @Mock
    private ConfigurationItemRepository configurationItemRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private MemberRepository memberRepository;

    @InjectMocks
    private ConfigurationItemService configurationItemService;

    private Tenant testTenant;
    private Member testMember;
    private ConfigurationItem testCI;

    @BeforeEach
    void setUp() {
        testTenant = Tenant.builder().tenantId("TEST_TENANT").name("Test Tenant").build();
        testMember = Member.builder().memberId(1L).username("testuser").build();
        testCI = ConfigurationItem.builder()
                .ciId(1L)
                .name("Test CI")
                .typeCode("SERVER")
                .tenant(testTenant)
                .owner(testMember)
                .build();
    }

    @Test
    @DisplayName("CI 목록 조회 테스트")
    void listCIs_ShouldReturnDTOList() {
        // given
        given(configurationItemRepository.findAllWithDetailsByTenantId("TEST_TENANT"))
                .willReturn(Arrays.asList(testCI));

        // when
        List<ConfigurationItemDTO> result = configurationItemService.listCIs("TEST_TENANT");

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test CI");
        assertThat(result.get(0).getTenantName()).isEqualTo("Test Tenant");
    }

    @Test
    @DisplayName("CI 단건 조회 테스트")
    void getCI_ShouldReturnDTO() {
        // given
        given(configurationItemRepository.findByIdWithDetails(1L)).willReturn(Optional.of(testCI));

        // when
        ConfigurationItemDTO result = configurationItemService.getCI(1L);

        // then
        assertThat(result.getName()).isEqualTo("Test CI");
    }

    @Test
    @DisplayName("CI 생성 테스트")
    void createCI_ShouldSaveAndReturnDTO() {
        // given
        ConfigurationItemDTO dto = ConfigurationItemDTO.builder()
                .name("New CI")
                .typeCode("NETWORK")
                .statusCode("ACTIVE")
                .tenantId("TEST_TENANT")
                .ownerId(1L)
                .build();

        given(tenantRepository.findById("TEST_TENANT")).willReturn(Optional.of(testTenant));
        given(memberRepository.findById(1L)).willReturn(Optional.of(testMember));
        given(configurationItemRepository.save(Objects.requireNonNull(any(ConfigurationItem.class)))).willReturn(testCI);

        // when
        ConfigurationItemDTO result = configurationItemService.createCI(dto);

        // then
        assertThat(result).isNotNull();
        verify(configurationItemRepository).save(Objects.requireNonNull(any(ConfigurationItem.class)));
    }

    @Test
    @DisplayName("CI 수정 테스트")
    void updateCI_ShouldUpdateAndReturnDTO() {
        // given
        ConfigurationItemDTO dto = ConfigurationItemDTO.builder()
                .name("Updated CI")
                .build();

        given(configurationItemRepository.findById(1L)).willReturn(Optional.of(testCI));
        given(configurationItemRepository.save(Objects.requireNonNull(any(ConfigurationItem.class)))).willReturn(testCI);

        // when
        ConfigurationItemDTO result = configurationItemService.updateCI(1L, dto);

        // then
        assertThat(result).isNotNull();
        verify(configurationItemRepository).save(Objects.requireNonNull(any(ConfigurationItem.class)));
    }

    @Test
    @DisplayName("미존재 CI 조회 시 예외 발생 테스트")
    void getCI_ShouldThrowException_WhenNotFound() {
        // given
        given(configurationItemRepository.findByIdWithDetails(99L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> configurationItemService.getCI(99L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("CI 삭제 테스트")
    void deleteCI_ShouldCallRepositoryDelete() {
        // when
        configurationItemService.deleteCI(1L);

        // then
        verify(configurationItemRepository).deleteById(1L);
    }
}
