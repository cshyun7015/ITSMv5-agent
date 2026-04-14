-- service_requests 테이블 생성
CREATE TABLE service_requests (
    request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL, -- DRAFT, PENDING_APPROVAL, OPEN, IN_PROGRESS, RESOLVED, CLOSED
    priority VARCHAR(20) NOT NULL, -- EMERGENCY, NORMAL, LOW
    sla_deadline DATETIME,
    requester_id BIGINT NOT NULL,
    assignee_id BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (requester_id) REFERENCES members(member_id),
    FOREIGN KEY (assignee_id) REFERENCES members(member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- request_approvals 테이블 생성 (결재선 정보)
CREATE TABLE request_approvals (
    approval_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    step_order INT NOT NULL,
    status VARCHAR(20) NOT NULL, -- PENDING, APPROVED, REJECTED
    comment VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (request_id) REFERENCES service_requests(request_id),
    FOREIGN KEY (approver_id) REFERENCES members(member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
