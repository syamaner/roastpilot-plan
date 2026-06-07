# roastpilot-cloud — Component Plan (M2, Loop A)

**Status**: Drilled down and agreed, 7 June 2026
**Repo to create**: `github.com/syamaner/roastpilot-cloud`
**Stack** (per D2): Next.js (App Router) on Vercel + Supabase (Postgres, Storage)
**Timing**: built only after the M1 demo path is secured — M2 must never
compete with the July harness deadline (00-repository-structure.md).

---

## 1. Decisions (this drill-down)

| # | Decision | Choice | Notes |
|---|----------|--------|-------|
| D10 | Auth | **Device token only** | The agent holds a long-lived bearer token (Vercel env secret, constant-time compare). Owner actions (visibility, view reviews, rating) flow device SPA → agent → cloud. **No login UI in M2.** Magic-link owner login is backlog if away-from-home management is ever needed. |
| D11 | Review spam control | **Slug entropy + rate limit** | High-entropy unlisted slug (≥96 bits, base58) is the access control. Per-IP rate limit + honeypot field on the review form. Revocation = regenerate slug. Signed per-share tokens → backlog. |
| D12 | Summary builds | **On write** | Recompute the affected (bean_origin, roast_level) summary inside the route handler after every roast upload and review submit — a single SQL upsert. No cron at this volume (a few roasts/week). |
| D13 | Agent reference fetch | **Fetch at roast start + cached fallback** | `prepare_roast` queries `/api/references` with a short timeout, updates the local `reference_roasts` cache; any failure → use cache or proceed without. No background jobs; cloud outage never affects a roast. |

## 2. Scope

**In (M2 / Loop A)**: idempotent roast sync, artifact storage, public/unlisted
roast pages with link previews, no-account taster reviews, operator
self-rating ingestion, reference-summary aggregation + query API, visibility
model (private/unlisted/public), deletion/revocation.

**Out (backlog, per D4 and the orchestration plan)**: audio storage,
`fc_training_samples`, annotation UI, model registry, community gallery,
multi-user accounts, automated `key_patterns` extraction, signed review
tokens, owner web login.

**Honesty note**: M2 is a single-operator system. The schema leaves room for
multi-user later (`owner_id` nullable), but no multi-user behavior is built or
claimed.

## 3. Architecture

- **Next.js App Router on Vercel**: server components render public pages
  (real SSR → working OG link previews when a roast is shared); route handlers
  implement the API. One repo, one deploy.
- **Supabase**: Postgres for data, Storage for artifacts (`roast.jsonl`,
  `roast.csv`, `summary.json`). All DB/storage access happens server-side with
  the service-role key. **RLS enabled on every table with no anon policies**
  — defense in depth; nothing is reachable except through route handlers.
- **Auth model (D10)**: one device bearer token for all `/api/*` device
  endpoints; public endpoints are only the roast page and the review POST.

```text
roastpilot-agent (device) ── Bearer token ──▶ /api/roasts, /api/references
Taster's phone ── unlisted slug ──▶ /r/[slug]  +  POST /api/r/[slug]/reviews
```

## 4. Data Model (Supabase migrations)

