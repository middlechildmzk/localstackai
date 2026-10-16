-- StackBuilder AI — 004: Digest + Social drafts (Loop 5, distribution)
-- Drafts only. Nothing here publishes, posts, or sends email.
-- Dan approves drafts in /admin/digests. Sending is a manual human action.

-- ─── Digest drafts ──────────────────────────────────────────────────────────
create table digest_drafts (
  id          uuid primary key default uuid_generate_v4(),
  subject     text not null,
  body_html   text not null,
  tool_ids    uuid[] not null default '{}',
  status      text not null default 'draft' check (status in ('draft', 'approved', 'sent')),
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamptz,
  sent_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index digest_drafts_status_idx on digest_drafts(status);
create index digest_drafts_created_idx on digest_drafts(created_at desc);

-- ─── Social drafts ──────────────────────────────────────────────────────────
create table social_drafts (
  id         uuid primary key default uuid_generate_v4(),
  platform   text not null check (platform in ('x', 'linkedin')),
  body       text not null,
  tool_id    uuid references tools(id) on delete set null,
  status     text not null default 'draft' check (status in ('draft', 'approved', 'posted')),
  created_at timestamptz not null default now()
);

create index social_drafts_status_idx on social_drafts(status);
create index social_drafts_created_idx on social_drafts(created_at desc);

-- ─── RLS (admin-only, matches the 001 pattern) ──────────────────────────────
alter table digest_drafts enable row level security;
alter table social_drafts enable row level security;

create policy "digest_drafts_admin" on digest_drafts for all using (is_admin());
create policy "social_drafts_admin" on social_drafts for all using (is_admin());
