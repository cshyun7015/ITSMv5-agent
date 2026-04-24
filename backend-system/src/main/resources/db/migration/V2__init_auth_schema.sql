-- tenants 테이블: 고객사(Tenant) 및 운영사(MSP) 식별
CREATE TABLE tenants (
    tenant_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'MSP', 'CUSTOMER'
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- roles 테이블: 계정별 권한 정의
CREATE TABLE roles (
    role_id VARCHAR(50) PRIMARY KEY, -- 'ROLE_ADMIN', 'ROLE_OPERATOR', 'ROLE_USER'
    description VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- members 테이블: 사용자 계정 정보
CREATE TABLE members (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    UNIQUE KEY uk_tenant_username (tenant_id, username),
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- member_roles 테이블: 사용자-권한 매핑
CREATE TABLE member_roles (
    member_id BIGINT NOT NULL,
    role_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (member_id, role_id),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기초 데이터 삽입
INSERT INTO tenants (tenant_id, name, type) VALUES ('MSP_CORE', 'MSP Operations Center', 'MSP');
INSERT INTO tenants (tenant_id, name, type) VALUES ('CN_TENANT_01', 'Cloud Nexus Customer', 'CUSTOMER');

INSERT INTO roles (role_id, description) VALUES ('ROLE_ADMIN', 'MSP System Administrator');
INSERT INTO roles (role_id, description) VALUES ('ROLE_OPERATOR', 'MSP Support Operator');
INSERT INTO roles (role_id, description) VALUES ('ROLE_USER', 'Customer Service User');

-- 초기 비밀번호는 'password'를 BCrypt로 해싱하여 저장합니다.
INSERT INTO members (tenant_id, username, password, email) 
VALUES ('MSP_CORE', 'admin', '$2a$10$XJ4QjD65vO5XyleKJbf5T.hGD7Co8AxaWskP4oDjaHDG7Cw8iUysm', 'admin@msp.com');

INSERT INTO member_roles (member_id, role_id) VALUES (1, 'ROLE_ADMIN');
