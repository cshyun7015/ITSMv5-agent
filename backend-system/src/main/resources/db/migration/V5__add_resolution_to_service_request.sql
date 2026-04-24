-- V5__add_resolution_to_service_request.sql
ALTER TABLE service_requests ADD COLUMN resolution TEXT AFTER assignee_id;
