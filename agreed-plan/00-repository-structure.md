# RoastPilot v2: Agreed Repository Structure

**Status**: Agreed 6 June 2026
**Supersedes**: `REPOSITORY_STRUCTURE.md`, `REPO_STRUCTURE_SUMMARY.md` (draft proposals)
**Companion**: `roastpilot-agent-orchestration-plan.md` remains the authoritative
architecture/controller plan; this document settles only repository boundaries,
naming, and stack decisions.

---

## Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| D1 | Device SPA location | **Inside `roastpilot-agent` repo** (`web/` subfolder, Vite build output shipped inside the Python wheel) | M1 bundles the SPA with the agent — same deployment unit, so by the project's own principle (repo boundary = deployment boundary) it belongs in the same repo. One PR per feature, no cross-repo API type sync during the July build. Extract later only if remote hosting materializes. |
| D2 | Cloud stack | **Next.js on Vercel + Supabase** (Postgres, storage, auth) — one full-stack TypeScript repo | The cloud plane is not headless: it owns public roast pages and the no-account taster review flow (unlisted links opened on phones). Server-rendered pages give working link previews. Route handlers serve the sync API. Fastest to MVP. |
| D3 | Naming & GitHub home | **`github.com/syamaner/roastpilot-agent`** and **`github.com/syamaner/roastpilot-cloud`** | All CFP supporting links already point at `syamaner/*`; consistent story for the September talk. A `roastpilot` org can come later with GitHub redirects. The working folder `coffee-roaster-agent-v2` is planning-only and is not the published repo name. |
| D4 | Feedback-learning plan depth | **M1 + M2 (Loop A) detailed; Loop B as backlog appendix only** | Matches the corrections docs and the CFP accuracy boundaries: audio capture, annotation, fine-tuning, and auto model updates are future backlog, not current scope. |

## Final Repository Map

**4 active repositories** (was 5 in the draft plans):

| Repository | Status | Deployment | Language | Scope |
|------------|--------|-----------|----------|-------|
| `coffee-roaster-mcp` | ✅ Exists (PyPI + MCP Registry) | Device-local | Python | Hardware/session boundary. One small Loop A contract change (FC override source marker). No other changes in M1/M2. |
| `roastpilot-agent` | 🟡 New — M1, critical path | Device-local | Python + TS (`web/`) | Deterministic controller, safety policy, PydanticAI advisor, SQLite, FastAPI + SSE, cloud-sync client, **and** the bundled device SPA. |
| `roastpilot-cloud` | 🟡 New — M2 | Vercel + Supabase | TypeScript (Next.js) | Public roast pages, taster review UI (unlisted links, no account), sync API, reference-roast summaries. **Annotation service removed from M2 scope** (Loop B backlog). |
| `coffee-first-crack-detection` | ✅ Exists (HF dataset/model/Space) | Batch / HF Hub | Python | No M1/M2 work. Loop B fine-tuning is backlog. |

**Reference-only (no changes, never deleted):** `bean-agent` (legacy prototype),
`roaster-local` (legacy n8n-era workspace).

## Discrepancies Resolved (vs. draft plans)

1. **Tasting review UI placement.** Draft `REPOSITORY_STRUCTURE.md` put
   `TastingReview.tsx` in the device SPA while the orchestration plan put
   `ReviewUI` in the cloud plane. **Resolved**: the device SPA carries the
   *operator self-rating* only; the public roast page and taster review form
   are `roastpilot-cloud` (Next.js). Friends rating via unlisted links from
   anywhere can only be cloud-hosted.
2. **Multi-repo rationale corrected.** "Different teams" is removed — this is a
   single developer working with coding agents. The honest rationale:
   deployment boundaries, independent versioning, and small scoped contexts
   for coding agents within a spec-driven workflow.
3. **Separate `roastpilot-web` repo dropped** (D1). The draft's own principle
   argued against it for M1.
4. **Annotation service stripped from M2 cloud scope.** The draft repo doc
   still listed it; the orchestration plan had already moved all Loop B work
   to backlog. The agreed cloud scope contains no audio storage, no
   `fc_training_samples`, no annotation UI.
5. **Version matrix simplified.** Loop-B-driven MCP v1.1/v2.0 entries are
   backlog. Current matrix: Agent v2.0.x ↔ MCP v1.0.x, plus the small
   source-marker contract change (below) released as a patch/minor MCP bump.

## Verified Ground Truth (checked 6 June 2026)

- MCP tool surface matches the orchestration plan exactly:
  `get_server_info`, `get_runtime_config`, `start_roast_session`,
  `get_roast_state`, `set_heat`, `set_fan`, `mark_beans_added`,
  `mark_first_crack`, `drop_beans`, `start_cooling`, `stop_cooling`,
  `export_roast_log`, `emergency_stop`
  (`coffee-roaster-mcp/src/coffee_roaster_mcp/mcp_server.py:494-755`).
- `MockRoasterDriver` exists (`drivers.py:524`) — the M1 mock-safe vertical
  slice needs no hardware, microphone, or model download.
- `mark_first_crack` (`mcp_server.py:665`) records its event with no payload;
  the Loop A source-marker change is a real (small) contract + test change in
  `coffee-roaster-mcp`, as documented in `FINAL_CORRECTIONS_SUMMARY.md`.
- This repo (`coffee-roaster-agent-v2`) contains plans only — no code yet.

## Timeline Anchors

