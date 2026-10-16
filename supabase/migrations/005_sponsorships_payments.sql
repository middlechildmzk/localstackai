-- 002_sponsorships_payments.sql
-- Paid-showcase payment bookkeeping for the `sponsorships` table (Phase 2 monetization).
--
-- NOTE (Role Agent 3, 2026-10-15): this migration is additive-only and guarded
-- with IF NOT EXISTS so it is safe to apply alongside other agents' migrations.
-- It exists because the paid-showcase flow must record (a) the Stripe Checkout
-- session id and (b) a paid-but-pending-approval state — neither is representable
-- in the 001 schema, and the trust rules REQUIRE that a paid sponsorship stays
-- is_active=false until a human approves it in /admin/sponsorships.
--
-- Trust rule, stated three ways so no future code path can miss it:
--   1. The Stripe webhook may set payment_status='paid' but MUST NEVER set
--      is_active=true. Only /admin/sponsorships (human action) may do that.
--   2. Public reads are locked by the "sponsorships_public_active" RLS policy
--      below: anonymous users can only see rows with is_active=true AND a
--      currently-valid date window. Pending/expired rows are invisible even if
--      a component forgets to filter.
--   3. The scoring/rank pipeline must remain blind to money: nothing in this
--      migration touches tools.tool_score, and no rank query may join this table.

alter table sponsorships
  add column if not exists stripe_session_id text;

alter table sponsorships
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'expired', 'refunded'));

alter table sponsorships
  add column if not exists paid_at timestamptz;

create unique index if not exists sponsorships_stripe_session_idx
  on sponsorships (stripe_session_id)
  where stripe_session_id is not null;

-- Defense in depth: even a buggy component cannot leak pending/expired
-- sponsorships to the public. The SponsoredSlot component ALSO filters on
-- is_active + date window in its own query; this policy is the backstop.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sponsorships'
      and policyname = 'sponsorships_public_active'
  ) then
    create policy "sponsorships_public_active" on sponsorships for select
      using (
        is_active = true
        and starts_at <= now()
        and ends_at >= now()
      );
  end if;
end
$$;
