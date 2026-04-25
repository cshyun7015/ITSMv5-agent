UPDATE service_requests 
SET request_no = CONCAT('SR-', DATE_FORMAT(created_at, '%Y%m%d'), '-', LPAD(request_id, 6, '0')) 
WHERE request_no IS NULL;
