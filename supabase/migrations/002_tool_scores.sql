-- StackBuilder AI — Migration 002: tool scoring engine
--
-- Adds compute_tool_scores(), the Loop 3 scoring function. It derives every
-- data-driven score component on tools from REAL evidence only:
--   analytics_events (7-day windows), trending_scores, the stack/workflow
--   graph, freshness state, and listing completeness.
--
-- HARD TRUST BOUNDARIES (do not weaken):
--   1. MONEY-BLIND: this function NEVER references the is_sponsored column
--      and NEVER touches the sponsorships table. The rank pipeline is blind
--      to money by construction: a paid showcase can buy a labeled sponsored
--      slot, never a better rank. Any future edit to this function must keep
--      it money-blind.
--   2. editor_fit is human-set and is NEVER overwritten here. The UPDATE
--      below deliberately excludes it from the SET list; it is only *read*
--      as an input to tool_score (at its neutral default of 0 when no human
--      has set a value).
--   3. No fabricated metrics: every component is computed from a real check,
--      event, or listing attribute. No invented values.
--
-- Score components (each stored on tools, clamped to 0..1):
--
--   verification_score   enum base: verified=1.0, fresh=0.7, unverified=0.3,
--                        stale=0.1; +0.10 if last_verified_at within 14 days
--                        (+0.05 within 90 days); +0.10 if is_claimed; cap 1.
--   freshness_score      recency decay on last_verified_at with a 30-day
--                        half-life: power(0.5, days_since / 30). NULL -> 0.
--   stack_usage_score    0.5 * (stack_count / max stack_count)
--                      + 0.5 * (workflow_tools references / max references).
--   save_velocity        saves in analytics_events (event_type='save') in the
--                        last 7 days, / max saves 7d.
--   click_quality        outbound_click in analytics_events in the last 7
--                        days, / max clicks 7d.
--   trend_velocity       trending_scores.trending_score / max trending_score
--                        (run compute_trending_scores() first; tools with no
--                        row score 0 here).
--   pricing_transparency average of 4 completeness flags: pricing_model set
--                        (a required column, so this is a 0.25 floor),
--                        starting_price set, pricing_notes set, free-plan
--                        clarity (has_free_plan true, or pricing_model in
--                        ('free','open_source')).
--   claim_confidence     1.0 if is_claimed else 0.2.
--   category_relevance   1.0 with >=1 category AND >=1 tag; 0.5 with exactly
--                        one of the two; 0.0 otherwise.
--   spam_risk_penalty    simple, documented heuristics, capped at 1:
--                        0.20 missing website_url, 0.20 missing description,
--                        0.10 missing tagline, 0.10 all-caps name.
--
--   tool_score           weighted composite minus the spam penalty, clamped
--                        to [0,1]:
--                          0.20 * verification_score
--                        + 0.15 * freshness_score
--                        + 0.15 * stack_usage_score
--                        + 0.10 * save_velocity
--                        + 0.10 * click_quality
--                        + 0.10 * trend_velocity
--                        + 0.05 * pricing_transparency
--                        + 0.05 * claim_confidence
--                        + 0.05 * category_relevance
--                        + 0.05 * editor_fit      (human-set; read-only here)
--                        - spam_risk_penalty
--   Displayed to users only as fit labels (Strong fit / Worth a look /
--   Long shot) with reason chips — never raw numbers.
--
-- Velocity/count components are normalized by the current maximum across the
-- data set (guarded against division by zero), so scores are relative and
-- adapt as the catalog grows. Scores are computed for all tools; the display
-- layer shows only published ones.

create or replace function compute_tool_scores()
returns void
language plpgsql
as $func$
declare
  max_saves   numeric;
  max_clicks  numeric;
  max_stacks  numeric;
  max_wf_refs numeric;
  max_trend   numeric;
