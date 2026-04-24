-- 1. Tenants 타입 확장을 위한 수정 (이미 VARCHAR(20)이므로 별도 ALTER 없이 INSERT 시 처리 가능하도록 함)

-- 2. Organizations 테이블 생성
CREATE TABLE IF NOT EXISTS `it_organization` (
    `org_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Teams 테이블 생성
CREATE TABLE IF NOT EXISTS `it_team` (
    `team_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `org_id` BIGINT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`org_id`) REFERENCES `it_organization` (`org_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Members 테이블에 team_id 컬럼 추가
ALTER TABLE `members` ADD COLUMN `team_id` BIGINT DEFAULT NULL;
ALTER TABLE `members` ADD FOREIGN KEY (`team_id`) REFERENCES `it_team` (`team_id`);

-- 5. Tenant Relations 테이블 생성 (운영사-고객사 관계)
CREATE TABLE IF NOT EXISTS `it_tenant_relation` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `operator_tenant_id` VARCHAR(50) NOT NULL,
    `customer_tenant_id` VARCHAR(50) NOT NULL,
    `relation_type` VARCHAR(20) DEFAULT 'MANAGEMENT', -- 'MANAGEMENT', 'PARTNERSHIP' 등
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_oper_cust` (`operator_tenant_id`, `customer_tenant_id`),
    FOREIGN KEY (`operator_tenant_id`) REFERENCES `tenants` (`tenant_id`),
    FOREIGN KEY (`customer_tenant_id`) REFERENCES `tenants` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
