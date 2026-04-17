CREATE TABLE IF NOT EXISTS `it_token_blacklist` (
    `token` VARCHAR(500) PRIMARY KEY,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 주기적으로 만료된 토큰을 삭제하기 위한 인덱스
CREATE INDEX idx_expires_at ON `it_token_blacklist`(`expires_at`);