begin
  -- Normalization denominators: one pass each, across the whole data set.
  select greatest(coalesce(max(cnt), 0), 1) into max_saves from (
    select count(*) as cnt
    from analytics_events
    where event_type = 'save'
      and created_at > now() - interval '7 days'
    group by entity_id
  ) s;

  select greatest(coalesce(max(cnt), 0), 1) into max_clicks from (
    select count(*) as cnt
    from analytics_events
    where event_type = 'outbound_click'
      and created_at > now() - interval '7 days'
    group by entity_id
  ) c;

  select greatest(coalesce(max(stack_count), 0), 1) into max_stacks from tools;

  select greatest(coalesce(max(cnt), 0), 1) into max_wf_refs from (
    select count(*) as cnt
    from workflow_tools
    group by tool_id
  ) w;

  select greatest(coalesce(max(trending_score), 0), 1) into max_trend
  from trending_scores;

  -- Recompute every component in one set-based pass.
  -- NOTE: editor_fit is read, never written — it is absent from the SET list.
  update tools t
  set
    verification_score   = comp.verification_score,
    freshness_score      = comp.freshness_score,
    stack_usage_score    = comp.stack_usage_score,
    save_velocity        = comp.save_velocity,
    click_quality        = comp.click_quality,
    trend_velocity       = comp.trend_velocity,
    pricing_transparency = comp.pricing_transparency,
    claim_confidence     = comp.claim_confidence,
    category_relevance   = comp.category_relevance,
    spam_risk_penalty    = comp.spam_risk_penalty,
    tool_score           = comp.tool_score,
    updated_at           = now()
  from (
    select
      parts.tool_id,
      parts.verification_score,
      parts.freshness_score,
      parts.stack_usage_score,
      parts.save_velocity,
      parts.click_quality,
      parts.trend_velocity,
      parts.pricing_transparency,
      parts.claim_confidence,
      parts.category_relevance,
      parts.spam_risk_penalty,
      greatest(0, least(1,
        0.20 * parts.verification_score
        + 0.15 * parts.freshness_score
        + 0.15 * parts.stack_usage_score
        + 0.10 * parts.save_velocity
        + 0.10 * parts.click_quality
        + 0.10 * parts.trend_velocity
        + 0.05 * parts.pricing_transparency
        + 0.05 * parts.claim_confidence
        + 0.05 * parts.category_relevance
        + 0.05 * parts.editor_fit
        - parts.spam_risk_penalty
      )) as tool_score
    from (
      select
        t0.id as tool_id,
        t0.editor_fit as editor_fit,

        -- verification_score: enum base + recency boost + claimed boost
        least(1,
          (case t0.freshness
             when 'verified'   then 1.0
             when 'fresh'      then 0.7
             when 'unverified' then 0.3
             when 'stale'      then 0.1
           end)
          + (case
               when t0.last_verified_at is null then 0
               when t0.last_verified_at > now() - interval '14 days' then 0.10
               when t0.last_verified_at > now() - interval '90 days' then 0.05
               else 0
             end)
          + (case when t0.is_claimed then 0.10 else 0 end)
        ) as verification_score,

        -- freshness_score: 30-day half-life decay; never verified -> 0
        (case
           when t0.last_verified_at is null then 0::numeric
           else least(1, power(0.5::numeric,
             ((extract(epoch from (now() - t0.last_verified_at)) / 86400)::numeric) / 30))
         end) as freshness_score,

        -- stack_usage_score: normalized stack_count + workflow graph references
        (0.5 * (t0.stack_count::numeric / max_stacks)
         + 0.5 * (coalesce(wf.refs, 0)::numeric / max_wf_refs)
        ) as stack_usage_score,

        -- save_velocity: last-7d saves, normalized
        (coalesce(sv.cnt, 0)::numeric / max_saves) as save_velocity,

        -- click_quality: last-7d outbound clicks, normalized
        (coalesce(cq.cnt, 0)::numeric / max_clicks) as click_quality,

        -- trend_velocity: latest trending_score, normalized (0 if never scored)
        (coalesce(ts.trending_score, 0) / max_trend) as trend_velocity,

        -- pricing_transparency: completeness of the four pricing fields
        ((
          1 -- pricing_model is a required column: always present (0.25 floor)
          + (case when t0.starting_price is not null then 1 else 0 end)
          + (case when t0.pricing_notes is not null
                    and length(trim(t0.pricing_notes)) > 0 then 1 else 0 end)
          + (case when t0.has_free_plan
                    or t0.pricing_model in ('free', 'open_source')
                  then 1 else 0 end)
        )::numeric / 4) as pricing_transparency,

        -- claim_confidence: maker claim present or not
        (case when t0.is_claimed then 1.0 else 0.2 end) as claim_confidence,

        -- category_relevance: catalogued with category AND tag
        (case
           when cat.tool_id is not null and tg.tool_id is not null then 1.0
           when cat.tool_id is not null or tg.tool_id is not null then 0.5
           else 0.0
         end) as category_relevance,

        -- spam_risk_penalty: simple, documented heuristics; capped at 1
        least(1,
          (case when t0.website_url is null
                  or length(trim(t0.website_url)) = 0 then 0.20 else 0 end)
          + (case when t0.description is null
                    or length(trim(t0.description)) = 0 then 0.20 else 0 end)
          + (case when t0.tagline is null
                    or length(trim(t0.tagline)) = 0 then 0.10 else 0 end)
          + (case when t0.name = upper(t0.name)
                    and t0.name ~ '[A-Za-z]{3,}' then 0.10 else 0 end)
        ) as spam_risk_penalty

      from tools t0
      left join (
        select entity_id as tool_id, count(*) as cnt
        from analytics_events
        where event_type = 'save'
          and created_at > now() - interval '7 days'
        group by entity_id
      ) sv on sv.tool_id = t0.id
      left join (
        select entity_id as tool_id, count(*) as cnt
        from analytics_events
        where event_type = 'outbound_click'
          and created_at > now() - interval '7 days'
        group by entity_id
      ) cq on cq.tool_id = t0.id
      left join (
        select tool_id, count(*) as refs
        from workflow_tools
        group by tool_id
      ) wf on wf.tool_id = t0.id
      left join trending_scores ts on ts.tool_id = t0.id
      left join (
        select distinct tool_id from tool_categories
      ) cat on cat.tool_id = t0.id
      left join (
        select distinct tool_id from tool_tags
      ) tg on tg.tool_id = t0.id
    ) parts
  ) comp
  where comp.tool_id = t.id;
end;
$func$;