```sql
create table cloud_roasts (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,          -- agent run id (roast_runs.id)
  owner_id uuid,                                  -- null in M2 (single owner)
  public_slug text not null unique,               -- ≥96-bit base58, regenerable
  visibility text not null default 'unlisted'
    check (visibility in ('private','unlisted','public')),
  bean_origin text,
  bean_varietal text,
  bean_weight_g real,
  profile_name text,
  roast_level text,
  summary jsonb not null,        -- MCP summary.json verbatim (session_id, phase,
                                 -- lifecycle timestamps, total_roast_seconds,
                                 -- development_time_seconds/percent, metrics{RoR,
                                 -- deltas}, first_crack_model{...}, roaster_driver)
  operator_rating int check (operator_rating between 1 and 5),
  operator_notes text,
  contributed_to_learning boolean not null default true,  -- FeedbackConfig.contribute_roast_curves
  roasted_at_utc timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roast_artifacts (
  id uuid primary key default gen_random_uuid(),
  roast_id uuid not null references cloud_roasts(id) on delete cascade,
  kind text not null check (kind in ('jsonl','csv','summary')),
  storage_path text not null,
  byte_size int,
  created_at timestamptz not null default now(),
  unique (roast_id, kind)
);

create table tasting_reviews (
  id uuid primary key default gen_random_uuid(),
  roast_id uuid not null references cloud_roasts(id) on delete cascade,
  reviewer_name text,                              -- optional, free text
  score int not null check (score between 1 and 5),
  aroma smallint check (aroma between 0 and 100),
  acidity smallint check (acidity between 0 and 100),
  sweetness smallint check (sweetness between 0 and 100),
  body smallint check (body between 0 and 100),
  aftertaste smallint check (aftertaste between 0 and 100),
  brew_method text,                                -- 'espresso'|'v60'|'french_press'|'moka'|free
  notes text,
  submitted_ip_hash text,                          -- rate limiting only; purged ≥30 days
  created_at timestamptz not null default now()
);

create table reference_roast_summaries (
  id uuid primary key default gen_random_uuid(),
  bean_origin text not null,
  roast_level text not null,
  roast_count int not null,
  review_count int not null,
  avg_rating real,
  first_crack_temp_avg_c real,  first_crack_temp_stddev_c real,
  drop_temp_avg_c real,         drop_temp_stddev_c real,
  development_percent_avg real,
  first_crack_time_avg_s real,
  total_time_avg_s real,
  key_patterns jsonb not null default '[]',        -- backlog: stays empty in M2
  updated_at timestamptz not null default now(),
  unique (bean_origin, roast_level)
);

-- RLS: enabled on all tables, zero policies for anon/authenticated roles.
-- All access via service-role from route handlers.
```

Units note: all temperatures Celsius end-to-end (matches MCP contract).

## 5. Sync API Contract (device endpoints, bearer token)

| Method & path | Purpose |
|---|---|
| `POST /api/roasts` | Idempotent upsert. Multipart: `metadata` (JSON: idempotency_key, bean info, profile_name, roast_level, visibility, operator_rating?, operator_notes?, contributed_to_learning, summary) + files `jsonl`, `csv`. Response `{cloud_roast_id, public_slug}` — identical on replay. |
| `PATCH /api/roasts/{id}` | visibility, operator_rating/notes, `regenerate_slug: true` (revocation, D11) |
| `DELETE /api/roasts/{id}` | full deletion: cascades reviews + artifacts, recomputes affected summary |
| `GET /api/roasts` | owner's list (id, slug, bean, date, visibility, review stats) |
| `GET /api/roasts/{id}/reviews` | reviews for the device SPA's detail view |
| `GET /api/references?bean_origin=&roast_level=&min_rating=4&limit=5` | `RoastReference[]` for the advisor (D13) |

Semantics agreed with the agent plan:

- **Idempotency**: key = agent `roast_runs.id`. Upsert; replays return the
  same `{cloud_roast_id, public_slug}` with 200. Agent marks `synced` only
  after a response containing `cloud_roast_id` (agent plan §5 `sync_jobs`).
- **Retry**: agent-side exponential backoff via `sync_jobs.attempts`; any 5xx
  or network error leaves the run `pending_sync`. Failed sync never changes
  the local run outcome (orchestration plan).
- **Payload size**: a 13-min roast at 1 Hz is ~0.2–0.5 MB of JSONL — fine for
  a single multipart POST. Verify Vercel's route-handler body limit
  (historically ~4.5 MB) at C3; if real exports exceed it, switch to
  signed-URL uploads to Supabase Storage (response includes upload URLs,
  agent PUTs directly). Decision deferred until measured.
- **Privacy mapping** (`FeedbackConfig`): `contribute_roast_curves=false` →
  metadata + summary only, no telemetry artifacts uploaded, and
  `contributed_to_learning=false` (excluded from reference aggregation).
  `download_reference_roasts=false` → agent never calls `/api/references`.

## 6. Public Surface (no auth)

- **`GET /r/[slug]`** (server component):
  - `private` → 404 (indistinguishable from missing).
  - Headline: bean + roast level, roast date, outcome stats (total time, FC
    time/temp, drop time/temp, development %) from `summary` jsonb.
  - Curve rendered from the CSV/JSONL artifact — same five-series convention
    as the device SPA (bean, env, RoR + heat/fan step lines, legend).
  - Reviews list (reviewer first name or "Anonymous", score, notes).
  - Review form (per the captured `cloud-review` Figma Make prototype:
    stars, flavor sliders, brew chips, notes, optional name, <30 s on a phone).
  - OG meta tags + generated preview image (`@vercel/og`: bean name, date,
    rating, mini curve) so shared links unfurl properly in chat apps.
