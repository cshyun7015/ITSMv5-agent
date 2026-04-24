SET NAMES utf8mb4;

-- 1. Create Customer B (CN_TENANT_02)
INSERT INTO tenants (tenant_id, name, type, is_active, is_deleted) 
VALUES ('CN_TENANT_02', 'Tech Innovations B', 'CUSTOMER', 1, 0);

-- Insert user for Customer B (username: user2, password: password)
INSERT INTO members (tenant_id, username, password, email) 
VALUES ('CN_TENANT_02', 'user2', '$2a$10$XJ4QjD65vO5XyleKJbf5T.hGD7Co8AxaWskP4oDjaHDG7Cw8iUysm', 'user2@customer.com');

-- Grant ROLE_USER to user2
SET @user2_id = (SELECT member_id FROM members WHERE username = 'user2' AND tenant_id = 'CN_TENANT_02');
INSERT INTO member_roles (member_id, role_id) VALUES (@user2_id, 'ROLE_USER');

-- 2. Create categories for Customer A (CN_TENANT_01)
INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('General Services', 'General Office and Admin Services', '📋', 'CN_TENANT_01', 0);
SET @cat_gen_A = LAST_INSERT_ID();

INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('Cloud & Software', 'Cloud resources and software access', '☁️', 'CN_TENANT_01', 0);
SET @cat_cloud_A = LAST_INSERT_ID();

-- 3. Create categories for Customer B (CN_TENANT_02)
INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('General Services', 'General Office and Admin Services', '📋', 'CN_TENANT_02', 0);
SET @cat_gen_B = LAST_INSERT_ID();

INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('Cloud & Software', 'Cloud resources and software access', '☁️', 'CN_TENANT_02', 0);
SET @cat_cloud_B = LAST_INSERT_ID();


-- ==========================================
-- 서비스 카탈로그 데이터 배포 (총 5개)
-- ==========================================

-- [1. 모든 고객사에게 보이는 데이터 1] Google Workspace Account
-- Tenant A
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('Google Workspace Account', 'Request a new Google Workspace enterprise account for an employee.', '📧', @cat_gen_A, '[{"id":"email_prefix","label":"Requested Email Prefix","type":"text","required":true}]', 1, 'CN_TENANT_01', 0);
-- Tenant B
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('Google Workspace Account', 'Request a new Google Workspace enterprise account for an employee.', '📧', @cat_gen_B, '[{"id":"email_prefix","label":"Requested Email Prefix","type":"text","required":true}]', 1, 'CN_TENANT_02', 0);

-- [2. 모든 고객사에게 보이는 데이터 2] Access Card Issuance
-- Tenant A
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('Access Card Issuance', 'Request a physical office access card', '💳', @cat_gen_A, '[{"id":"office_location","label":"Office Location","type":"text","required":true}]', 0, 'CN_TENANT_01', 0);
-- Tenant B
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('Access Card Issuance', 'Request a physical office access card', '💳', @cat_gen_B, '[{"id":"office_location","label":"Office Location","type":"text","required":true}]', 0, 'CN_TENANT_02', 0);

-- [3. A 고객사에게만 보이는 데이터 1] AWS EC2 Instance
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('AWS EC2 Instance (A Corp Only)', 'Provision an AWS EC2 Computing Instance specific for Team A environments.', '🖥️', @cat_cloud_A, '[{"id":"instance_type","label":"EC2 Instance Type","type":"text","required":true}]', 1, 'CN_TENANT_01', 0);

-- [4. A 고객사에게만 보이는 데이터 2] Data Analytics Tools Access
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('Data Analytics Tools (A Corp Only)', 'Access to Tableau or PowerBI restricted to A Corp domains.', '📊', @cat_cloud_A, '[{"id":"tool_name","label":"Tool (Tableau/PowerBI)","type":"text","required":true}]', 1, 'CN_TENANT_01', 0);

-- [5. B 고객사에게만 보이는 데이터 1] Azure Web App Environment
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES ('Azure Web App (B Corp Only)', 'Provision an Azure Web App restricted to Tech Innovations B networks.', '🌐', @cat_cloud_B, '[{"id":"app_name","label":"Web App Name","type":"text","required":true}]', 1, 'CN_TENANT_02', 0);
