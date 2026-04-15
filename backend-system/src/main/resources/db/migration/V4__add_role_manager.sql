-- ROLE_MANAGER 추가
INSERT INTO roles (role_id, description) VALUES ('ROLE_MANAGER', 'Customer Organization Manager/Approver');

-- 테스트용 고객사 관리자 계정 생성 (CN_TENANT_01)
-- 비밀번호: 'password' (BCrypt: $2a$10$XJ4QjD65vO5XyleKJbf5T.hGD7Co8AxaWskP4oDjaHDG7Cw8iUysm)
INSERT INTO members (tenant_id, username, password, email) 
VALUES ('CN_TENANT_01', 'manager1', '$2a$10$XJ4QjD65vO5XyleKJbf5T.hGD7Co8AxaWskP4oDjaHDG7Cw8iUysm', 'manager1@customer.com');

-- manager1에게 ROLE_MANAGER 권한 부여
INSERT INTO member_roles (member_id, role_id) 
SELECT member_id, 'ROLE_MANAGER' FROM members WHERE username = 'manager1' AND tenant_id = 'CN_TENANT_01';

-- 일반 사용자 계정 생성 (CN_TENANT_01)
INSERT INTO members (tenant_id, username, password, email) 
VALUES ('CN_TENANT_01', 'user1', '$2a$10$XJ4QjD65vO5XyleKJbf5T.hGD7Co8AxaWskP4oDjaHDG7Cw8iUysm', 'user1@customer.com');

-- user1에게 ROLE_USER 권한 부여
INSERT INTO member_roles (member_id, role_id) 
SELECT member_id, 'ROLE_USER' FROM members WHERE username = 'user1' AND tenant_id = 'CN_TENANT_01';
