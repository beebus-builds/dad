ALTER TABLE members ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_members_tags ON members USING GIN(tags);

ALTER TABLE donations ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES members(id);
CREATE INDEX IF NOT EXISTS idx_donations_member_id ON donations(member_id);

CREATE TABLE IF NOT EXISTS training_registrations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id   UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
    member_id     UUID NOT NULL REFERENCES members(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(training_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_training_reg_member ON training_registrations(member_id);

CREATE TABLE IF NOT EXISTS member_communication_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    logged_by   UUID NOT NULL REFERENCES users(id),
    channel     VARCHAR(20) NOT NULL,
    subject     VARCHAR(255) NOT NULL,
    notes       TEXT NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comm_logs_member ON member_communication_logs(member_id, occurred_at DESC);
