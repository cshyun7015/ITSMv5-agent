-- it_organization 테이블 감사 컬럼 추가
ALTER TABLE `it_organization` 
ADD COLUMN `created_by` VARCHAR(50) AFTER `updated_at`,
ADD COLUMN `updated_by` VARCHAR(50) AFTER `created_by`,
ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 AFTER `updated_by`;

-- it_team 테이블 감사 컬럼 추가
ALTER TABLE `it_team` 
ADD COLUMN `created_by` VARCHAR(50) AFTER `updated_at`,
ADD COLUMN `updated_by` VARCHAR(50) AFTER `created_by`,
ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 AFTER `updated_by`;

-- it_tenant_relation 테이블 감사 컬럼 추가 (updated_at 포함)
ALTER TABLE `it_tenant_relation` 
ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`,
ADD COLUMN `created_by` VARCHAR(50) AFTER `updated_at`,
ADD COLUMN `updated_by` VARCHAR(50) AFTER `created_by`,
ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 AFTER `updated_by`;
