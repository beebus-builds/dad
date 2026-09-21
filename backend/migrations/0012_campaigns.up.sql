CREATE TABLE IF NOT EXISTS campaigns (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255) NOT NULL,
    subject        VARCHAR(255) NOT NULL,
    body           TEXT NOT NULL,
    segment_filter JSONB NOT NULL DEFAULT '{}',
    scheduled_at   TIMESTAMPTZ,
    status         VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    sent_at        TIMESTAMPTZ,
    created_by     UUID NOT NULL REFERENCES users(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

CREATE TABLE IF NOT EXISTS campaign_recipients (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    member_id   UUID NOT NULL REFERENCES members(id),
    email       VARCHAR(150) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    sent_at     TIMESTAMPTZ,
    error       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(campaign_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(campaign_id, status);
