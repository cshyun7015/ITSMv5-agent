-- Schema change for Service Catalog Category
ALTER TABLE it_service_catalog ADD COLUMN category_code VARCHAR(50);

-- CATALOG_CATEGORY Group and Seed Codes
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CATEGORY', 'CAT_ACCESS', 'Account/Access', 1, 'Permissions and account requests');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CATEGORY', 'CAT_INFRA', 'Cloud/Infra', 2, 'Server, DB, Network requests');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CATEGORY', 'CAT_SOFTWARE', 'Software', 3, 'Application and S/W support');
INSERT INTO codes (group_id, code_id, code_name, sort_order, description) VALUES ('CATALOG_CATEGORY', 'CAT_GENERAL', 'General Support', 4, 'Common IT service requests');
