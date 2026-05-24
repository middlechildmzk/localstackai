-- StackBuilder AI V21 Schema
-- Run via: supabase db push

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── Enums ──────────────────────────────────────────────────────────────────
create type freshness_status as enum ('verified', 'fresh', 'stale', 'unverified');
create type tool_relationship_type as enum ('alternative', 'complement', 'replaces', 'integrates_with', 'used_with');
create type data_flow_type as enum ('native_api', 'webhook', 'zapier', 'make', 'manual_export', 'unknown');
create type submission_status as enum ('pending', 'approved', 'rejected', 'duplicate');
create type claim_status as enum ('pending', 'approved', 'rejected');
create type moderation_entity as enum ('tool', 'submission', 'claim', 'stack', 'review');
create type analytics_event_type as enum (
  'tool_view', 'search', 'save', 'stack_create', 'stack_fork',
  'compare_click', 'outbound_click', 'submit_tool', 'claim_tool',
  'newsletter_signup', 'stack_view', 'workflow_view'
);
create type pricing_model as enum ('free', 'freemium', 'paid', 'subscription', 'usage_based', 'enterprise', 'open_source');
create type stack_visibility as enum ('public', 'private', 'unlisted');

-- ─── Users / Profiles ───────────────────────────────────────────────────────
create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  username      text unique,
  display_name  text,
  avatar_url    text,
  bio           text,
  website       text,
  is_admin      boolean not null default false,
  is_maker      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── Categories ─────────────────────────────────────────────────────────────
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  slug        text not null unique,
  description text,
  icon        text,
  color       text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── Tags ───────────────────────────────────────────────────────────────────
create table tags (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null unique,
  slug       text not null unique,
  created_at timestamptz not null default now()
);

