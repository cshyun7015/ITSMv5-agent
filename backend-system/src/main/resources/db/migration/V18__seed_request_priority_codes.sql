INSERT INTO codes (group_id, code_id, code_name, description, sort_order, is_active, is_deleted, created_at, updated_at) VALUES 
('SR_PRIORITY', 'EMERGENCY', '긴급', '최우선 처리가 필요한 요청', 10, 1, 0, NOW(), NOW()),
('SR_PRIORITY', 'NORMAL', '보통', '일반적인 서비스 요청', 20, 1, 0, NOW(), NOW()),
('SR_PRIORITY', 'LOW', '낮음', '시간적 여유가 있는 단순 요청', 30, 1, 0, NOW(), NOW());
