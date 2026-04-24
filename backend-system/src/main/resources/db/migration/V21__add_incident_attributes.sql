-- V21__add_incident_attributes.sql
ALTER TABLE incidents ADD COLUMN is_major TINYINT(1) DEFAULT 0 COMMENT 'Major Incident 여부';
ALTER TABLE incidents ADD COLUMN affected_service VARCHAR(100) COMMENT '영향 받는 서비스';
