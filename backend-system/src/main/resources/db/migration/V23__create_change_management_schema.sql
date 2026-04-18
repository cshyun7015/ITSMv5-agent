-- 1. 변경관리 관련 공통 코드 시딩
INSERT INTO `codes` (group_id, code_id, code_name, description, sort_order) VALUES 
('CH_STATUS', 'DRAFT', 'Draft', '임시 저장', 10),
('CH_STATUS', 'RFC', 'Requested', '변경 요청됨', 20),
('CH_STATUS', 'REVIEW', 'Technical Review', '기술 검토 중', 30),
('CH_STATUS', 'CAB_APPROVAL', 'CAB Approval', 'CAB 승인 대기', 40),
('CH_STATUS', 'SCHEDULED', 'Scheduled', '일정 수립됨', 50),
('CH_STATUS', 'IMPLEMENTING', 'Implementing', '구현 중', 60),
('CH_STATUS', 'PIR', 'Post Implementation Review', '완료 후 검토', 70),
('CH_STATUS', 'CLOSED', 'Closed', '종료됨', 80),
('CH_STATUS', 'REJECTED', 'Rejected', '반려됨', 90),
('CH_STATUS', 'CANCELLED', 'Cancelled', '취소됨', 100);

INSERT INTO `codes` (group_id, code_id, code_name, description, sort_order) VALUES 
('CH_TYPE', 'STANDARD', 'Standard', '표준 변경', 10),
('CH_TYPE', 'NORMAL', 'Normal', '일반 변경', 20),
('CH_TYPE', 'EMERGENCY', 'Emergency', '긴급 변경', 30);

INSERT INTO `codes` (group_id, code_id, code_name, description, sort_order) VALUES 
('CH_IMPACT', 'HIGH', 'High', '고', 10),
('CH_IMPACT', 'MEDIUM', 'Medium', '중', 20),
('CH_IMPACT', 'LOW', 'Low', '저', 30);

INSERT INTO `codes` (group_id, code_id, code_name, description, sort_order) VALUES 
('CH_URGENCY', 'HIGH', 'High', '고', 10),
('CH_URGENCY', 'MEDIUM', 'Medium', '중', 20),
('CH_URGENCY', 'LOW', 'Low', '저', 30);

-- 2. change_requests 테이블 생성
CREATE TABLE change_requests (
    change_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    reason TEXT COMMENT '변경 사유',
    description TEXT COMMENT '변경 내용',
    status_code VARCHAR(50) NOT NULL COMMENT 'CH_STATUS',
    type_code VARCHAR(50) NOT NULL COMMENT 'CH_TYPE',
    priority_code VARCHAR(50) NOT NULL COMMENT 'CH_PRIORITY',
    impact_code VARCHAR(50) NOT NULL COMMENT 'CH_IMPACT',
    urgency_code VARCHAR(50) NOT NULL COMMENT 'CH_URGENCY',
    requester_id BIGINT NOT NULL,
    assignee_id BIGINT,
    planned_start_date DATETIME,
    planned_end_date DATETIME,
    implementation_plan TEXT,
    backout_plan TEXT,
    test_plan TEXT,
    affected_cis TEXT COMMENT '영향 받는 CI 정보 (텍스트)',
    review_notes TEXT COMMENT 'PIR 결과',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES tenants(tenant_id),
    FOREIGN KEY (requester_id) REFERENCES members(member_id),
    FOREIGN KEY (assignee_id) REFERENCES members(member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. change_approvals 테이블 생성 (다단계 결재)
CREATE TABLE change_approvals (
    approval_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    change_id BIGINT NOT NULL,
    approver_id BIGINT NOT NULL,
    step_order INT NOT NULL,
    status VARCHAR(20) NOT NULL COMMENT 'PENDING, APPROVED, REJECTED',
    comment VARCHAR(500),
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    is_deleted TINYINT(1) DEFAULT 0,
    FOREIGN KEY (change_id) REFERENCES change_requests(change_id),
    FOREIGN KEY (approver_id) REFERENCES members(member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. change_incident_links 테이블 생성 (연관 인시던트 N:M)
CREATE TABLE change_incident_links (
    change_id BIGINT NOT NULL,
    incident_id BIGINT NOT NULL,
    PRIMARY KEY (change_id, incident_id),
    FOREIGN KEY (change_id) REFERENCES change_requests(change_id),
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
