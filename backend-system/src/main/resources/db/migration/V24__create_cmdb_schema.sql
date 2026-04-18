-- CI 관리 (CMDB) 스키마 생성
CREATE TABLE IF NOT EXISTS configuration_items (
    ci_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    type_code VARCHAR(50) NOT NULL,
    status_code VARCHAR(50) NOT NULL,
    serial_number VARCHAR(100),
    owner_id BIGINT,
    location VARCHAR(200),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ci_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    CONSTRAINT fk_ci_owner FOREIGN KEY (owner_id) REFERENCES members(member_id)
);

-- CI 유형(CI_TYPE) 마스터 코드 삽입
INSERT INTO codes (group_id, code_id, code_name, sort_order, is_active) VALUES
('CI_TYPE', 'SERVER', 'Server', 1, 1),
('CI_TYPE', 'DATABASE', 'Database', 2, 1),
('CI_TYPE', 'NETWORK', 'Network Device', 3, 1),
('CI_TYPE', 'APPLICATION', 'Application', 4, 1),
('CI_TYPE', 'TERMINAL', 'Terminal/PC', 5, 1);

-- CI 생애주기 상태(CI_STATUS) 마스터 코드 삽입
INSERT INTO codes (group_id, code_id, code_name, sort_order, is_active) VALUES
('CI_STATUS', 'PROVISIONING', 'Provisioning', 1, 1),
('CI_STATUS', 'ACTIVE', 'Active', 2, 1),
('CI_STATUS', 'MAINTENANCE', 'Maintenance', 3, 1),
('CI_STATUS', 'RETIRED', 'Retired', 4, 1),
('CI_STATUS', 'DECOMMISSIONED', 'Decommissioned', 5, 1);
