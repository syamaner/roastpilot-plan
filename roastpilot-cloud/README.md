# roastpilot-cloud — Component Plan

**Repo (to create)**: `github.com/syamaner/roastpilot-cloud`
**Milestone**: M2 — Loop A; build only after M1 demo path is secured
**Stack** (D97, 16 Jul 2026 — supersedes D2's Supabase choice): **Snowflake**
(tables, stages, aggregation, owner analytics) + Next.js on Vercel (public
surface only)
**Status**: ✅ Drill-down complete (7 June 2026); revised for Snowflake
(16 July 2026) — see [`plan.md`](plan.md)

## Documents

- [`factory.md`](factory.md) — **software factory spec (D98)**: issue-driven
  agent pipeline for C2–C8 (triage → implement → review, human merge), label
  taxonomy, security model, autonomy ratchet, F1 epic stories.
- [`plan.md`](plan.md) — full component plan: decisions D97 + D10–D13,
  two-plane architecture (Snowflake data platform / Vercel public surface),
  Snowflake schema + role/grant lockdown, connector sync contract
  (idempotency/retry semantics shared with roastpilot-agent), public roast
  page + review flow, reference-summary aggregation, privacy/deletion, repo
  layout, testing plan, epics C1–C8, sub-agent definitions, **cost model
  (§15)**.

## Decisions

- **D98**: **Factory-first build for C2–C8** — GitHub-issue-driven agent
  pipeline (`claude-code-action`, adapted from the hubble.md reference);
  human specs, clarifies, and merges; C1 + F1 conventional. See
  [`factory.md`](factory.md).
- **D97**: **Snowflake + Vercel** replaces Supabase. Agent syncs directly via
  `snowflake-connector-python` (key-pair auth); telemetry lands in a
  queryable table; the public taster surface stays on Vercel because
  Streamlit-in-Snowflake and SPCS public endpoints both require Snowflake
  authentication (verified 16 Jul 2026) — anonymous phone access must be
  hosted outside Snowflake.
- **D10**: **No cloud login UI in M2**; owner actions go device SPA → agent →
  cloud (mechanism amended by D97: key-pair service users instead of a
  bearer-token REST API).
- **D11**: Review abuse control = **slug entropy + per-IP rate limit +
  honeypot**; revocation = regenerate slug. Signed tokens → backlog.
- **D12**: Reference summaries recomputed **on write** via a shared stored
  procedure (upload/review/delete); no cron at this volume.
- **D13**: Agent **fetches references at roast start** (short timeout) with
  local-cache fallback; cloud outage never affects a roast.

## Cost (plan.md §15)

Build phase free on the Snowflake 30-day trial; steady state ≈ **£4–6/month**
(one X-SMALL warehouse, 60 s auto-suspend, resource-monitor capped at 5
credits/month ⇒ hard ceiling ~£10). Vercel Hobby, Upstash free tier and
Snowflake storage all round to £0. Snowflake has no perpetual free tier; the
~£5/month buys SQL over telemetry, stored-proc aggregation, and
Streamlit-in-Snowflake analysis.

## UI prototypes

- Review form: done (`../roastpilot-agent/sketches/cloud-review/`,
  `cloud-review-mobile.png`).
- Public roast page: prompt F in `../roastpilot-agent/ui-prompts.md` —
  generate at C4.

## Remaining open items (tracked in plan.md §14)

1. Rate-limit backend: Upstash vs Vercel KV (C5).
2. OG preview image design (C4).
3. Region choice: eu-west-2 vs US East (C1; ~£1/month delta).
4. Presigned artifact downloads vs SNOWFLAKE_SSE stage (C3).
5. Feedback-loop evaluation definition + defect-axis loop — both deliberately
   open, revisit at the cloud phase (plan.md §14.5–6).
