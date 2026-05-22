CREATE TABLE IF NOT EXISTS provenance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    evidence_url TEXT,
    evidence_hash VARCHAR(64),
    license_label TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provenance_candidate ON provenance_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_provenance_source ON provenance_events(source_name);
CREATE INDEX IF NOT EXISTS idx_provenance_event_type ON provenance_events(event_type);

CREATE TABLE IF NOT EXISTS identity_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    to_candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    edge_type TEXT NOT NULL,
    confidence_score NUMERIC(4,3) NOT NULL DEFAULT 0.500,
    evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(from_candidate_id, to_candidate_id, edge_type)
);

CREATE INDEX IF NOT EXISTS idx_identity_edges_from ON identity_edges(from_candidate_id);
CREATE INDEX IF NOT EXISTS idx_identity_edges_to ON identity_edges(to_candidate_id);
CREATE INDEX IF NOT EXISTS idx_identity_edges_type ON identity_edges(edge_type);

CREATE TABLE IF NOT EXISTS role_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    role_key TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    explanation JSONB NOT NULL DEFAULT '{}'::jsonb,
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(candidate_id, role_key)
);

CREATE INDEX IF NOT EXISTS idx_role_scores_candidate ON role_scores(candidate_id);
CREATE INDEX IF NOT EXISTS idx_role_scores_role ON role_scores(role_key);
CREATE INDEX IF NOT EXISTS idx_role_scores_score ON role_scores(score);

CREATE TABLE IF NOT EXISTS embedding_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    object_type TEXT NOT NULL,
    object_id TEXT,
    text_hash VARCHAR(64) NOT NULL,
    embedding_model TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_embedding_jobs_status ON embedding_jobs(status);
CREATE INDEX IF NOT EXISTS idx_embedding_jobs_candidate ON embedding_jobs(candidate_id);

CREATE TABLE IF NOT EXISTS adapter_health_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name TEXT NOT NULL,
    status TEXT NOT NULL,
    latency_ms INTEGER,
    error_message TEXT,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adapter_health_source ON adapter_health_events(source_name);
CREATE INDEX IF NOT EXISTS idx_adapter_health_status ON adapter_health_events(status);

CREATE TABLE IF NOT EXISTS reviewer_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL,
    feedback_value TEXT NOT NULL,
    role_key TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviewer_feedback_candidate ON reviewer_feedback(candidate_id);
CREATE INDEX IF NOT EXISTS idx_reviewer_feedback_type ON reviewer_feedback(feedback_type);
