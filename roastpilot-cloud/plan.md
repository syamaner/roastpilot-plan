# roastpilot-cloud — Component Plan (M2, Loop A)

**Status**: Drilled down and agreed, 7 June 2026. **Revised 16 July 2026 (D97):
Snowflake replaces Supabase as the data platform; Vercel keeps the public
surface only. Same day (D98): C2–C8 built factory-first — see
[`factory.md`](factory.md).**
**Repo to create**: `github.com/syamaner/roastpilot-cloud`
**Stack** (per D97, superseding D2's Supabase choice): Next.js (App Router) on
Vercel (public pages + public review API only) + **Snowflake** (tables, stages,
aggregation, owner analytics)
**Timing**: built only after the M1 demo path is secured — M2 must never
compete with the July harness deadline (00-repository-structure.md).

---

## 1. Decisions (this drill-down)

| # | Decision | Choice | Notes |
|---|----------|--------|-------|
| D99 | M2 kickoff (17 Jul 2026) | **M2 starts now; C1 underway** | Operator ruling: remaining M1 work (E11 completion half, E12 validation) is operator/hardware-gated, not build-capacity-bound, so M2 no longer competes with the harness deadline — the timing rule is satisfied. C1 issues #1–#4 flipped `ready-to-implement` same day; C1-S1 started. **Region (resolves §14 item 7 with a deviation):** the Snowflake trial account was created 16 Jul on **Azure UK South (London), Standard edition** (account identifier `HVPXLEY-EX88650`, region `AZURE_UKSOUTH`), not the AWS eu-west-2 default — data stays in London; Azure London on-demand is in the same ballpark per credit (~$3), so the §15 cost model holds (~£4–7/mo, monitor cap unchanged at 5 credits). Vercel account to be created at C1-S3. |
| D98 | Build process | **Factory-first for C2–C8** | Issue-driven agent pipeline (triage → implement → review) on GitHub Actions + `claude-code-action`; the human specs, clarifies, and merges. C1 and the factory itself (new epic F1) are built conventionally. Full spec, security model, label taxonomy, and autonomy ratchet: [`factory.md`](factory.md). Merging is never autonomous; the agent repo is explicitly out of factory scope. |
| D97 | Cloud stack revision (supersedes the Supabase half of D2) | **Snowflake + Vercel** | Snowflake becomes the single data platform: roast sync lands directly via `snowflake-connector-python` (key-pair auth), telemetry JSONL is parsed into a queryable table (the ingestion-pipeline win), aggregation runs as stored procedures, and owner analysis gets Streamlit-in-Snowflake. Vercel keeps only the taster-facing surface, because the public half **cannot** live inside Snowflake: Streamlit-in-Snowflake and SPCS public endpoints both require Snowflake authentication (verified against docs, 16 Jul 2026); anonymous phone access is unsupported. Functionality is unchanged from the 7 Jun plan. Cost model in §15; target is as close to free as Snowflake allows. |
| D10 | Auth | **Device token only** — *mechanism amended by D97* | Owner actions still flow device SPA → agent → cloud, and there is still **no login UI in M2**. The mechanism changes: instead of a bearer token against REST route handlers, the agent holds a key pair for a dedicated `ROASTPILOT_AGENT` Snowflake service user. The public web app holds a separate key pair for a minimal `PUBLIC_WEB` service user (SQL API). Magic-link owner login stays backlog. |
| D11 | Review spam control | **Slug entropy + rate limit** | High-entropy unlisted slug (≥96 bits, base58) is the access control. Per-IP rate limit + honeypot field on the review form. Revocation = regenerate slug. Signed per-share tokens → backlog. Unchanged by D97. |
| D12 | Summary builds | **On write** | Recompute the affected (bean_origin, roast_level) summary after every roast upload and review submit — now a single `RECOMPUTE_REFERENCE_SUMMARY` stored procedure called from both write paths (agent connector and public review route). No cron / no serverless tasks at this volume (a few roasts/week). |
| D13 | Agent reference fetch | **Fetch at roast start + cached fallback** | `prepare_roast` queries Snowflake directly (short timeout; a suspended warehouse's ~1–3 s auto-resume is within it), updates the local `reference_roasts` cache; any failure → use cache or proceed without. Cloud outage never affects a roast. **Loop semantics (M2)** unchanged: references are rating-filtered *process* aggregates of ≥4-star roasts (FC/drop temp, development %, total time), i.e. *reinforce the process of well-rated roasts*, **not** defect-driven correction. Tasting flavour axes and bitter/grassy signals are **not** propagated to the advisor in M2; defect-axis → adjustment is the `key_patterns` backlog path (§14). |

## 2. Scope

**In (M2 / Loop A)** — functionally identical to the 7 Jun plan: idempotent
roast sync, artifact + telemetry storage, public/unlisted roast pages with
link previews, no-account taster reviews, operator self-rating ingestion,
reference-summary aggregation + query path, visibility model
(private/unlisted/public), deletion/revocation. **New with D97 (cheap on this
stack):** telemetry rows queryable in SQL, and an operator-only
Streamlit-in-Snowflake analysis workspace (C8, optional epic; login is fine
there because the only user is the operator).

**Out (backlog, per D4 and the orchestration plan)**: audio storage,
`fc_training_samples`, annotation UI, model registry, community gallery,
multi-user accounts, automated `key_patterns` extraction, signed review
tokens, owner web login.

**Honesty note**: M2 is a single-operator system. The schema leaves room for
multi-user later (`owner_id` nullable), but no multi-user behavior is built or
claimed.

## 3. Architecture

Two planes:

- **Snowflake (data platform)**: all tables, an internal stage for raw
  artifacts (`roast.jsonl`, `roast.csv`, `summary.json`), a parsed
  `roast_telemetry` table (COPY INTO from the staged JSONL), stored procedures
  for summary recompute / review submit / deletion, and role-scoped access.
  The device agent connects **directly** with `snowflake-connector-python`
  and key-pair auth; there is no device-facing REST API any more.
- **Next.js App Router on Vercel (public surface only)**: server components
  render the public roast page (real SSR → working OG link previews); one
  route handler accepts review POSTs. It reaches Snowflake through the
  **SQL API** (stateless REST, per-request key-pair JWT — no connection
  pooling, which suits serverless), as the `PUBLIC_WEB` user. Pages are
  ISR-cached: a finished roast is near-static, so most taster page views
  never touch Snowflake, which both hides warehouse cold-resume latency and
  keeps compute near zero.

**Access control (replaces Supabase RLS as defence in depth)**: no grants to
`PUBLIC` anywhere. `ROASTPILOT_AGENT` role: DML on the roastpilot database +
stage read/write. `PUBLIC_WEB` role: SELECT on two **secure views**
(roast-by-slug and reviews-by-roast, with `visibility <> 'private'` baked into
the view definition) plus EXECUTE on `SUBMIT_REVIEW` — nothing else. A fully
compromised web app can read shareable roasts and insert reviews, and nothing
more.

**Placement constraint (verified 16 Jul 2026)**: Streamlit-in-Snowflake apps
and SPCS public endpoints both require Snowflake authentication (user login or
programmatic access token). Anonymous taster access therefore *must* be hosted
outside Snowflake; this is why Vercel survives D97.

```text
roastpilot-agent (device) ── key-pair connector ──▶ Snowflake (MERGE roasts, PUT stage,
                                                     COPY telemetry, CALL procs,
                                                     SELECT references)
Taster's phone ── unlisted slug ──▶ Vercel /r/[slug] (ISR)
                                     └─ SQL API (PUBLIC_WEB, key-pair JWT) ──▶ Snowflake
Operator analysis ── Snowflake login ──▶ Streamlit-in-Snowflake (C8, optional)
```

## 4. Data Model (Snowflake, managed with schemachange)

**Enforcement honesty (a real Snowflake difference)**: Snowflake enforces
**only NOT NULL**. Primary/unique/foreign keys are declared but not enforced,
and CHECK constraints are not supported at all. Consequences, designed in
rather than discovered later:

- Idempotency uniqueness is enforced by the `MERGE ... ON idempotency_key`
  write path, not by the schema.
- Range/enum validation (score 1–5, sliders 0–100, visibility values) lives in
  the write paths — Pydantic on the agent side, Zod in the Vercel route — and
  both must implement the same rules (contract-tested, §10).
- Cascade deletion is procedural (`DELETE_ROAST` proc removes reviews,
  telemetry, artifacts and stage files explicitly).
- A `data_quality_violations` view asserts the would-be constraints; the test
  suite and the C8 workspace read it (must always be empty).

```sql
create table cloud_roasts (
  id string default uuid_string() primary key,     -- declared, not enforced
  idempotency_key string not null,                  -- agent run id (roast_runs.id); unique via MERGE
  owner_id string,                                  -- null in M2 (single owner)
  public_slug string not null,                      -- ≥96-bit base58, agent-generated, regenerable
  visibility string not null default 'unlisted',    -- 'private'|'unlisted'|'public' (app-validated)
  bean_origin string,
  bean_varietal string,
  bean_weight_g float,
  profile_name string,
  roast_level string,
  summary variant not null,       -- MCP summary.json verbatim (session_id, phase,
                                  -- lifecycle timestamps, total_roast_seconds,
                                  -- development_time_seconds/percent, metrics{RoR,
                                  -- deltas}, first_crack_model{...}, roaster_driver)
  operator_rating int,            -- 1..5, app-validated
  operator_notes string,
  contributed_to_learning boolean not null default true,  -- FeedbackConfig.contribute_roast_curves
  roasted_at_utc timestamp_tz,
  created_at timestamp_tz not null default current_timestamp(),
  updated_at timestamp_tz not null default current_timestamp()
);

create table roast_telemetry (                      -- NEW with D97: parsed JSONL rows
  roast_id string not null,                         -- FK to cloud_roasts (declared)
  elapsed_s float not null,
  bean_temp_c float, env_temp_c float,
  heat_percent int, fan_percent int,
  ror_c_per_min float,
  raw variant                                       -- full source row, forward-compatible
);

create table roast_artifacts (
  id string default uuid_string() primary key,
  roast_id string not null,
  kind string not null,                             -- 'jsonl'|'csv'|'summary' (app-validated)
  stage_path string not null,                       -- @roast_artifacts/<roast_id>/<kind>
  byte_size int,
  created_at timestamp_tz not null default current_timestamp()
);

create table tasting_reviews (
  id string default uuid_string() primary key,
  roast_id string not null,
  reviewer_name string,                             -- optional, free text
  score int not null,                               -- 1..5, app-validated
  aroma smallint, acidity smallint, sweetness smallint,
  body smallint, aftertaste smallint,               -- 0..100 or NULL = "didn't say"
  brew_method string,                               -- 'espresso'|'v60'|'french_press'|'moka'|free
  notes string,
  submitted_ip_hash string,                         -- rate limiting only; purged ≥30 days
  created_at timestamp_tz not null default current_timestamp()
);

create table reference_roast_summaries (
  id string default uuid_string() primary key,
  bean_origin string not null,
  roast_level string not null,                      -- unique pair via MERGE
  roast_count int not null,
  review_count int not null,
  avg_rating float,
  first_crack_temp_avg_c float,  first_crack_temp_stddev_c float,
  drop_temp_avg_c float,         drop_temp_stddev_c float,
  development_percent_avg float,
  first_crack_time_avg_s float,
  total_time_avg_s float,
  key_patterns variant default parse_json('[]'),    -- backlog: stays empty in M2
  updated_at timestamp_tz not null default current_timestamp()
);

-- Stage for raw artifacts. SNOWFLAKE_SSE encryption so GET_PRESIGNED_URL can
-- serve owner-side downloads (client-side-encrypted PUT default breaks
-- presigned GETs — verify at C3).
create stage roast_artifacts encryption = (type = 'SNOWFLAKE_SSE');

-- Roles: ROASTPILOT_AGENT (DML + stage), PUBLIC_WEB (secure views +
-- EXECUTE SUBMIT_REVIEW only), no PUBLIC grants. Secure views embed
-- visibility <> 'private'.
```

Units note: all temperatures Celsius end-to-end (matches MCP contract).

## 5. Sync Contract (device plane, connector — replaces the REST device API)

The 7 Jun REST table becomes a connector contract implemented in the agent
repo (`cloud_sync` module); the semantics carry over unchanged.

| Operation | Implementation |
|---|---|
| Upload roast (was `POST /api/roasts`) | One connector session: `PUT` jsonl/csv/summary to `@roast_artifacts/<run_id>/`, `COPY INTO roast_telemetry`, `MERGE INTO cloud_roasts ON idempotency_key`, insert artifact rows, `CALL recompute_reference_summary(origin, level)`. Returns `{cloud_roast_id, public_slug}` — identical on replay. |
| Update (was `PATCH`) | `UPDATE cloud_roasts` for visibility / operator_rating / notes; `regenerate_slug` = new agent-generated slug (revocation, D11). |
| Delete (was `DELETE`) | `CALL delete_roast(id)`: procedural cascade (reviews, telemetry, artifact rows, `REMOVE @stage` files) + summary recompute. |
| List / reviews (was `GET`s) | `SELECT` for the device SPA's list and detail views, via the agent as before (device SPA never talks to Snowflake). |
| References (was `GET /api/references`) | `SELECT ... FROM reference_roast_summaries WHERE bean_origin=? AND roast_level=? AND avg_rating>=4 LIMIT 5` at `prepare_roast` (D13). |

Semantics agreed with the agent plan, unchanged:

- **Idempotency**: key = agent `roast_runs.id`. MERGE; replays return the same
  `{cloud_roast_id, public_slug}`. Agent marks `synced` only after a result
  containing `cloud_roast_id` (agent plan §5 `sync_jobs`).
- **Retry**: agent-side exponential backoff via `sync_jobs.attempts`; any
  connector error leaves the run `pending_sync`. Failed sync never changes the
  local run outcome (orchestration plan).
- **Payload size**: `PUT` to a stage has no route-handler body limit, so the
  old Vercel ~4.5 MB concern (7 Jun §5) and its signed-URL fallback are
  **resolved by architecture** — a 13-min roast at 1 Hz (~0.2–0.5 MB JSONL) is
  trivial.
- **Privacy mapping** (`FeedbackConfig`): `contribute_roast_curves=false` →
  metadata + summary only: no stage upload, no `roast_telemetry` rows, and
  `contributed_to_learning=false` (excluded from reference aggregation).
  `download_reference_roasts=false` → agent never queries references.
- **Batching (cost lever, §15)**: sync work coalesces into one connector
  session per roast; the agent must not open a session per statement (each
  warehouse auto-resume bills a 60 s minimum).

## 6. Public Surface (no auth — Vercel)

- **`GET /r/[slug]`** (server component, ISR-cached; revalidated on review
  submit and on agent-side visibility/slug changes):
  - `private` → 404 (indistinguishable from missing; the secure view already
    excludes it, the page just 404s on empty).
  - Headline: bean + roast level, roast date, outcome stats (total time, FC
    time/temp, drop time/temp, development %) from the `summary` variant.
  - Curve rendered from `roast_telemetry` rows via the secure view (no file
    download in the page path) — same five-series convention as the device
    SPA (bean, env, RoR + heat/fan step lines, legend).
  - Reviews list (reviewer first name or "Anonymous", score, notes).
  - Review form (per the captured `cloud-review` Figma Make prototype:
    stars, flavour sliders, brew chips, notes, optional name, <30 s on a phone).
  - OG meta tags + generated preview image (`@vercel/og`: bean name, date,
    rating, mini curve) so shared links unfurl properly in chat apps.
- **`POST /api/r/[slug]/reviews`**: Zod-validates score/slider ranges (the
  schema cannot, §4), honeypot field, per-IP rate limit (Upstash or Vercel KV
  — pick at C5; the old Postgres-counter option died with Supabase), then
  `CALL submit_review(...)` via SQL API: inserts the review (hashed IP only),
  recomputes the affected reference summary (D12), and opportunistically
  purges IP hashes older than 30 days.

### Review form semantics (unchanged)

- **Required**: star score only. Everything else optional.
- **Flavour sliders**: rendered untouched-by-default; an untouched slider
  submits **null** (not 50) — the nullable smallints exist precisely so
  "didn't say" is distinguishable from "rated it 50". The form tracks touched
  state per slider.
- **Duplicate reviews**: no accounts → cannot be deduped honestly. Position:
  accept duplicates, rely on the rate limit; the owner sees all reviews and
  can judge. No "one review per person" claim anywhere in UI copy.
- **Reviewer name**: free text, optional, displayed as given (or "Anonymous").

### Public page UX states (all part of C4/C5 scope, unchanged)

| State | Treatment |
|---|---|
| No reviews yet | Stats + curve render normally; reviews section shows a warm empty state ("Be the first to taste this roast") leading into the form |
| Post-submit | Inline confirmation replacing the form ("Thanks — your tasting was saved"); the new review appears in the list without reload |
| Validation error | Inline field errors; never lose entered text |
| Rate-limited (429) | Friendly copy ("Too many reviews from this connection — try again later"); form contents preserved |
| Private / unknown slug | Same minimal 404 page (indistinguishable), no branding leak beyond a plain "Not found" |

## 7. Reference Summary Aggregation (D12)

One `RECOMPUTE_REFERENCE_SUMMARY(bean_origin, roast_level)` stored procedure,
the single source of truth, called from both write planes (agent upload /
delete, public review submit). Body: a `MERGE INTO reference_roast_summaries`
computing count/avg/stddev over contributing roasts joined to reviews,
filtered on `contributed_to_learning`.

Two rules carried over from the 7 Jun fixture validation (open item 3, then):

- `summary.json` has **no** FC-temp field — FC temp derives from the
  `roast_telemetry` row nearest `first_crack_at_utc` (now a plain SQL join,
  one of the places D97 genuinely simplifies things).
- `summary.metrics` are **end-of-session snapshots** (e.g. negative RoR at
  `complete`) — roast-level values aggregate from telemetry rows, never from
  `summary.metrics`.

The references query returns the agent-plan `RoastReference` shape:
`{bean_origin, roast_level, first_crack_temp_c, drop_temp_c,
development_percent, tasting_score, key_adjustments: []}` — `key_adjustments`
empty in M2 (automated pattern extraction is backlog; never fabricate).

## 8. Privacy & Deletion

- Single-operator system: no third-party PII except optional reviewer names
  (free text, displayed as given) and IP hashes (rate limiting only; purge of
  rows older than 30 days runs opportunistically inside `SUBMIT_REVIEW` — no
  cron, no serverless task).
- `CALL delete_roast(id)` is the revocation path: procedural cascade
  (reviews, telemetry, artifact rows, stage `REMOVE`), then summary
  recompute. The device SPA exposes it as "Delete from cloud". Note Time
  Travel retention (default 1 day) keeps deleted rows recoverable briefly;
  document this in the runbook rather than pretending deletion is instant.
- Slug regeneration (D11) invalidates previously shared links immediately
  (plus an ISR revalidation of the old path).

## 9. Repository Layout

```text
roastpilot-cloud/
├── app/
│   ├── r/[slug]/page.tsx                 # public roast page (SSR + ISR)
│   ├── r/[slug]/opengraph-image.tsx      # OG preview image
│   └── api/
│       └── r/[slug]/reviews/route.ts     # POST (public) — the only API route left
├── components/                           # ReviewForm, StarRating, RoastCurve,
│                                         #   FlavorSliders (rebuild from Make
│                                         #   prototype reference, not seed code)
├── lib/                                  # sqlapi.ts (SQL API + key-pair JWT),
│                                         #   slug 404 helpers, ratelimit.ts, zod schemas
├── snowflake/
│   ├── migrations/                       # schemachange-versioned DDL, roles/grants,
│   │                                     #   secure views, stored procedures
│   └── fixtures/                         # contract fixtures (real MCP exports)
├── tests/                                # Vitest unit + contract tests
├── e2e/                                  # Playwright against preview deploys
└── streamlit/                            # C8 (optional): operator analysis app (SiS)
```

The device sync client (`cloud_sync`, connector sessions, `sync_jobs`) lives
in the **agent repo**, as before; it lands alongside C3/C6.

Conventions: TypeScript strict, Zod validation on every route input, Vitest
for unit/contract tests, Playwright for the review flow, schemachange for
Snowflake DDL.

## 10. Testing Plan

There is no local Snowflake emulator, so the substitute for `supabase start`
is a **dedicated `ROASTPILOT_DEV` database** in the same account (CI key-pair
secrets, resource-monitor capped, §15). Unit tests mock at the SQL API /
connector boundary; contract tests run real SQL against DEV (pennies).

| Suite | Coverage |
|---|---|
| Contract | idempotent MERGE (replay returns same id + slug), shared validation rules identical in Zod and Pydantic (both reject the same malformed payloads), SQL API JWT auth failure paths |
| Visibility | private absent from secure views → 404, unlisted reachable only by slug, slug regeneration kills old slug |
| Reviews | range validation (app layer — the schema cannot enforce it, §4), honeypot, rate limit, IP-hash purge |
| Summaries | recompute correctness on upload/review/delete; `contributed_to_learning=false` excluded; FC temp derived from telemetry not `summary.metrics` |
| Grants (was RLS) | `PUBLIC_WEB` cannot read private rows, base tables, IP hashes, or anything beyond the two views + one proc; `data_quality_violations` view is empty after every suite |
| E2E | share link → phone-viewport review submission → appears on page → summary updated |
| Cross-repo | agent `cloud_sync` integration test against `ROASTPILOT_DEV` + this repo's dev server |

## 11. Epics

Build process per D98: C1 and F1 are conventional; **C2–C8 are
factory-executed** (issue-driven agent pipeline, human merge — see
[`factory.md`](factory.md)). Story decomposition for C2+ is itself factory
work (`to-issues`, PM-reviewed), so those issues are created per-epic at
kickoff, not up front.

| Epic | Scope | Depends on | Build |
|---|---|---|---|
| C1 Scaffold | Snowflake account (30-day trial for the build, §15), schemachange, Next.js repo, CI (lint/typecheck/test), Vercel project, resource monitor from day one, repo `AGENTS.md` + state docs | — | conventional |
| F1 Factory | triage + implement workflows, triage/`to-issues` skills, review port, dry run + runbook (factory.md §11) | C1 | conventional |
| C2 Schema | migrations, roles/grants + secure views, stored procs, `data_quality_violations` view, summary-variant field mapping vs real MCP fixture | C1, F1 | factory |
| C3 Sync | agent-repo `cloud_sync` (connector sessions: stage PUT, COPY, MERGE, procs); presigned-URL download check (SNOWFLAKE_SSE) | C2 | factory (agent-repo side stays conventional) |
| C4 Public page | `/r/[slug]` SSR + ISR via SQL API, curve from telemetry view, OG image | C2 | factory |
| C5 Reviews | form (from Make prototype), rate limit (pick Upstash vs Vercel KV), `SUBMIT_REVIEW` proc wiring | C4 | factory |
| C6 References | aggregation proc + agent-side `prepare_roast` query (D13) | C3 | factory |
| C7 Ops | key-pair provisioning/rotation, resource monitors, trial→on-demand cutover, backup/export runbook, deploy runbook | C3–C6 | human + factory |
| C8 Analysis (optional) | Streamlit-in-Snowflake operator workspace: cross-roast queries, paired N vs N+1 comparisons (feeds open item 5) | C2 | factory |

Agent-side counterparts (sync queue wiring, `FeedbackConfig`,
`AdvisorContext.reference_roasts`) are already specced in the agent plan and
land as agent-repo stories alongside C3/C6.

## 12. Sub-Agents (`.claude/agents/` in the new repo)

- **schema-migration-reviewer** — reviews every schemachange migration: no
  grants to PUBLIC, `PUBLIC_WEB` surface stays exactly two secure views + one
  proc, secure views still embed the visibility filter, procedural cascades
  stay complete (rows + stage files), and nothing in the diff silently
  assumes an enforced PK/unique/FK/CHECK (§4 — Snowflake will not catch it).
- **privacy-auditor** — on PRs touching routes/components/procs: no PII
  beyond reviewer-name free text, IP only ever hashed and purged, private
  roasts return 404, `contributed_to_learning=false` paths excluded from
  aggregation and telemetry upload, deletion truly cascades (tables + stage).

## 13. UI Prototyping

- Review form: already prototyped and captured
  (`../roastpilot-agent/sketches/cloud-review/`, `cloud-review-mobile.png`).
  Form semantics specced in §6 (null sliders, optional fields, duplicates).
- Public roast page (the page *around* the form): prompt F added to
  `../roastpilot-agent/ui-prompts.md` — generate in Figma Make when starting
  C4, same export → reference-spec workflow (D9). UX states specced in §6.
- **Owner-side cloud UI lives in the device SPA** (D10) — specced in the
  agent plan §7 ("M2 additions to the SPA"): sync status, share/visibility/
  revoke/delete controls, cloud reviews in the detail view. Unchanged by D97
  (the SPA talks to the agent, which talks to Snowflake).
- C8 Streamlit workspace needs no prototype: operator-only, exploratory.

## 14. Remaining Open Items

1. ~~Vercel body limit vs real export sizes~~ **Resolved by D97**: sync is a
   stage `PUT`, no route-handler body limit in the path.
2. Rate-limit backend (Upstash vs Vercel KV) → pick at C5 (the Postgres
   counter option died with Supabase).
3. ~~`summary.json` field paths for FC temp~~ **Resolved 7 Jun 2026** against
   real fixtures (coffee-roaster-mcp branch `e7-s6-live-roast-validation`):
   no FC-temp field in `summary.json` → derive from telemetry at
   `first_crack_at_utc`; `summary.metrics` are end-of-session snapshots →
   aggregate from telemetry rows, never `summary.metrics`. Both rules now §7.
4. OG image design → with prompt F at C4.
5. **Feedback-loop evaluation — undefined.** No way yet to tell whether
   applying taster feedback made the *next* roast better vs merely
   *different*. Signal available: the timestamped roast log (bean/env temp,
   heat, fan) + the tasting reviews. Direction to pin at the cloud phase:
   define "better" as a fixed per-roast rubric (overall stars = headline
   metric); log each agent adjustment as a falsifiable hypothesis; evaluate
   **paired, per origin** (roast N vs N+1 on the targeted axis); keep judging
   **independent and ideally blind** (tasters, never the agent grading its own
   homework); small N ⇒ directional, not statistically powered. No automated
   metric in M2. (The C8 workspace is where this analysis would live.)
6. **Defect-driven adjustment (bitter→stricter / grassy→longer) — out of M2
   scope, decision pending.** The narrative loop ("if bitter, less heat + more
   fan; if grassy, drop later") needs (a) a structured **development axis**
   (grassy↔bitter) captured in `tasting_reviews`, (b) that axis aggregated into
   `reference_roast_summaries`, and (c) the references query surfacing it —
   none of which M2 builds (`key_patterns` stays empty, §4). M2 ships the
   rating-filtered *process* reference (D13: reinforce well-rated roasts);
   pull-forward = a new D-number, not a tweak. Revisit at the cloud phase.
7. ~~Region choice~~ **Resolved by D99 (17 Jul 2026)**: the account exists —
   **Azure UK South (London), Standard, on-demand** (account identifier
   `HVPXLEY-EX88650`, region `AZURE_UKSOUTH`), a deviation from the AWS
   eu-west-2 default. Cost model §15
   unchanged in substance.
8. **Presigned artifact downloads**: confirm `GET_PRESIGNED_URL` against the
   SNOWFLAKE_SSE stage at C3 (owner-side "download CSV" path).
9. **Key rotation**: both service users' key pairs rotated per the C7
   runbook; Snowflake supports two active public keys per user, so rotation
   is zero-downtime. Vercel env + agent config hold the private keys.
10. **All-data sync scope — not just roasts** (raised 16 Jul via the agent-side
    bean-sourcing feature, `roastpilot-agent#573`). M2 sync covers roasts +
    telemetry + reviews (§5). But the agent's **bean-profile library** (the D45
    runtime store), including the green **density/moisture** attributes the
    bean-similarity work (`roastpilot-agent#567` v2) needs, is NOT yet in sync
    scope — required for cross-device use and any cloud-side recommender or
    similarity. When that's scheduled: add a `cloud_bean_profiles` table +
    a bean-profile sync path (MERGE on profile id), and the agent-repo
    `cloud_sync` module gains the profile push alongside the roast push.
    Sequence **after** M2 Loop A; not in the initial scope.
11. **Snowflake-native capability opportunities for the recommender /
    bean-similarity** (evaluate post-M2, cost-checked). Now the data platform is
    Snowflake, several native capabilities fit the `roastpilot-agent#573`
    recommender + `#567` similarity directions and are worth evaluating rather
    than reimplementing agent-side:
    - **Cortex vector search** — `EMBED_TEXT_*` over bean flavour-note text +
      `VECTOR_COSINE_SIMILARITY` gives a *semantic* "tastes like your
      well-rated roasts" axis, complementing #567's structured
      density/moisture Gower distance.
    - **#567 Gower distance as a stored proc** over the whole cloud bean corpus
      (not just the local roster), so a scraped vendor catalogue can be ranked
      against the full owned corpus in SQL.
    - **Cortex LLM** (`COMPLETE` / `CLASSIFY_TEXT` / `EXTRACT_ANSWER`) — run
      catalogue extraction + recommendation reasoning data-resident in
      Snowflake instead of the agent's external LLM key.
    - **Streamlit-in-Snowflake (C8)** — the natural operator-only home for
      recommender/similarity tuning + exploration.
    Honesty: all post-M2, all **expand beyond Loop A's deliberately-minimal
    scope**, and Cortex functions carry per-token credit cost beyond the
    ~£5/mo model — so each needs its own cost/scope decision (a D-number)
    before adoption. Recorded as opportunities, not commitments.

## 15. Cost Model (D97 — "as free as possible", stated honestly)

**The honest headline: Snowflake has no perpetual free tier.** The 30-day
trial (~$400 credits) covers the entire C1–C7 build phase for free; after
that, steady state is a few pounds a month, dominated entirely by warehouse
compute minimums. Everything else in the stack is genuinely £0.

| Component | Plan | Est. monthly cost |
|---|---|---|
| Vercel | Hobby (non-commercial hobby project — compliant) | **£0** — SSR/ISR, OG image generation, and the review route are far inside Hobby limits at friends-and-family traffic |
| Upstash (rate limit) | Free tier | **£0** at a handful of reviews/week |
| Snowflake storage | On-demand | **~£0** — well under 1 GB (roasts are ~0.5 MB each); at ~$23–40/TB/month this rounds to pennies |
| Snowflake cloud services | — | **£0** — free below 10% of daily compute |
| Snowflake compute | 1 × X-SMALL warehouse (1 credit/hr), `AUTO_SUSPEND = 60`, Standard on-demand (~$2.00/credit US East, ~$2.70 eu-west-2) | **~£3–6** — see the usage model |

**Usage model** (~3 roasts/week; every auto-resume bills a 60 s minimum, which
is the dominant term, not query runtime):

- Sync, one coalesced session per roast (~3 min) + reference fetch at roast
  start (~1 min): ~12 min/week.
- Reviews (~5/roast, each a resume unless clustered): ~15 min/week.
- Public page views: **~0** — ISR serves from Vercel's cache; only
  revalidations touch Snowflake.
- Owner analysis (C8): ~30 min/month.
- Total ≈ 2–2.5 warehouse-hours ≈ 2–2.5 credits ≈ **£4–6/month** in
  eu-west-2 (~£3–4 in US East).

**Cost controls, built in from C1 (not bolted on):**

1. **Resource monitor from day one**: cap at 5 credits/month, notify at 50%,
   suspend at 100%. Worst case is therefore ~£10/month by construction, and a
   runaway query or a misconfigured client cannot exceed it.
2. One shared X-SMALL warehouse for everything (agent, web, CI, Streamlit);
   `AUTO_SUSPEND = 60`, auto-resume on.
3. ISR so taster traffic costs no compute; agent batches each roast's sync
   into a single session (§5).
4. Build phase entirely on the trial; the C7 cutover story converts to
   on-demand with the monitor already in place.
5. CI contract tests share the same warehouse and monitor; if CI frequency
   ever grows, give CI its own monitor before raising the cap.

For comparison: the superseded Supabase + Vercel stack was £0/month at this
volume. The ~£5/month is the price of the Snowflake capabilities (SQL over
telemetry, stored-proc aggregation, Streamlit analysis) — accepted in D97.
