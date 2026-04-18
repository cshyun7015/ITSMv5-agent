package com.itsm.system.domain.cmdb;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.domain.tenant.TenantRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ConfigurationItemRepositoryTest {

    @Autowired
    private ConfigurationItemRepository configurationItemRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private MemberRepository memberRepository;

    private Tenant testTenant;
    private Member testMember;

    @BeforeEach
    void setUp() {
        testTenant = Tenant.builder()
                .tenantId("REPO_TEST_TENANT")
                .name("Repo Test Tenant")
                .type("CUSTOMER")
                .build();
        tenantRepository.save(Objects.requireNonNull(testTenant));

        testMember = Member.builder()
                .tenant(testTenant)
                .username("repo-tester")
                .password("pwd")
                .build();
        memberRepository.save(Objects.requireNonNull(testMember));
    }

    @Test
    @DisplayName("테넌트별 CI 목록 조회 시 삭제된 항목은 제외되어야 한다")
    void findAllWithDetailsByTenantId_ShouldFilterDeletedItems() {
        // given
        ConfigurationItem activeCI = ConfigurationItem.builder()
                .name("Active Server")
                .typeCode("SERVER")
                .statusCode("ACTIVE")
                .tenant(testTenant)
                .owner(testMember)
                .build();
        
        ConfigurationItem deletedCI = ConfigurationItem.builder()
                .name("Deleted Server")
                .typeCode("SERVER")
                .statusCode("RETIRED")
                .tenant(testTenant)
                .owner(testMember)
                .build();
        deletedCI.setIsDeleted(true);

        configurationItemRepository.save(Objects.requireNonNull(activeCI));
        configurationItemRepository.save(Objects.requireNonNull(deletedCI));

        // when
        List<ConfigurationItem> result = configurationItemRepository.findAllWithDetailsByTenantId("REPO_TEST_TENANT");

        // then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Active Server");
    }

    @Test
    @DisplayName("ID로 상세 조회 시 삭제된 항목은 찾을 수 없어야 한다")
    void findByIdWithDetails_ShouldNotReturnDeletedItem() {
        // given
        ConfigurationItem deletedCI = ConfigurationItem.builder()
                .name("Hidden Server")
                .typeCode("SERVER")
                .statusCode("RETIRED")
                .tenant(testTenant)
                .owner(testMember)
                .build();
        deletedCI.setIsDeleted(true);
        ConfigurationItem saved = configurationItemRepository.save(Objects.requireNonNull(deletedCI));

        // when
        Optional<ConfigurationItem> result = configurationItemRepository.findByIdWithDetails(saved.getCiId());

        // then
        assertThat(result).isEmpty();
    }
}
