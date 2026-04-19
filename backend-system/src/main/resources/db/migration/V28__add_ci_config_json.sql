-- CI 기술 속성 저장을 위한 config_json 컬럼 추가
ALTER TABLE `configuration_items` ADD COLUMN `config_json` TEXT COMMENT '기술 사양 및 메타데이터 (JSON)';
