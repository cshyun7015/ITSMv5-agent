SET NAMES utf8mb4;

-- 1. 카탈로그 카테고리 시딩 (Global Templates용)
INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('Cloud Infrastructure', 'Public/Private Cloud resource provisioning', '☁️', 'MSP_CORE', 1);

SET @infra_cat = LAST_INSERT_ID();

INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('Software & Licenses', 'Enterprise software access and license keys', '💿', 'MSP_CORE', 1);

SET @soft_cat = LAST_INSERT_ID();

INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('Hardware & Devices', 'IT equipment and accessory requests', '💻', 'MSP_CORE', 1);

SET @hard_cat = LAST_INSERT_ID();

INSERT INTO it_catalog_category (name, description, icon, tenant_id, is_template) 
VALUES ('Access & Identity', 'System permissions and VPN access', '🔑', 'MSP_CORE', 1);

SET @access_cat = LAST_INSERT_ID();

-- 2. 서비스 카탈로그 템플릿 시딩
-- AWS S3 Bucket
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES (
    'AWS S3 Bucket Creation', 
    'Request a new S3 bucket in a specified region with optional public access.', 
    '물', 
    @infra_cat, 
    '[{"id":"bucket_name","label":"Bucket Name","type":"text","required":true},{"id":"region","label":"Region","type":"select","required":true,"codeGroupId":"CATALOG_CSP"},{"id":"acl","label":"Access Control","type":"select","required":true,"options":["Private","Public-Read","Authenticated-Read"]}]', 
    1, 
    'MSP_CORE', 
    1
);

-- Azure VM
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES (
    'Azure Virtual Machine', 
    'Provision a new Azure Compute Instance (VM).', 
    '🖥️', 
    @infra_cat, 
    '[{"id":"vm_name","label":"VM Hostname","type":"text","required":true},{"id":"os_type","label":"OS Distribution","type":"select","required":true,"codeGroupId":"CATALOG_OS"},{"id":"size","label":"Instance Size","type":"select","required":true,"options":["Standard_B1s","Standard_D2s_v3","Standard_F2s"]}]', 
    1, 
    'MSP_CORE', 
    1
);

-- Laptop Replacement
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES (
    'Laptop Replacement Request', 
    'Request a replacement for your aging or broken company laptop.', 
    '💻', 
    @hard_cat, 
    '[{"id":"serial_number","label":"Current Serial No.","type":"text","required":true},{"id":"reason","label":"Reason for Replacement","type":"text","required":true}]', 
    0, 
    'MSP_CORE', 
    1
);

-- IntelliJ License
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES (
    'JetBrains IntelliJ IDEA License', 
    'Request a license key for IntelliJ IDEA Ultimate Edition.', 
    '💎', 
    @soft_cat, 
    '[{"id":"dept","label":"Department","type":"text","required":true},{"id":"renewal","label":"Is this a renewal?","type":"select","required":true,"options":["New Acquisition","Renewal"]}]', 
    1, 
    'MSP_CORE', 
    1
);

-- VPN Access
INSERT INTO it_service_catalog (name, description, icon, category_id, json_schema, approval_required, tenant_id, is_template)
VALUES (
    'Global VPN Access', 
    'Enable remote access to the corporate network via VPN.', 
    '🔒', 
    @access_cat, 
    '[{"id":"vpn_region","label":"VPN Gateway Region","type":"select","required":true,"options":["US-EAST","EU-WEST","AP-NORTHEAST"]},{"id":"duration","label":"Duration (Days)","type":"number","required":true}]', 
    1, 
    'MSP_CORE', 
    1
);
