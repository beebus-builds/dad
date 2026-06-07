-- Shram Jagaran CMS — initial schema
-- 17 tables per 04-database-schema.md

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS branches (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(200) NOT NULL,
    name_nepali   VARCHAR(200),
    province_code VARCHAR(5) NOT NULL,
    district_code VARCHAR(10) NOT NULL,
    address       TEXT,
    contact_email VARCHAR(150),
    contact_phone VARCHAR(30),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_branches_province ON branches(province_code);
CREATE INDEX idx_branches_district ON branches(district_code);
CREATE INDEX idx_branches_active   ON branches(is_active) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          VARCHAR(150) UNIQUE NOT NULL,
    password_hash  VARCHAR(255) NOT NULL,
    full_name      VARCHAR(200) NOT NULL,
    phone          VARCHAR(30),
    avatar_url     TEXT,
    role           VARCHAR(50) NOT NULL,
    branch_id      UUID REFERENCES branches(id),
    province_code  VARCHAR(5),
    district_code  VARCHAR(10),
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at     TIMESTAMPTZ
);
CREATE INDEX idx_users_role   ON users(role);
CREATE INDEX idx_users_branch ON users(branch_id);
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS members (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_number  VARCHAR(30) UNIQUE NOT NULL,
    user_id            UUID REFERENCES users(id),
    full_name          VARCHAR(200) NOT NULL,
    full_name_nepali   VARCHAR(200),
    email              VARCHAR(150),
    phone              VARCHAR(30) NOT NULL,
    date_of_birth      DATE,
    gender             VARCHAR(10),
    citizenship_number VARCHAR(50),
    occupation         VARCHAR(150),
    employer           VARCHAR(200),
    address            TEXT,
    branch_id          UUID NOT NULL REFERENCES branches(id),
    tier               VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
    status             VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    joined_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at         TIMESTAMPTZ,
    avatar_url         TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at         TIMESTAMPTZ
);
CREATE INDEX idx_members_branch ON members(branch_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_tier   ON members(tier);
CREATE INDEX idx_members_search ON members USING gin(to_tsvector('simple', full_name || ' ' || membership_number || ' ' || phone));

CREATE TABLE IF NOT EXISTS membership_cards (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    card_number VARCHAR(50) UNIQUE NOT NULL,
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_cards_member ON membership_cards(member_id);

CREATE TABLE IF NOT EXISTS membership_payments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id     UUID NOT NULL REFERENCES members(id),
    amount        NUMERIC(12,2) NOT NULL,
    currency      VARCHAR(10) NOT NULL DEFAULT 'NPR',
    method        VARCHAR(30) NOT NULL,
    reference     VARCHAR(150),
    status        VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
    paid_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_from    TIMESTAMPTZ,
    valid_until   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_member ON membership_payments(member_id);
CREATE INDEX idx_payments_status ON membership_payments(status);

CREATE TABLE IF NOT EXISTS complaints (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(30) UNIQUE NOT NULL,
    title         VARCHAR(255) NOT NULL,
    description   TEXT NOT NULL,
    category      VARCHAR(50) NOT NULL,
    priority      VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status        VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    submitted_by  UUID NOT NULL REFERENCES users(id),
    assigned_to   UUID REFERENCES users(id),
    branch_id     UUID REFERENCES branches(id),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at   TIMESTAMPTZ,
    deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_complaints_status   ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_branch   ON complaints(branch_id);
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);

CREATE TABLE IF NOT EXISTS complaint_comments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id      UUID NOT NULL REFERENCES users(id),
    body         TEXT NOT NULL,
    is_internal  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title             VARCHAR(255) NOT NULL,
    title_nepali      VARCHAR(255),
    slug              VARCHAR(255) UNIQUE NOT NULL,
    description       TEXT NOT NULL,
    category          VARCHAR(50) NOT NULL,
    status            VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    starts_at         TIMESTAMPTZ NOT NULL,
    ends_at           TIMESTAMPTZ NOT NULL,
    location          VARCHAR(255) NOT NULL,
    capacity          INT,
    registered_count  INT NOT NULL DEFAULT 0,
    cover_image_url   TEXT,
    branch_id         UUID REFERENCES branches(id),
    created_by        UUID NOT NULL REFERENCES users(id),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_status  ON events(status);
CREATE INDEX idx_events_starts  ON events(starts_at);
CREATE INDEX idx_events_branch  ON events(branch_id);

CREATE TABLE IF NOT EXISTS event_registrations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id),
    member_id   UUID REFERENCES members(id),
    status      VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS news (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(255) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    title_nepali    VARCHAR(255),
    excerpt         TEXT NOT NULL,
    content         TEXT NOT NULL,
    cover_image_url TEXT,
    category        VARCHAR(50) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    author_id       UUID NOT NULL REFERENCES users(id),
    tags            TEXT[] DEFAULT '{}',
    views           INT NOT NULL DEFAULT 0,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_news_status  ON news(status);
CREATE INDEX idx_news_pubdate ON news(published_at DESC);

CREATE TABLE IF NOT EXISTS documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    file_url    TEXT NOT NULL,
    file_type   VARCHAR(50) NOT NULL,
    file_size   BIGINT NOT NULL,
    category    VARCHAR(50) NOT NULL,
    visibility  VARCHAR(20) NOT NULL DEFAULT 'MEMBERS',
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_documents_visibility ON documents(visibility);
CREATE INDEX idx_documents_category  ON documents(category);

CREATE TABLE IF NOT EXISTS donations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    donor_name     VARCHAR(200) NOT NULL,
    donor_email    VARCHAR(150),
    donor_phone    VARCHAR(30),
    amount         NUMERIC(12,2) NOT NULL,
    currency       VARCHAR(10) NOT NULL DEFAULT 'NPR',
    method         VARCHAR(30) NOT NULL,
    purpose        TEXT,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_donations_method ON donations(method);

CREATE TABLE IF NOT EXISTS notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    body       TEXT NOT NULL,
    type       VARCHAR(20) NOT NULL DEFAULT 'INFO',
    link       TEXT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,
    resource    VARCHAR(50) NOT NULL,
    resource_id UUID,
    ip          INET,
    user_agent  TEXT,
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_user     ON audit_logs(user_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource, resource_id);
CREATE INDEX idx_audit_created  ON audit_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS legal_cases (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_number      VARCHAR(50) UNIQUE NOT NULL,
    title            VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL,
    type             VARCHAR(50) NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'INTAKE',
    member_id        UUID REFERENCES members(id),
    assigned_advisor UUID REFERENCES users(id),
    branch_id        UUID REFERENCES branches(id),
    filed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_hearing_at  TIMESTAMPTZ,
    resolved_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_legal_status ON legal_cases(status);
CREATE INDEX idx_legal_type   ON legal_cases(type);

CREATE TABLE IF NOT EXISTS training_programs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title            VARCHAR(255) NOT NULL,
    title_nepali     VARCHAR(255),
    description      TEXT NOT NULL,
    starts_at        TIMESTAMPTZ NOT NULL,
    ends_at          TIMESTAMPTZ NOT NULL,
    location         VARCHAR(255) NOT NULL,
    trainer          VARCHAR(200),
    capacity         INT,
    registered_count INT NOT NULL DEFAULT 0,
    status           VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    branch_id        UUID REFERENCES branches(id),
    created_by       UUID NOT NULL REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_training_status ON training_programs(status);
CREATE INDEX idx_training_starts ON training_programs(starts_at);

CREATE TABLE IF NOT EXISTS worker_incidents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NOT NULL,
    severity        VARCHAR(20) NOT NULL,
    occurred_at     TIMESTAMPTZ NOT NULL,
    location        VARCHAR(255) NOT NULL,
    workplace_name  VARCHAR(255),
    reported_by     UUID NOT NULL REFERENCES users(id),
    branch_id       UUID REFERENCES branches(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'REPORTED',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_incidents_severity ON worker_incidents(severity);
CREATE INDEX idx_incidents_status   ON worker_incidents(status);
