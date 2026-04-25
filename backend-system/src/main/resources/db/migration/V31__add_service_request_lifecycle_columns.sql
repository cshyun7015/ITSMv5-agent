-- 서비스 요청 테이블에 생명주기 관련 타임스탬프 컬럼 추가
ALTER TABLE service_requests ADD COLUMN submitted_at DATETIME;
ALTER TABLE service_requests ADD COLUMN resolved_at DATETIME;
ALTER TABLE service_requests ADD COLUMN closed_at DATETIME;
