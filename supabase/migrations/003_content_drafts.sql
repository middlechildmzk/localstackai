-- Migration 003: Content drafts (Loop 4 — Content agent)
--
-- The content agent writes drafts FROM graph data only. It never publishes:
-- rows enter as status 'draft' and a human moves them to 'approved' /
-- 'rejected' in /admin/drafts. Rendering approved drafts as live pages is
-- a follow-up; there is intentionally no publish path in this migration.

create table content_drafts (
  id            uuid primary key default uuid_generate_v4(),
  kind          text not null check (kind in ('compare','alternatives','learn')),
  slug          text not null unique,
  title         text not null,
  body_markdown text not null,
  source_data   jsonb not null default '{}'::jsonb,
  status        text not null default 'draft'
                check (status in ('draft','approved','published','rejected')),
  created_at    timestamptz not null default now()
);

alter table content_drafts enable row level security;

-- Admin-only, following the 001 pattern (is_admin() defined in 001).
-- Drafts never surface to the public site through this table.
create policy "content_drafts_admin" on content_drafts for all using (is_admin());

create index content_drafts_status_idx on content_drafts(status);
create index content_drafts_kind_idx on content_drafts(kind);
create index content_drafts_created_idx on content_drafts(created_at desc);
