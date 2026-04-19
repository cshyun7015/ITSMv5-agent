-- CI 간 연관 관계(Dependency)를 관리하기 위한 테이블 생성
CREATE TABLE IF NOT EXISTS `ci_relationships` (
    `rel_id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `source_ci_id` BIGINT NOT NULL,
    `target_ci_id` BIGINT NOT NULL,
    `relation_type` VARCHAR(50) NOT NULL COMMENT '연계 유형 (DEPENDS_ON, RUNS_ON, CONNECTS_TO)',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rel_source` FOREIGN KEY (`source_ci_id`) REFERENCES `configuration_items` (`ci_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rel_target` FOREIGN KEY (`target_ci_id`) REFERENCES `configuration_items` (`ci_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
