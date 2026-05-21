CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

DROP TABLE IF EXISTS compliance_audit_log CASCADE;
DROP TABLE IF EXISTS source_sync_state CASCADE;
DROP TABLE IF EXISTS candidate_experiences CASCADE;
DROP TABLE IF EXISTS candidate_skills CASCADE;
DROP TABLE IF EXISTS candidate_sources CASCADE;
DROP TABLE IF EXISTS candidates CASCADE;

CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_name TEXT NOT NULL,
    primary_email TEXT UNIQUE,
    primary_location TEXT,
    headline TEXT,
    current_role TEXT,
    current_company TEXT,
    summary_bio TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX idx_candidates_trgm_name ON candidates USING gist (canonical_name gist_trgm_ops);
CREATE INDEX idx_candidates_active_lookup ON candidates(id) WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE TABLE candidate_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    source_user_id TEXT NOT NULL,
    profile_url TEXT,
    username_handle TEXT,
    raw_payload JSONB NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (source_name, source_user_id)
);

CREATE INDEX idx_candidate_sources_lookup ON candidate_sources(source_name, source_user_id);
CREATE INDEX idx_candidate_sources_hash ON candidate_sources(payload_hash);

CREATE TABLE candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    source_name TEXT NOT NULL,
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.80,
    extracted_by TEXT NOT NULL DEFAULT 'heuristic_regex',
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, skill_name, source_name)
);

CREATE INDEX idx_candidate_skills_name ON candidate_skills(skill_name);

CREATE TABLE candidate_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    source_name TEXT NOT NULL,
    description TEXT
);

CREATE INDEX idx_candidate_experiences_corp ON candidate_experiences(company);

CREATE TABLE source_sync_state (
    source_name TEXT PRIMARY KEY,
    last_cursor TEXT DEFAULT NULL,
    last_run_status TEXT NOT NULL,
    error_message TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE compliance_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    anonymized_key_hash VARCHAR(64) NOT NULL,
    action_summary TEXT NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_audit_hash ON compliance_audit_log(anonymized_key_hash);
