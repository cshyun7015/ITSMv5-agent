INSERT INTO codes (group_id, code_id, code_name, description, sort_order, is_active, is_deleted, created_at, updated_at) VALUES 
('SR_STATUS', 'DRAFT', '작성 중', '신청서 작성 중인 상태', 10, 1, 0, NOW(), NOW()),
('SR_STATUS', 'PENDING_APPROVAL', '결재 대기', '결재권자의 승인을 대기하는 상태', 20, 1, 0, NOW(), NOW()),
('SR_STATUS', 'OPEN', '접수 완료', '요청이 접수되어 처리를 대기하는 상태', 30, 1, 0, NOW(), NOW()),
('SR_STATUS', 'IN_PROGRESS', '처리 중', '담당자가 지정되어 처리 중인 상태', 40, 1, 0, NOW(), NOW()),
('SR_STATUS', 'RESOLVED', '해결 완료', '요청 처리가 완료된 상태', 50, 1, 0, NOW(), NOW()),
('SR_STATUS', 'CLOSED', '종료', '최종 검토 후 종료된 상태', 60, 1, 0, NOW(), NOW()),
('SR_STATUS', 'REJECTED', '반려', '결재가 반려된 상태', 70, 1, 0, NOW(), NOW());
