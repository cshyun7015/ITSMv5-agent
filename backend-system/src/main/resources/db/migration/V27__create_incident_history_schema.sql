-- V27__create_incident_history_schema.sql
CREATE TABLE IF NOT EXISTS incident_histories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    type VARCHAR(30) NOT NULL,
    note TEXT,
    old_value VARCHAR(100),
    new_value VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_incident FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE CASCADE,
    CONSTRAINT fk_history_author FOREIGN KEY (author_id) REFERENCES members(member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for faster history retrieval per incident
CREATE INDEX idx_incident_history_lookup ON incident_histories(incident_id, created_at DESC);
