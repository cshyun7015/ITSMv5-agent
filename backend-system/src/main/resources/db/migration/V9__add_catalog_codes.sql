-- 카탈로그용 공통 코드 그룹 추가
-- 1. CSP Provider
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CSP', 'AWS', 'Amazon Web Services', 1, 'AWS Cloud');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CSP', 'AZURE', 'Microsoft Azure', 2, 'Azure Cloud');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CSP', 'GCP', 'Google Cloud Platform', 3, 'Google Cloud');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CSP', 'ONPREM', 'On-Premise', 4, 'Internal Infrastructure');

-- 2. Database Engine
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_DB', 'MYSQL', 'MySQL', 1, 'MySQL Community/Enterprise');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_DB', 'POSTGRES', 'PostgreSQL', 2, 'PostgreSQL Open Source');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_DB', 'MONGODB', 'MongoDB', 3, 'NoSQL Document Store');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_DB', 'ORACLE', 'Oracle Database', 4, 'Oracle Enterprise');

-- 3. Operating System
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_OS', 'LINUX', 'Linux (Ubuntu/CentOS)', 1, 'Standard Linux Distribution');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_OS', 'WINDOWS', 'Windows Server', 2, 'Microsoft Windows Server OS');
