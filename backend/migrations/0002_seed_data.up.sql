-- Seed data: roles, permissions, branches, super admin, sample data

INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN',    'Platform owner with all permissions'),
    ('NATIONAL_ADMIN', 'National level administrator'),
    ('PROVINCE_ADMIN', 'Province level administrator'),
    ('DISTRICT_ADMIN', 'District level administrator'),
    ('BRANCH_ADMIN',   'Single branch administrator'),
    ('MEMBER',         'Registered union member'),
    ('PUBLIC',         'Anonymous public visitor');

INSERT INTO permissions (name, description) VALUES
    ('members:read','View members'),
    ('members:write','Create/update members'),
    ('members:delete','Delete members'),
    ('complaints:read','View complaints'),
    ('complaints:write','Create/update complaints'),
    ('complaints:resolve','Resolve complaints'),
    ('events:read','View events'),
    ('events:write','Create/update events'),
    ('events:publish','Publish events'),
    ('news:read','View news'),
    ('news:write','Create/update news'),
    ('news:publish','Publish news'),
    ('documents:read','View documents'),
    ('documents:write','Upload/update documents'),
    ('donations:read','View donations'),
    ('donations:write','Record/update donations'),
    ('legal:read','View legal cases'),
    ('legal:write','Create/update legal cases'),
    ('training:read','View training programmes'),
    ('training:write','Manage training programmes'),
    ('incidents:read','View OSH incidents'),
    ('incidents:write','Create/update OSH incidents'),
    ('reports:view','View reports'),
    ('settings:manage','Manage system settings'),
    ('audit:view','View audit logs'),
    ('users:manage','Manage user accounts');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'SUPER_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN
    ('members:read','members:write','complaints:read','complaints:write','complaints:resolve',
     'events:read','events:write','events:publish','news:read','news:write','news:publish',
     'documents:read','documents:write','donations:read','donations:write',
     'legal:read','legal:write','training:read','training:write',
     'incidents:read','incidents:write','reports:view','audit:view','users:manage')
WHERE r.name = 'NATIONAL_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN
    ('members:read','members:write','complaints:read','complaints:write','complaints:resolve',
     'events:read','events:write','news:read','news:write',
     'documents:read','documents:write','donations:read',
     'legal:read','legal:write','training:read','incidents:read','incidents:write','reports:view')
WHERE r.name = 'PROVINCE_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN
    ('members:read','members:write','complaints:read','complaints:write',
     'events:read','events:write','news:read','documents:read',
     'legal:read','incidents:read','incidents:write','reports:view')
WHERE r.name = 'DISTRICT_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN
    ('members:read','members:write','complaints:read','complaints:write',
     'events:read','news:read','documents:read','incidents:read','incidents:write')
WHERE r.name = 'BRANCH_ADMIN';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN
    ('complaints:read','complaints:write','events:read','news:read','documents:read','legal:read','training:read')
WHERE r.name = 'MEMBER';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('news:read','events:read')
WHERE r.name = 'PUBLIC';

INSERT INTO branches (id, name, name_nepali, province_code, district_code, address, contact_email, contact_phone)
VALUES
    ('11111111-1111-1111-1111-111111111111','Kathmandu Central','काठमाडौं केन्द्रीय','P3','KTM-CENTRAL','Putalisadak, Kathmandu','kathmandu@shramjagaran.np','+977-1-4444444'),
    ('22222222-2222-2222-2222-222222222222','Pokhara','पोखरा','P4','POK','Baidam, Pokhara','pokhara@shramjagaran.np','+977-61-555555'),
    ('33333333-3333-3333-3333-333333333333','Biratnagar','विराटनगर','P1','BRT','Main Road, Biratnagar','biratnagar@shramjagaran.np','+977-21-555555'),
    ('44444444-4444-4444-4444-444444444444','Birgunj','वीरगंज','P2','BRG','Ghantaghar, Birgunj','birgunj@shramjagaran.np','+977-51-555555'),
    ('55555555-5555-5555-5555-555555555555','Butwal','बुटवल','P5','BTW','Traffic Chowk, Butwal','butwal@shramjagaran.np','+977-71-555555');

-- Default super admin (password: Admin@123)
-- bcrypt hash of "Admin@123"
INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000001','admin@shramjagaran.np','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy','Platform Admin','+977-9800000001','SUPER_ADMIN',true);

INSERT INTO news (slug, title, excerpt, content, category, status, author_id, tags, published_at)
VALUES
    ('welcome-to-shram-jagaran','Welcome to Shram Jagaran CMS','A unified digital home for Nepalese trade unions.','Shram Jagaran CMS is now live across all 7 provinces.','ANNOUNCEMENT','PUBLISHED','00000000-0000-0000-0000-000000000001','{"launch","announcement"}',NOW()),
    ('minimum-wage-2026','Updated Minimum Wage Guidelines','The Government of Nepal has issued revised minimum wage guidelines.','Effective from 2026, the minimum monthly wage has been revised to NPR 19,500.','POLICY','PUBLISHED','00000000-0000-0000-0000-000000000001','{"policy","wages"}',NOW());

INSERT INTO events (title, title_nepali, slug, description, category, status, starts_at, ends_at, location, capacity, registered_count, created_by)
VALUES
    ('National Workers Convention 2026','राष्ट्रिय श्रमिक सम्मेलन २०८३','national-workers-convention-2026','The flagship annual convention of the union.','CONFERENCE','PUBLISHED',NOW() + INTERVAL '14 days',NOW() + INTERVAL '16 days','Bhrikutimandap, Kathmandu',2000,1240,'00000000-0000-0000-0000-000000000001'),
    ('OSH Awareness Workshop','OSH जनचेतना कार्यशाला','osh-awareness-workshop','Practical safety training for garment workers.','WORKSHOP','PUBLISHED',NOW() + INTERVAL '21 days',NOW() + INTERVAL '21 days' + INTERVAL '6 hours','Birgunj',300,220,'00000000-0000-0000-0000-000000000001');

INSERT INTO complaints (ticket_number, title, description, category, priority, status, submitted_by, branch_id)
VALUES
    ('CMP-2104','Wage withheld for 3 months','The employer has not paid wages for the last three months.','WAGES','HIGH','IN_REVIEW','00000000-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111'),
    ('CMP-2105','Unsafe workplace - no helmets','Construction site has not provided safety helmets.','SAFETY','URGENT','OPEN','00000000-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222');