- **`POST /api/r/[slug]/reviews`**: validates score/slider ranges, honeypot
  field, per-IP rate limit (e.g. 5 reviews/hour/IP via Upstash or Postgres
  counter — pick at C5), stores hashed IP only, then recomputes the affected
  reference summary (D12).

### Review form semantics

- **Required**: star score only. Everything else optional.
- **Flavor sliders**: rendered untouched-by-default; an untouched slider
  submits **null** (not 50) — the schema's nullable smallints exist precisely
  so "didn't say" is distinguishable from "rated it 50". The form tracks
  touched state per slider.
- **Duplicate reviews**: no accounts → cannot be deduped honestly. Position:
  accept duplicates, rely on the rate limit; the owner sees all reviews and
  can judge. No "one review per person" claim anywhere in UI copy.
- **Reviewer name**: free text, optional, displayed as given (or "Anonymous").

### Public page UX states (all part of C4/C5 scope)

| State | Treatment |
|---|---|
| No reviews yet | Stats + curve render normally; reviews section shows a warm empty state ("Be the first to taste this roast") leading into the form |
| Post-submit | Inline confirmation replacing the form ("Thanks — your tasting was saved"); the new review appears in the list without reload |
| Validation error | Inline field errors; never lose entered text |
| Rate-limited (429) | Friendly copy ("Too many reviews from this connection — try again later"); form contents preserved |
| Private / unknown slug | Same minimal 404 page (indistinguishable), no branding leak beyond a plain "Not found" |

## 7. Reference Summary Aggregation (D12)

One SQL upsert, run after roast upload, review submit, review/roast deletion:

```sql
insert into reference_roast_summaries (bean_origin, roast_level, ...)
select r.bean_origin, r.roast_level,
       count(distinct r.id), count(v.id), avg(v.score),
       avg((r.summary->>'first_crack_temp_c')::real), stddev(...),
       avg(drop temp), stddev(...), avg(dev %), avg(fc time), avg(total time)
from cloud_roasts r
left join tasting_reviews v on v.roast_id = r.id
where r.bean_origin = $1 and r.roast_level = $2
  and r.contributed_to_learning
group by r.bean_origin, r.roast_level
on conflict (bean_origin, roast_level) do update set ...;
```

(Exact summary-jsonb field paths fixed at C2 against a real MCP
`summary.json` fixture — FC temp at FC time needs deriving from the CSV row
at `first_crack_at_utc` if not present in summary; verify against fixture.)

`GET /api/references` returns the agent-plan `RoastReference` shape:
`{bean_origin, roast_level, first_crack_temp_c, drop_temp_c,
development_percent, tasting_score, key_adjustments: []}` — `key_adjustments`
empty in M2 (automated pattern extraction is backlog; never fabricate).

## 8. Privacy & Deletion

- Single-operator system: no third-party PII except optional reviewer names
  (free text, displayed as given) and IP hashes (rate limiting only, purge
  job ≥30 days — a `delete where created_at < now() - interval '30 days'`
  run opportunistically on review writes; no cron needed).
- `DELETE /api/roasts/{id}` is the revocation path: cascades reviews and
  artifacts (FK + storage object delete), recomputes summaries. The device
  SPA exposes it as "Delete from cloud".
- Slug regeneration (D11) invalidates previously shared links immediately.

## 9. Repository Layout

```text
roastpilot-cloud/
├── app/
│   ├── r/[slug]/page.tsx                 # public roast page (SSR)
│   ├── r/[slug]/opengraph-image.tsx      # OG preview image
│   └── api/
│       ├── roasts/route.ts               # POST (multipart upsert), GET (list)
│       ├── roasts/[id]/route.ts          # PATCH / DELETE
│       ├── roasts/[id]/reviews/route.ts  # GET (device)
│       ├── references/route.ts           # GET (device)
│       └── r/[slug]/reviews/route.ts     # POST (public)
├── components/                           # ReviewForm, StarRating, RoastCurve,
│                                         #   FlavorSliders (rebuild from Make
│                                         #   prototype reference, not seed code)
├── lib/                                  # db.ts, auth.ts (token), slug.ts,
│                                         #   ratelimit.ts, summaries.ts
├── supabase/migrations/
├── tests/
└── e2e/                                  # Playwright against preview deploys
```