- **8 June 2026**: AGNTCon/MCPCon CFP deadline (submission v4 ready).
- **July 2026**: agent harness completion expected (per submission notes);
  `roastpilot-agent` repo must be populated with real code + README before it
  is referenced publicly (slides / edited submission).
- **17–18 September 2026**: talk. Recorded demo needs: FC detector probability
  trace, advisory decision trace with ≥1 CLAMP and ≥1 REJECT, MCP interaction
  trace, full roast workflow screen recording.
- **M2 (cloud / Loop A)**: build after the M1 demo path is secured; target
  usable before the talk only if M1 lands early. Loop A is not in the talk's
  demo plan, so it must never compete with M1 for time.

## Milestone → Repo Mapping

**M1 (critical path, July)** — `roastpilot-agent` only:
1. Mock-safe vertical slice (12 steps in orchestration plan § First Milestone).
2. Device SPA MVP in `web/`: live dashboard (curve, RoR, events, advisory
   panel with verdicts), operator actions, recovery state rendering.
3. Real PydanticAI provider config; supervised Hottop validation.

**M2 (Loop A)** — `roastpilot-cloud` + small changes elsewhere:
1. `coffee-roaster-mcp`: FC override source-marker contract change.
2. `roastpilot-cloud`: sync API (idempotent upsert), public/unlisted roast
   pages, taster reviews, reference-summary builder + query API.
3. `roastpilot-agent`: sync queue, `FeedbackConfig` privacy controls,
   reference download/cache, `AdvisorContext.reference_roasts`.

**Backlog (appendix, not planned in detail)** — Loop B: MCP audio ring buffer,
annotation pipeline, fine-tuning workflow, auto model updates.

## UI Prototyping Approach

Two UIs, two different strategies:

### Device SPA (`roastpilot-agent/web/`) — code-first with real data replay
The hard part is the live roast dashboard, and you already own real roast logs
(JSONL/CSV exports from MCP). Prototype directly in code:

- **Replay harness**: a tiny mock SSE endpoint that replays a recorded roast
  log at adjustable speed (1×–60×). The prototype is grounded in real
  telemetry from day one and the harness doubles as the dev/test fixture and
  the talk's screen-recording rig.
- **Charting**: `uPlot` (recommended — tiny, built for streaming time series)
  or Apache ECharts. Avoid Recharts for the live curve (weak at streaming).
- **Layout generation**: [v0.dev](https://v0.app) for React + Tailwind +
  shadcn/ui shells (settings, history, roast detail pages).
- **Domain UX reference**: Artisan (open-source roasting software) — operators
  expect its curve + RoR + event-marker conventions.
- **Wireframes**: Excalidraw for 10-minute sketches before generating anything.
- **Iteration loop**: Playwright MCP (or Claude-in-the-loop screenshots)
  against the replay harness.

### Cloud pages (`roastpilot-cloud`) — v0 + Vercel previews
- **v0.dev** is the natural fit (shadcn-native, output drops straight into
  Next.js).
- **Vercel preview deployments** give shareable URLs — real friends can poke
  the tasting review form on their phones before anything is wired to a
  database. Mobile-first is mandatory here: tasters open unlisted links on
  phones.

## Specialised Sub-Agents per Repository

Recommendations to refine during per-repo drill-downs; defined as
`.claude/agents/` (or Warp rules) in each repo.

### `roastpilot-agent`
- **safety-reviewer** — adversarial review on any PR touching `safety.py`,
  `controller.py`, or state transitions: every transition test-covered, no
  path lets advisor output reach MCP unvalidated, verdicts stay typed, no
  auto-resume after restart.
- **mcp-contract-checker** — validates the typed MCP client against the
  installed `coffee-roaster-mcp` version's actual tool schemas; flags drift.
- **sim-roast-runner** — runs the mock-driver full-roast scenario and
  summarizes decision traces (also produces the CLAMP/REJECT traces the talk
  demo needs).
- **ui-reviewer** — Playwright-driven screenshot review of `web/` against the
  replay harness.

### `roastpilot-cloud`
- **schema-migration-reviewer** — Postgres migrations + Supabase RLS policies.
- **privacy-auditor** — opt-in paths honored, no PII on public pages,
  unlisted-slug entropy, rate limiting on review endpoints, anonymization on
  upload.

### `coffee-roaster-mcp` / `coffee-first-crack-detection`
- No new agents for M1/M2 — changes are too small; existing repo conventions
  plus standard code review suffice. Revisit for Loop B.

### Cross-cutting
- **claims-accuracy-checker** — reviews READMEs, posts, and slides against the
  CFP accuracy boundaries (no determinism percentages in public text, "advisory
  -only" wording, no "fully autonomous", no "production-ready" before
  end-to-end hardware validation, fixed-window ~2 s latency honesty).

## Drill-Down Plan Structure

```text
agreed-plan/
├── 00-repository-structure.md     # this document
├── roastpilot-agent/              # next: full component plan (M1 critical path)
├── roastpilot-cloud/              # then: Loop A data plane plan
├── coffee-roaster-mcp/            # small plan: source-marker contract change
└── coffee-first-crack-detection/  # no-change note + Loop B backlog appendix
```

Drill-down order: `roastpilot-agent` first (July deadline), then
`coffee-roaster-mcp` contract change (small, unblocks Loop A schema design),
then `roastpilot-cloud`, then the backlog appendix.
