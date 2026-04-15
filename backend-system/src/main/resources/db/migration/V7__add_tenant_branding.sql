-- tenants 테이블에 브랜딩 컬럼 추가
ALTER TABLE tenants ADD COLUMN logo_url VARCHAR(255) DEFAULT NULL;
ALTER TABLE tenants ADD COLUMN brand_color VARCHAR(10) DEFAULT '#3b82f6';

-- 초기 데이터 업데이트
UPDATE tenants SET brand_color = '#3b82f6' WHERE tenant_id = 'MSP_CORE';
UPDATE tenants SET brand_color = '#10b981' WHERE tenant_id = 'CN_TENANT_01';
