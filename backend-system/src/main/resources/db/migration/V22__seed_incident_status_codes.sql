-- V22__seed_incident_status_codes.sql
INSERT INTO codes (group_id, code_id, code_name, is_active, sort_order) VALUES
('IN_STATUS', 'NEW', '신규', 1, 1),
('IN_STATUS', 'ASSIGNED', '배정됨', 1, 2),
('IN_STATUS', 'IN_PROGRESS', '처리 중', 1, 3),
('IN_STATUS', 'RESOLVED', '해결됨', 1, 4),
('IN_STATUS', 'CLOSED', '종료됨', 1, 5)
ON DUPLICATE KEY UPDATE code_name = VALUES(code_name), sort_order = VALUES(sort_order);
