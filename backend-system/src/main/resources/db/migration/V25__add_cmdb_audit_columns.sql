-- CMDB 자산 테이블 감사(Audit) 컬럼 추가
ALTER TABLE `configuration_items` 
ADD COLUMN `created_by` VARCHAR(50) AFTER `updated_at`,
ADD COLUMN `updated_by` VARCHAR(50) AFTER `created_by`,
ADD COLUMN `is_deleted` TINYINT(1) DEFAULT 0 AFTER `updated_by`;
