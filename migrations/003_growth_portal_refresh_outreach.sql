-- Growth, refresh, and engagement layer for SIW

CREATE TABLE IF NOT EXISTS candidate_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,
    full_name TEXT,
    email TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    personal_site_url TEXT,
    location TEXT,
    desired_roles TEXT[],
    resume_text TEXT NOT NULL,
    consent_to_store BOOLEAN NOT NULL DEFAULT FALSE,
    consent_to_contact BOOLEAN NOT NULL DEFAULT FALSE,
    source_ip_hash VARCHAR(64),
    user_agent_hash VARCHAR(64),
    status TEXT NOT NULL DEFAULT 'received',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_candidate_uploads_email ON candidate_uploads(email);
CREATE INDEX IF NOT EXISTS idx_candidate_uploads_status ON candidate_uploads(status);

CREATE TABLE IF NOT EXISTS candidate_refresh_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    priority INTEGER NOT NULL DEFAULT 5,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_refresh_jobs_status ON candidate_refresh_jobs(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_candidate_refresh_jobs_candidate ON candidate_refresh_jobs(candidate_id);

CREATE TABLE IF NOT EXISTS candidate_linked_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    profile_type TEXT NOT NULL,
    profile_url TEXT NOT NULL,
    added_by TEXT NOT NULL DEFAULT 'manual_or_candidate',
    consent_basis TEXT NOT NULL DEFAULT 'manual_or_candidate_provided',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, profile_type, profile_url)
);

CREATE INDEX IF NOT EXISTS idx_candidate_linked_profiles_type ON candidate_linked_profiles(profile_type);

CREATE TABLE IF NOT EXISTS outreach_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    channel TEXT NOT NULL DEFAULT 'email',
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_by TEXT NOT NULL DEFAULT 'sourcingos',
    compliance_note TEXT NOT NULL DEFAULT 'Draft only. Human review required. Do not auto-send.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_drafts_candidate ON outreach_drafts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_status ON outreach_drafts(status);

CREATE TABLE IF NOT EXISTS outreach_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    draft_id UUID REFERENCES outreach_drafts(id) ON DELETE SET NULL,
    channel TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_events_candidate ON outreach_events(candidate_id);

CREATE TABLE IF NOT EXISTS source_refresh_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL UNIQUE,
    refresh_interval_days INTEGER NOT NULL DEFAULT 60,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO source_refresh_policies(source_name, refresh_interval_days, notes)
VALUES
('candidate_upload', 30, 'Candidate-uploaded records refresh on candidate updates or every 30 days.'),
('github', 60, 'Public GitHub API refresh. Respect API rate limits.'),
('manual_import', 90, 'Manual/approved imports refresh only when requested.'),
('orcid', 90, 'Research identity refresh.'),
('openalex', 90, 'Research publication refresh.')
ON CONFLICT (source_name) DO NOTHING;
