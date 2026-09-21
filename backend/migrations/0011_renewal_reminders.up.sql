ALTER TABLE members ADD COLUMN IF NOT EXISTS last_renewal_reminder_at TIMESTAMPTZ;
