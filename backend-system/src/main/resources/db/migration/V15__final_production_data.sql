SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. 기존 데이터 초기화 (전체 삭제)
TRUNCATE TABLE `service_request_attachments`;
TRUNCATE TABLE `request_approvals`;
TRUNCATE TABLE `service_requests`;
TRUNCATE TABLE `it_service_catalog`;
TRUNCATE TABLE `it_catalog_category`;
TRUNCATE TABLE `incidents`;
TRUNCATE TABLE `member_roles`;
TRUNCATE TABLE `members`;
TRUNCATE TABLE `it_tenant_relation`;
TRUNCATE TABLE `it_team`;
TRUNCATE TABLE `it_organization`;
TRUNCATE TABLE `tenants`;

SET FOREIGN_KEY_CHECKS = 1;

-- 2. 테넌트 생성 (Tenants)
-- MSP
INSERT INTO tenants (tenant_id, name, type, brand_color) VALUES ('OPER_MSP', 'Global MSP Operations', 'MSP', '#1e293b');
-- Operators
INSERT INTO tenants (tenant_id, name, type, brand_color) VALUES ('ocomp1', 'Operating Company 1', 'OPERATOR', '#3b82f6');
INSERT INTO tenants (tenant_id, name, type, brand_color) VALUES ('ocomp2', 'Operating Company 2', 'OPERATOR', '#6366f1');
-- Customers
INSERT INTO tenants (tenant_id, name, type, brand_color) VALUES ('ucomp1', 'Customer Company 1', 'CUSTOMER', '#10b981');
INSERT INTO tenants (tenant_id, name, type, brand_color) VALUES ('ucomp2', 'Customer Company 2', 'CUSTOMER', '#f59e0b');

-- 3. 조직(Organizations) & 팀(Teams) 생성
-- MSP
INSERT INTO it_organization (tenant_id, name) VALUES ('OPER_MSP', 'MSP Strategy Unit');
SET @org_msp = LAST_INSERT_ID();
INSERT INTO it_team (org_id, name) VALUES (@org_msp, 'oteamMSP');
SET @team_msp = LAST_INSERT_ID();

-- Oper 1
INSERT INTO it_organization (tenant_id, name) VALUES ('ocomp1', 'Operating Unit 1');
SET @org_oper1 = LAST_INSERT_ID();
INSERT INTO it_team (org_id, name) VALUES (@org_oper1, 'oteam1');
SET @team_oper1 = LAST_INSERT_ID();

-- Oper 2
INSERT INTO it_organization (tenant_id, name) VALUES ('ocomp2', 'Operating Unit 2');
SET @org_oper2 = LAST_INSERT_ID();
INSERT INTO it_team (org_id, name) VALUES (@org_oper2, 'oteam2');
SET @team_oper2 = LAST_INSERT_ID();

-- Cust 1
INSERT INTO it_organization (tenant_id, name) VALUES ('ucomp1', 'Customer Business Unit 1');
SET @org_cust1 = LAST_INSERT_ID();
INSERT INTO it_team (org_id, name) VALUES (@org_cust1, 'uteam1');
SET @team_cust1 = LAST_INSERT_ID();

-- Cust 2
INSERT INTO it_organization (tenant_id, name) VALUES ('ucomp2', 'Customer Business Unit 2');
SET @org_cust2 = LAST_INSERT_ID();
INSERT INTO it_team (org_id, name) VALUES (@org_cust2, 'uteam2');
SET @team_cust2 = LAST_INSERT_ID();

-- 4. 운영사-고객사 관계(Tenant Relations) 설정
INSERT INTO it_tenant_relation (operator_tenant_id, customer_tenant_id) VALUES ('ocomp1', 'ucomp1');
INSERT INTO it_tenant_relation (operator_tenant_id, customer_tenant_id) VALUES ('ocomp2', 'ucomp2');

-- 5. 사용자(Members) 생성 (Password: 'pwd')
SET @pwd = '$2a$10$iHNd9mHM40Dcuia1ust4t.d7iQsa2eHUFbrHs0aBSryHebzbZl2I.';

-- MSP
INSERT INTO members (tenant_id, team_id, username, password, email) VALUES ('OPER_MSP', @team_msp, 'msp', @pwd, 'msp@global.com');
SET @msp_id = LAST_INSERT_ID();

-- Operator 1
INSERT INTO members (tenant_id, team_id, username, password, email) VALUES ('ocomp1', @team_oper1, 'oper1', @pwd, 'oper1@oper.com');
SET @oper1_id = LAST_INSERT_ID();

-- Operator 2
INSERT INTO members (tenant_id, team_id, username, password, email) VALUES ('ocomp2', @team_oper2, 'oper2', @pwd, 'oper2@oper.com');
SET @oper2_id = LAST_INSERT_ID();

-- User 1
INSERT INTO members (tenant_id, team_id, username, password, email) VALUES ('ucomp1', @team_cust1, 'user1', @pwd, 'user1@cust.com');
SET @user1_id = LAST_INSERT_ID();

-- User 2
INSERT INTO members (tenant_id, team_id, username, password, email) VALUES ('ucomp2', @team_cust2, 'user2', @pwd, 'user2@cust.com');
SET @user2_id = LAST_INSERT_ID();

-- 6. 권한(Roles) 매핑
INSERT INTO member_roles (member_id, role_id) VALUES (@msp_id, 'ROLE_ADMIN');
INSERT INTO member_roles (member_id, role_id) VALUES (@oper1_id, 'ROLE_OPERATOR');
INSERT INTO member_roles (member_id, role_id) VALUES (@oper2_id, 'ROLE_OPERATOR');
INSERT INTO member_roles (member_id, role_id) VALUES (@user1_id, 'ROLE_USER');
INSERT INTO member_roles (member_id, role_id) VALUES (@user2_id, 'ROLE_USER');
