# roastpilot-cloud — Component Plan

**Repo (to create)**: `github.com/syamaner/roastpilot-cloud`
**Milestone**: M2 — Loop A; build only after M1 demo path is secured
**Stack**: Next.js (App Router) on Vercel + Supabase (Postgres, Storage)
**Status**: ✅ Drill-down complete (7 June 2026) — see [`plan.md`](plan.md)

## Documents

- [`plan.md`](plan.md) — full component plan: decisions D10–D13, architecture,
  Postgres schema + RLS, sync API contract (idempotency/retry semantics shared
  with roastpilot-agent), public roast page + review flow, reference-summary
  aggregation, privacy/deletion, repo layout, testing plan, epics C1–C7,
  sub-agent definitions.

## Decisions made in drill-down

- **D10**: **Device token only** — no cloud login UI in M2; owner actions go
  device SPA → agent → cloud.
- **D11**: Review abuse control = **slug entropy + per-IP rate limit +
  honeypot**; revocation = regenerate slug. Signed tokens → backlog.
- **D12**: Reference summaries recomputed **on write** (upload/review/delete);
  no cron at this volume.
- **D13**: Agent **fetches references at roast start** (short timeout) with
  local-cache fallback; cloud outage never affects a roast.

## UI prototypes

- Review form: done (`../roastpilot-agent/sketches/cloud-review/`,
  `cloud-review-mobile.png`).
- Public roast page: prompt F in `../roastpilot-agent/ui-prompts.md` —
  generate at C4.

## Remaining open items (tracked in plan.md §14)

1. Vercel body limit vs real export sizes (C3; signed-URL fallback designed).
2. Rate-limit backend: Upstash vs Postgres counter (C5).
3. `summary.json` field paths for FC temp vs real MCP fixture (C2).
4. OG preview image design (C4).
