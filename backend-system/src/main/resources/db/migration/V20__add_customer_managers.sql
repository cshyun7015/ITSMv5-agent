-- 고객사 ucomp1 관리자 추가
INSERT INTO members (tenant_id, team_id, username, password, email)
SELECT 'ucomp1', t.team_id, 'manager1', '$2a$10$iHNd9mHM40Dcuia1ust4t.d7iQsa2eHUFbrHs0aBSryHebzbZl2I.', 'manager1@cust.com'
FROM it_team t JOIN it_organization o ON t.org_id = o.org_id
WHERE o.tenant_id = 'ucomp1' AND t.name = 'uteam1'
AND NOT EXISTS (SELECT 1 FROM members WHERE username = 'manager1' AND tenant_id = 'ucomp1');

-- manager1에게 ROLE_MANAGER 권한 부여
INSERT INTO member_roles (member_id, role_id)
SELECT member_id, 'ROLE_MANAGER' FROM members 
WHERE username = 'manager1' AND tenant_id = 'ucomp1'
AND NOT EXISTS (
    SELECT 1 FROM member_roles mr 
    WHERE mr.member_id = members.member_id AND mr.role_id = 'ROLE_MANAGER'
);

-- 고객사 ucomp2 관리자 추가
INSERT INTO members (tenant_id, team_id, username, password, email)
SELECT 'ucomp2', t.team_id, 'manager2', '$2a$10$iHNd9mHM40Dcuia1ust4t.d7iQsa2eHUFbrHs0aBSryHebzbZl2I.', 'manager2@cust.com'
FROM it_team t JOIN it_organization o ON t.org_id = o.org_id
WHERE o.tenant_id = 'ucomp2' AND t.name = 'uteam2'
AND NOT EXISTS (SELECT 1 FROM members WHERE username = 'manager2' AND tenant_id = 'ucomp2');

-- manager2에게 ROLE_MANAGER 권한 부여
INSERT INTO member_roles (member_id, role_id)
SELECT member_id, 'ROLE_MANAGER' FROM members 
WHERE username = 'manager2' AND tenant_id = 'ucomp2'
AND NOT EXISTS (
    SELECT 1 FROM member_roles mr 
    WHERE mr.member_id = members.member_id AND mr.role_id = 'ROLE_MANAGER'
);
