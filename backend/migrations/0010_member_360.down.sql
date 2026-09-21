DROP TABLE IF EXISTS member_communication_logs CASCADE;
DROP TABLE IF EXISTS training_registrations CASCADE;
ALTER TABLE donations DROP COLUMN IF EXISTS member_id;
DROP INDEX IF EXISTS idx_members_tags;
ALTER TABLE members DROP COLUMN IF EXISTS tags;
