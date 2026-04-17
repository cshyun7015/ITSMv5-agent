-- codes 테이블 생성
CREATE TABLE IF NOT EXISTS `codes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `group_id` VARCHAR(50) NOT NULL COMMENT '코드 그룹 ID',
    `code_id` VARCHAR(50) NOT NULL COMMENT '상세 코드 ID',
    `code_name` VARCHAR(100) NOT NULL COMMENT '코드 명칭',
    `description` TEXT COMMENT '코드 설명',
    `sort_order` INT COMMENT '정렬 순서',
    `is_active` TINYINT(1) DEFAULT 1 COMMENT '사용 여부',
    `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `created_by` VARCHAR(50) NULL,
    `updated_by` VARCHAR(50) NULL,
    `is_deleted` TINYINT(1) DEFAULT 0 COMMENT '삭제 여부',
    UNIQUE KEY `uk_code_group_id` (`group_id`, `code_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기초 데이터 인서트 (샘플)
INSERT INTO `codes` (group_id, code_id, code_name, description, sort_order) 
VALUES 
('TICKET_PRIORITY', 'P1', 'Critical', '최우선 처리 대상', 1),
('TICKET_PRIORITY', 'P2', 'High', '우선 처리 대상', 2),
('TICKET_PRIORITY', 'P3', 'Normal', '일반 처리 대상', 3),
('SERVICE_TYPE', 'REQ', 'Service Request', '서비스 요청', 1);
