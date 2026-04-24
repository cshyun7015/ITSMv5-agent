-- it_catalog_category 테이블 생성
CREATE TABLE it_catalog_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(255),
    tenant_id VARCHAR(50),
    is_template TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- it_service_catalog 테이블 생성
CREATE TABLE it_service_catalog (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    icon VARCHAR(255),
    category_id BIGINT,
    json_schema LONGTEXT,
    approval_required TINYINT(1) DEFAULT 0,
    tenant_id VARCHAR(50),
    is_template TINYINT(1) DEFAULT 0,
    template_source_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES it_catalog_category(id),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- service_requests 테이블에 카탈로그 연동 컬럼 추가
ALTER TABLE service_requests ADD COLUMN catalog_id BIGINT AFTER sla_deadline;
ALTER TABLE service_requests ADD COLUMN dynamic_fields LONGTEXT AFTER catalog_id;
ALTER TABLE service_requests ADD FOREIGN KEY (catalog_id) REFERENCES it_service_catalog(id);
