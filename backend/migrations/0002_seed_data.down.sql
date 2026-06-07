DELETE FROM complaints WHERE ticket_number IN ('CMP-2104','CMP-2105');
DELETE FROM events WHERE slug IN ('national-workers-convention-2026','osh-awareness-workshop');
DELETE FROM news WHERE slug IN ('welcome-to-shram-jagaran','minimum-wage-2026');
DELETE FROM users WHERE email = 'admin@shramjagaran.np';
DELETE FROM branches;
DELETE FROM role_permissions;
DELETE FROM permissions;
DELETE FROM roles;