-- ─── Tools ──────────────────────────────────────────────────────────────────
create table tools (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text not null unique,
  name                text not null,
  tagline             text,
  description         text,
  logo_url            text,
  website_url         text,
  affiliate_url       text,
  pricing_model       pricing_model not null default 'freemium',
  has_free_plan       boolean not null default false,
  starting_price      numeric(10,2),
  pricing_notes       text,
  best_for            text[],
  not_ideal_for       text[],
  freshness           freshness_status not null default 'unverified',
  last_verified_at    timestamptz,
  is_sponsored        boolean not null default false,
  is_claimed          boolean not null default false,
  claimed_by          uuid references profiles(id),
  is_featured         boolean not null default false,
  is_published        boolean not null default true,
  -- Scoring
  tool_score          numeric(5,4) not null default 0,
  editor_fit          numeric(5,4) not null default 0,
  verification_score  numeric(5,4) not null default 0,
  freshness_score     numeric(5,4) not null default 0,
  stack_usage_score   numeric(5,4) not null default 0,
  save_velocity       numeric(5,4) not null default 0,
  click_quality       numeric(5,4) not null default 0,
  trend_velocity      numeric(5,4) not null default 0,
  pricing_transparency numeric(5,4) not null default 0,
  claim_confidence    numeric(5,4) not null default 0,
  category_relevance  numeric(5,4) not null default 0,
  spam_risk_penalty   numeric(5,4) not null default 0,
  -- Counters (denormalized for perf)
  view_count          int not null default 0,
  save_count          int not null default 0,
  stack_count         int not null default 0,
  click_count         int not null default 0,
  -- Meta
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index tools_slug_idx on tools(slug);
create index tools_score_idx on tools(tool_score desc);
create index tools_published_idx on tools(is_published) where is_published = true;
create index tools_name_trgm_idx on tools using gin(name gin_trgm_ops);

-- ─── Tool ↔ Categories ──────────────────────────────────────────────────────
create table tool_categories (
  tool_id     uuid not null references tools(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (tool_id, category_id)
);

-- ─── Tool ↔ Tags ─────────────────────────────────────────────────────────────
create table tool_tags (
  tool_id uuid not null references tools(id) on delete cascade,
  tag_id  uuid not null references tags(id) on delete cascade,
  primary key (tool_id, tag_id)
);

-- ─── Tool Relationships (the graph) ─────────────────────────────────────────
create table tool_relationships (
  id               uuid primary key default uuid_generate_v4(),
  source_tool_id   uuid not null references tools(id) on delete cascade,
  target_tool_id   uuid not null references tools(id) on delete cascade,
  relationship_type tool_relationship_type not null,
  workflow_context text,
  confidence       numeric(4,3) not null default 0.5 check (confidence between 0 and 1),
  source           text not null default 'admin',
  created_at       timestamptz not null default now(),
  unique (source_tool_id, target_tool_id, relationship_type)
);

create index tool_rel_source_idx on tool_relationships(source_tool_id);
create index tool_rel_target_idx on tool_relationships(target_tool_id);

-- ─── Workflows ───────────────────────────────────────────────────────────────
create table workflows (
  id           uuid primary key default uuid_generate_v4(),
  slug         text not null unique,
  title        text not null,
  description  text,
  outcome      text,
  target_role  text,
  hero_image   text,
  is_featured  boolean not null default false,
  is_published boolean not null default true,
  sort_order   int not null default 0,
  view_count   int not null default 0,
  save_count   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index workflows_slug_idx on workflows(slug);

-- ─── Workflow Steps ──────────────────────────────────────────────────────────
create table workflow_steps (
  id           uuid primary key default uuid_generate_v4(),
  workflow_id  uuid not null references workflows(id) on delete cascade,
  step_number  int not null,
  title        text not null,
  description  text,
  created_at   timestamptz not null default now(),
  unique (workflow_id, step_number)
);

-- ─── Workflow ↔ Tools ────────────────────────────────────────────────────────
create table workflow_tools (
  id          uuid primary key default uuid_generate_v4(),
  workflow_id uuid not null references workflows(id) on delete cascade,
  step_id     uuid references workflow_steps(id) on delete set null,
  tool_id     uuid not null references tools(id) on delete cascade,
  tier        text not null default 'recommended' check (tier in ('budget','recommended','pro')),
  notes       text,
  sort_order  int not null default 0
);

-- ─── Stacks ──────────────────────────────────────────────────────────────────
create table stacks (
  id             uuid primary key default uuid_generate_v4(),
  slug           text not null unique,
  title          text not null,
  description    text,
  owner_id       uuid references profiles(id) on delete set null,
  workflow_id    uuid references workflows(id) on delete set null,
  forked_from_id uuid references stacks(id) on delete set null,
  visibility     stack_visibility not null default 'public',
  is_featured    boolean not null default false,
  monthly_cost   numeric(10,2),
  view_count     int not null default 0,
  fork_count     int not null default 0,
  save_count     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index stacks_slug_idx on stacks(slug);
create index stacks_owner_idx on stacks(owner_id);
create index stacks_public_idx on stacks(visibility) where visibility = 'public';

-- ─── Stack ↔ Tools ───────────────────────────────────────────────────────────
create table stack_tools (
  id              uuid primary key default uuid_generate_v4(),
  stack_id        uuid not null references stacks(id) on delete cascade,
  tool_id         uuid not null references tools(id) on delete cascade,
  role_in_stack   text,
  step_order      int not null default 0,
  substitute_group text,
  monthly_cost    numeric(8,2),
  data_flow_type  data_flow_type not null default 'unknown',
  notes           text,
  created_at      timestamptz not null default now()
);

create index stack_tools_stack_idx on stack_tools(stack_id);

-- ─── Reviews ─────────────────────────────────────────────────────────────────
create table reviews (
  id           uuid primary key default uuid_generate_v4(),
  tool_id      uuid not null references tools(id) on delete cascade,
  user_id      uuid not null references profiles(id) on delete cascade,
  rating       int not null check (rating between 1 and 5),
  title        text,
  body         text,
  use_case     text,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (tool_id, user_id)
);

-- ─── Votes ───────────────────────────────────────────────────────────────────
create table votes (
  id         uuid primary key default uuid_generate_v4(),
  entity_id  uuid not null,
  entity_type text not null check (entity_type in ('tool','stack','workflow')),
  user_id    uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (entity_id, entity_type, user_id)
);

-- ─── Saves ───────────────────────────────────────────────────────────────────
create table saves (
  id          uuid primary key default uuid_generate_v4(),
  entity_id   uuid not null,
  entity_type text not null check (entity_type in ('tool','stack','workflow')),
  user_id     uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (entity_id, entity_type, user_id)
);

create index saves_user_idx on saves(user_id);

-- ─── Comparisons (cached) ────────────────────────────────────────────────────
create table comparisons (
  id          uuid primary key default uuid_generate_v4(),
  slug        text not null unique,
  tool_a_id   uuid not null references tools(id) on delete cascade,
  tool_b_id   uuid not null references tools(id) on delete cascade,
  summary     text,
  view_count  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── Affiliate Links ─────────────────────────────────────────────────────────
create table affiliate_links (
  id         uuid primary key default uuid_generate_v4(),
  tool_id    uuid not null references tools(id) on delete cascade,
  url        text not null,
  network    text,
  commission text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Sponsorships ────────────────────────────────────────────────────────────
create table sponsorships (
  id           uuid primary key default uuid_generate_v4(),
  tool_id      uuid not null references tools(id) on delete cascade,
  starts_at    timestamptz not null,
  ends_at      timestamptz not null,
  placement    text not null default 'launchboard',
  is_active    boolean not null default true,
  amount_usd   numeric(10,2),
  created_at   timestamptz not null default now()
);

-- ─── Submissions ─────────────────────────────────────────────────────────────
create table submissions (
  id              uuid primary key default uuid_generate_v4(),
  submitted_by    uuid references profiles(id) on delete set null,
  submitter_email text not null,
  tool_name       text not null,
  tool_url        text not null,
  tagline         text,
  description     text,
  pricing_notes   text,
  category_ids    uuid[],
  status          submission_status not null default 'pending',
  reviewer_id     uuid references profiles(id) on delete set null,
  review_notes    text,
  resulting_tool  uuid references tools(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index submissions_status_idx on submissions(status);

-- ─── Claims ──────────────────────────────────────────────────────────────────
create table claims (
  id            uuid primary key default uuid_generate_v4(),
  tool_id       uuid not null references tools(id) on delete cascade,
  claimed_by    uuid not null references profiles(id) on delete cascade,
  claimant_email text not null,
  proof_url     text,
  notes         text,
  status        claim_status not null default 'pending',
  reviewer_id   uuid references profiles(id) on delete set null,
  review_notes  text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index claims_status_idx on claims(status);

-- ─── Source Checks ───────────────────────────────────────────────────────────
create table source_checks (
  id           uuid primary key default uuid_generate_v4(),
  tool_id      uuid not null references tools(id) on delete cascade,
  check_type   text not null check (check_type in ('link','pricing','changelog','general')),
  source_url   text,
  status       text not null default 'pending' check (status in ('pending','ok','broken','changed','error')),
  notes        text,
  checked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index source_checks_tool_idx on source_checks(tool_id);
create index source_checks_status_idx on source_checks(status);

-- ─── Freshness Events ────────────────────────────────────────────────────────
create table freshness_events (
  id          uuid primary key default uuid_generate_v4(),
  tool_id     uuid not null references tools(id) on delete cascade,
  event_type  text not null,
  old_value   text,
  new_value   text,
  source      text not null default 'admin',
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index freshness_events_tool_idx on freshness_events(tool_id);

-- ─── Moderation Flags ────────────────────────────────────────────────────────
create table moderation_flags (
  id           uuid primary key default uuid_generate_v4(),
  entity_id    uuid not null,
  entity_type  moderation_entity not null,
  flagged_by   uuid references profiles(id) on delete set null,
  reason       text not null,
  is_resolved  boolean not null default false,
  resolved_by  uuid references profiles(id) on delete set null,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index mod_flags_entity_idx on moderation_flags(entity_id, entity_type);
create index mod_flags_unresolved_idx on moderation_flags(is_resolved) where is_resolved = false;

-- ─── Newsletter Subscribers ──────────────────────────────────────────────────
create table newsletter_subscribers (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  source      text,
  interests   text[],
  is_active   boolean not null default true,
  confirmed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index newsletter_email_idx on newsletter_subscribers(email);
create index newsletter_active_idx on newsletter_subscribers(is_active) where is_active = true;

-- ─── Analytics Events ────────────────────────────────────────────────────────
create table analytics_events (
  id          uuid primary key default uuid_generate_v4(),
  event_type  analytics_event_type not null,
  entity_id   uuid,
  entity_type text,
  user_id     uuid references profiles(id) on delete set null,
  session_id  text,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);

create index analytics_event_type_idx on analytics_events(event_type);
create index analytics_entity_idx on analytics_events(entity_id) where entity_id is not null;
create index analytics_created_idx on analytics_events(created_at desc);

-- ─── Admin Audit Log ─────────────────────────────────────────────────────────
create table admin_audit_log (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid not null references profiles(id) on delete cascade,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  notes       text,
  created_at  timestamptz not null default now()
);

create index audit_admin_idx on admin_audit_log(admin_id);
create index audit_created_idx on admin_audit_log(created_at desc);

-- ─── Trending Scores (materialized) ─────────────────────────────────────────
create table trending_scores (
  tool_id           uuid primary key references tools(id) on delete cascade,
  saves_7d          int not null default 0,
  clicks_7d         int not null default 0,
  stack_adds_7d     int not null default 0,
  maker_claim_boost numeric(4,3) not null default 0,
  freshness_boost   numeric(4,3) not null default 0,
  new_sub_boost     numeric(4,3) not null default 0,
  time_decay        numeric(6,4) not null default 1,
  spam_penalty      numeric(4,3) not null default 0,
  trending_score    numeric(10,6) not null default 0,
  computed_at       timestamptz not null default now()
);

-- ─── Triggers: updated_at ────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tools_updated_at before update on tools
  for each row execute procedure set_updated_at();
create trigger stacks_updated_at before update on stacks
  for each row execute procedure set_updated_at();
create trigger profiles_updated_at before update on profiles
  for each row execute procedure set_updated_at();
create trigger workflows_updated_at before update on workflows
  for each row execute procedure set_updated_at();
create trigger submissions_updated_at before update on submissions
  for each row execute procedure set_updated_at();
create trigger claims_updated_at before update on claims
  for each row execute procedure set_updated_at();

-- ─── Trigger: auto-create profile ────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── Trending Score Compute Function ─────────────────────────────────────────
create or replace function compute_trending_scores()
returns void language plpgsql as $$
declare
  r record;
  score numeric;
begin
  for r in
    select
      t.id as tool_id,
      coalesce(saves.cnt, 0) as saves_7d,
      coalesce(clicks.cnt, 0) as clicks_7d,
      coalesce(stacks.cnt, 0) as stack_adds_7d,
      case when t.is_claimed then 0.10 else 0 end as maker_claim_boost,
      case when t.last_verified_at > now() - interval '7 days' then 0.10 else 0 end as freshness_boost,
      case when t.created_at > now() - interval '7 days' then 0.05 else 0 end as new_sub_boost
    from tools t
    left join (
      select entity_id, count(*) as cnt
      from analytics_events
      where event_type = 'save' and created_at > now() - interval '7 days'
      group by entity_id
    ) saves on saves.entity_id = t.id
    left join (
      select entity_id, count(*) as cnt
      from analytics_events
      where event_type = 'outbound_click' and created_at > now() - interval '7 days'
      group by entity_id
    ) clicks on clicks.entity_id = t.id
    left join (
      select entity_id, count(*) as cnt
      from analytics_events
      where event_type = 'stack_create' and created_at > now() - interval '7 days'
      group by entity_id
    ) stacks on stacks.entity_id = t.id
    where t.is_published = true
  loop
    score := (
      0.30 * r.saves_7d
      + 0.25 * r.clicks_7d
      + 0.20 * r.stack_adds_7d
      + r.maker_claim_boost
      + r.freshness_boost
      + r.new_sub_boost
    ) * 1.0;

    insert into trending_scores (
      tool_id, saves_7d, clicks_7d, stack_adds_7d,
      maker_claim_boost, freshness_boost, new_sub_boost,
      trending_score, computed_at
    )
    values (
      r.tool_id, r.saves_7d, r.clicks_7d, r.stack_adds_7d,
      r.maker_claim_boost, r.freshness_boost, r.new_sub_boost,
      score, now()
    )
    on conflict (tool_id) do update set
      saves_7d = excluded.saves_7d,
      clicks_7d = excluded.clicks_7d,
      stack_adds_7d = excluded.stack_adds_7d,
      maker_claim_boost = excluded.maker_claim_boost,
      freshness_boost = excluded.freshness_boost,
      new_sub_boost = excluded.new_sub_boost,
      trending_score = excluded.trending_score,
      computed_at = excluded.computed_at;
  end loop;
end;
$$;

-- ─── RLS Policies ────────────────────────────────────────────────────────────

-- Enable RLS everywhere
alter table profiles enable row level security;
alter table tools enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table tool_categories enable row level security;
alter table tool_tags enable row level security;
alter table tool_relationships enable row level security;
alter table workflows enable row level security;
alter table workflow_steps enable row level security;
alter table workflow_tools enable row level security;
alter table stacks enable row level security;
alter table stack_tools enable row level security;
alter table reviews enable row level security;
alter table votes enable row level security;
alter table saves enable row level security;
alter table comparisons enable row level security;
alter table affiliate_links enable row level security;
alter table sponsorships enable row level security;
alter table submissions enable row level security;
alter table claims enable row level security;
alter table source_checks enable row level security;
alter table freshness_events enable row level security;
alter table moderation_flags enable row level security;
alter table newsletter_subscribers enable row level security;
alter table analytics_events enable row level security;
alter table admin_audit_log enable row level security;
alter table trending_scores enable row level security;

-- Helper: is admin
create or replace function is_admin()
returns boolean language sql security definer as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- Profiles: public read, own write
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_own_write" on profiles for all using (auth.uid() = id);
create policy "profiles_admin_all" on profiles for all using (is_admin());

-- Tools: published tools are public
create policy "tools_public_read" on tools for select using (is_published = true);
create policy "tools_admin_all" on tools for all using (is_admin());

-- Categories/tags: public read
create policy "categories_public" on categories for select using (true);
create policy "categories_admin" on categories for all using (is_admin());
create policy "tags_public" on tags for select using (true);
create policy "tags_admin" on tags for all using (is_admin());
create policy "tool_categories_public" on tool_categories for select using (true);
create policy "tool_categories_admin" on tool_categories for all using (is_admin());
create policy "tool_tags_public" on tool_tags for select using (true);
create policy "tool_tags_admin" on tool_tags for all using (is_admin());

-- Tool relationships: public read
create policy "tool_rel_public" on tool_relationships for select using (true);
create policy "tool_rel_admin" on tool_relationships for all using (is_admin());

-- Workflows: published are public
create policy "workflows_public" on workflows for select using (is_published = true);
create policy "workflows_admin" on workflows for all using (is_admin());
create policy "workflow_steps_public" on workflow_steps for select using (true);
create policy "workflow_steps_admin" on workflow_steps for all using (is_admin());
create policy "workflow_tools_public" on workflow_tools for select using (true);
create policy "workflow_tools_admin" on workflow_tools for all using (is_admin());

-- Stacks: public stacks readable
create policy "stacks_public_read" on stacks for select using (visibility = 'public');
create policy "stacks_own_read" on stacks for select using (auth.uid() = owner_id);
create policy "stacks_own_write" on stacks for all using (auth.uid() = owner_id);
create policy "stacks_admin" on stacks for all using (is_admin());
create policy "stack_tools_public" on stack_tools for select
  using (exists (select 1 from stacks where stacks.id = stack_id and stacks.visibility = 'public'));
create policy "stack_tools_own" on stack_tools for all
  using (exists (select 1 from stacks where stacks.id = stack_id and stacks.owner_id = auth.uid()));
create policy "stack_tools_admin" on stack_tools for all using (is_admin());

-- Reviews: published reviews public
create policy "reviews_public" on reviews for select using (is_published = true);
create policy "reviews_own" on reviews for all using (auth.uid() = user_id);
create policy "reviews_admin" on reviews for all using (is_admin());

-- Votes: own
create policy "votes_public" on votes for select using (true);
create policy "votes_own" on votes for all using (auth.uid() = user_id);

-- Saves: own only
create policy "saves_own" on saves for all using (auth.uid() = user_id);

-- Comparisons: public
create policy "comparisons_public" on comparisons for select using (true);
create policy "comparisons_admin" on comparisons for all using (is_admin());

-- Trending: public read
create policy "trending_public" on trending_scores for select using (true);

-- Submissions: own + admin
create policy "submissions_own" on submissions for insert with check (auth.uid() = submitted_by or submitted_by is null);
create policy "submissions_own_read" on submissions for select using (auth.uid() = submitted_by);
create policy "submissions_admin" on submissions for all using (is_admin());

-- Claims: own + admin
create policy "claims_own_insert" on claims for insert with check (auth.uid() = claimed_by);
create policy "claims_own_read" on claims for select using (auth.uid() = claimed_by);
create policy "claims_admin" on claims for all using (is_admin());

-- Admin-only tables
create policy "source_checks_admin" on source_checks for all using (is_admin());
create policy "freshness_events_admin" on freshness_events for all using (is_admin());
create policy "mod_flags_admin" on moderation_flags for all using (is_admin());
create policy "audit_log_admin" on admin_audit_log for all using (is_admin());
create policy "sponsorships_admin" on sponsorships for all using (is_admin());
create policy "affiliate_links_admin" on affiliate_links for all using (is_admin());

-- Newsletter: insert only public
create policy "newsletter_insert" on newsletter_subscribers for insert with check (true);
create policy "newsletter_admin" on newsletter_subscribers for all using (is_admin());

-- Analytics: insert public (server handles)
create policy "analytics_insert" on analytics_events for insert with check (true);
create policy "analytics_admin" on analytics_events for all using (is_admin());
