-- V6__create_incident_schema.sql
CREATE TABLE IF NOT EXISTS incidents (
    incident_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    impact VARCHAR(20) NOT NULL,
    urgency VARCHAR(20) NOT NULL,
    category VARCHAR(50),
    source VARCHAR(30) DEFAULT 'USER',
    sla_deadline DATETIME,
    reporter_id BIGINT NOT NULL,
    assignee_id BIGINT,
    resolution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (reporter_id) REFERENCES members(member_id),
    FOREIGN KEY (assignee_id) REFERENCES members(member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 인시던트 카테고리 기초 정보 추가
INSERT INTO codes (group_id, code_id, code_name, is_active, sort_order)
VALUES 
('IN_CATEGORY', 'NETWORK', '네트워크 장애', 1, 1),
('IN_CATEGORY', 'SERVER', '서버 장애', 1, 2),
('IN_CATEGORY', 'APP', '애플리케이션 오류', 1, 3),
('IN_CATEGORY', 'DB', '데이터서비스 장애', 1, 4)
ON DUPLICATE KEY UPDATE code_name = VALUES(code_name);

-- 인시던트 영향도 및 긴급도 기초 정보 추가
INSERT INTO codes (group_id, code_id, code_name, is_active, sort_order)
VALUES 
('IN_IMPACT', 'HIGH', 'HIGH - Critical Loss', 1, 1),
('IN_IMPACT', 'MEDIUM', 'MEDIUM - Partial Degradation', 1, 2),
('IN_IMPACT', 'LOW', 'LOW - Minor / Workaround exists', 1, 3),
('IN_URGENCY', 'HIGH', 'HIGH - Immediate attention', 1, 1),
('IN_URGENCY', 'MEDIUM', 'MEDIUM - Resolved in SLA', 1, 2),
('IN_URGENCY', 'LOW', 'LOW - Non-blocking', 1, 3)
ON DUPLICATE KEY UPDATE code_name = VALUES(code_name);
