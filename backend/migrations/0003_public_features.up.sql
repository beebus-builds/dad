CREATE TABLE IF NOT EXISTS public_event_registrations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    full_name   VARCHAR(200) NOT NULL,
    email       VARCHAR(150),
    phone       VARCHAR(30),
    status      VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_public_event_reg_event ON public_event_registrations(event_id);

CREATE TABLE IF NOT EXISTS member_applications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name   VARCHAR(200) NOT NULL,
    email       VARCHAR(150),
    phone       VARCHAR(30) NOT NULL,
    address     TEXT,
    branch_id   UUID REFERENCES branches(id),
    occupation  VARCHAR(150),
    employer    VARCHAR(200),
    notes       TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_member_applications_status ON member_applications(status);

CREATE TABLE IF NOT EXISTS contact_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(150) NOT NULL,
    phone       VARCHAR(30),
    subject     VARCHAR(300) NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contact_messages_read ON contact_messages(is_read);

CREATE TABLE IF NOT EXISTS organisation_settings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(200) UNIQUE NOT NULL,
    value       TEXT NOT NULL DEFAULT '',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO organisation_settings (key, value) VALUES
    ('name', '"Shram Jagaran"'),
    ('nameNepali', '"श्रम जागरण"'),
    ('tagline', '"Workers Awakening"'),
    ('email', '"contact@shramjagaran.np"'),
    ('phone', '"+977-1-4XXX-XXX"')
ON CONFLICT DO NOTHING;
