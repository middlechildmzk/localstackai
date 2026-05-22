ALTER TABLE candidates ADD COLUMN IF NOT EXISTS orcid_id TEXT UNIQUE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS github_handle TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS gitlab_handle TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS kaggle_handle TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS codeforces_handle TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS mastodon_handle TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS devto_handle TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS scholar_id TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS arxiv_ids TEXT[];

CREATE TABLE IF NOT EXISTS candidate_signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    signal_type TEXT NOT NULL,
    signal_value TEXT NOT NULL,
    signal_source TEXT NOT NULL,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_signals_candidate ON candidate_signals(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_signals_type ON candidate_signals(signal_type);

CREATE TABLE IF NOT EXISTS candidate_publications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    doi TEXT,
    publication_year INTEGER,
    citation_count INTEGER DEFAULT 0,
    source_name TEXT NOT NULL,
    source_url TEXT,
    co_authors TEXT[],
    topics TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_publications_candidate ON candidate_publications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_publications_year ON candidate_publications(publication_year);
CREATE INDEX IF NOT EXISTS idx_candidate_publications_source ON candidate_publications(source_name);