Conventions: TypeScript strict, Zod validation on every route input, Vitest
for unit/contract tests, Playwright for the review flow.

## 10. Testing Plan

| Suite | Coverage |
|---|---|
| Contract | idempotent upsert (replay returns same ids), token auth (401 paths, constant-time), multipart parsing, Zod rejection of malformed payloads |
| Visibility | private→404, unlisted reachable only by slug, slug regeneration kills old slug |
| Reviews | range validation, honeypot, rate limit, IP-hash purge |
| Summaries | recompute correctness on upload/review/delete; `contributed_to_learning=false` excluded |
| RLS | anon/authenticated roles can read nothing directly (defense-in-depth check) |
| E2E | share link → phone-viewport review submission → appears on page → summary updated |
| Cross-repo | agent `cloud_sync` integration test against a local `supabase start` instance + this repo's dev server |

## 11. Epics

| Epic | Scope | Depends on |
|---|---|---|
| C1 Scaffold | Next.js + Supabase local dev, CI (lint/typecheck/test), Vercel project | — |
| C2 Schema | migrations, RLS lockdown, summary-jsonb field mapping vs real MCP fixture | C1 |
| C3 Sync API | upsert + artifacts + PATCH/DELETE + token auth; measure body limits | C2 |
| C4 Public page | `/r/[slug]` SSR, curve from artifact, OG image | C2 |
| C5 Reviews | form (from Make prototype), rate limit, recompute-on-write | C4 |
| C6 References | aggregation upsert + `/api/references`; agent-side `prepare_roast` integration (D13) | C3 |
| C7 Ops | env/secrets, Supabase backups, deploy runbook | C3–C6 |

Agent-side counterparts (sync queue wiring, `FeedbackConfig`,
`AdvisorContext.reference_roasts`) are already specced in the agent plan and
land as agent-repo stories alongside C3/C6.

## 12. Sub-Agents (`.claude/agents/` in the new repo)

- **schema-migration-reviewer** — reviews every migration: RLS still enabled
  with no anon policies, FKs cascade correctly, check constraints match the
  agent-plan models, no destructive change without a backfill note.
- **privacy-auditor** — on PRs touching routes/components: no PII beyond
  reviewer-name free text, IP only ever hashed, private roasts return 404,
  `contributed_to_learning=false` paths excluded from aggregation, deletion
  truly cascades (DB + storage), no telemetry uploaded when curves opt-out.

## 13. UI Prototyping

- Review form: already prototyped and captured
  (`../roastpilot-agent/sketches/cloud-review/`, `cloud-review-mobile.png`).
  Form semantics specced in §6 (null sliders, optional fields, duplicates).
- Public roast page (the page *around* the form): prompt F added to
  `../roastpilot-agent/ui-prompts.md` — generate in Figma Make when starting
  C4, same export → reference-spec workflow (D9). UX states specced in §6.
- **Owner-side cloud UI lives in the device SPA** (D10) — specced in the
  agent plan §7 ("M2 additions to the SPA"): sync status, share/visibility/
  revoke/delete controls, cloud reviews in the detail view. No prototype
  needed beyond the existing detail-page direction; these are additive
  controls, prototyped in code against the M1 detail page when M2 starts.

## 14. Remaining Open Items

1. Vercel body limit vs real export sizes → measure at C3 (signed-URL
   fallback designed, §5).
2. Rate-limit backend (Upstash vs Postgres counter) → pick at C5.
3. ~~`summary.json` field paths for FC temp~~ **Resolved 7 Jun 2026**
   against real fixtures (coffee-roaster-mcp branch
   `e7-s6-live-roast-validation`, two live-roast exports): `summary.json`
   has **no** FC-temp field — derive it from the CSV/JSONL telemetry row at
   `first_crack_at_utc`, as §7 anticipated. Also confirmed:
   `summary.metrics` are **end-of-session snapshots** (e.g. negative RoR at
   `complete`), so reference-summary aggregation must compute roast-level
   values from telemetry rows, never from `summary.metrics`.
4. OG image design → with prompt F at C4.
