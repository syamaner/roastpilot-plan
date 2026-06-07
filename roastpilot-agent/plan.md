# roastpilot-agent — Component Plan (M1)

**Status**: Drilled down and agreed, 6 June 2026
**Repo to create**: `github.com/syamaner/roastpilot-agent`
**Deadline anchor**: harness complete July 2026; demo assets recorded before 17–18 Sept talk
**Authoritative architecture source**: `roastpilot-agent-orchestration-plan.md` (this document refines, never contradicts)

---

## 1. Decisions (this drill-down)

| # | Decision | Choice | Notes |
|---|----------|--------|-------|
| D5 | Advisor provider | **OpenRouter** via PydanticAI (OpenAI-compatible endpoint) | One API surface, swappable model slugs — enables advisor-model comparison material for the talk. Model slug is config (`ADVISOR_MODEL`); default to a strong structured-output model (Anthropic Claude Sonnet slug on OpenRouter; confirm exact slug at implementation). Tests always use a deterministic `FakeAdvisor`. |
| D6 | MCP wiring | **Agent spawns `coffee-roaster-mcp` as stdio child process** | One systemd unit; agent restart ⇒ clean MCP restart into the recovery flow. Matches the published stdio transport (`config.py` hard-codes `TransportType = Literal["stdio"]`). |
| D7 | Profiles | **Minimal static profile** | name, bean (origin/varietal/weight), charge guidance range (default 170–200 °C), initial heat/fan, target drop temp, target development %. No curve targets in M1. |
| D8 | SPA scope (M1) | **Dashboard + roast detail + history** | Settings via config file; rating UI + cloud screens are M2. |

## 2. Verified MCP Contract (ground truth, coffee-roaster-mcp v0.1.3)

Extracted from source 6 June 2026. The typed client (`mcp_client.py`) wraps exactly this surface.

**13 tools** (`mcp_server.py:493-779`): `get_server_info`, `get_runtime_config`,
`start_roast_session`, `get_roast_state(session_id?)`, `set_heat(heat_level_percent)`,
`set_fan(fan_level_percent)`, `mark_beans_added`, `mark_first_crack`, `drop_beans`,
`start_cooling`, `stop_cooling`, `export_roast_log(session_id?)`,
`emergency_stop(reason?)`.

**Key facts the agent design relies on:**

- `get_roast_state` returns `RoastSessionState` (`mcp_server.py:328-363`) with:
  MCP phase, heat/fan %, cooling flag, all lifecycle timestamps (UTC + monotonic
  pairs), **derived metrics already computed** (`bean_ror_c_per_min`,
  `env_ror_c_per_min`, `bean_temp_delta_60s_c`, `development_time_seconds`,
  `development_percent`), nested `device_state` (live `bean_temp_c`,
  `env_temp_c`, `connected`), `t0_status`, `first_crack_status`, and the event
  timeline. **All temperatures Celsius.**
- **MCP has its own phase machine** (`session.py:19-27`): `pre_roast → roasting
  → development → dropped → cooling → complete`, plus `fault`. Events are
  **latched singletons** (except `fault`): `beans_added`,
  `first_crack_detected`, `beans_dropped`, `cooling_started`, `cooling_stopped`.
- **Auto-T0** (`T0Status`, `mcp_server.py:304-324`): detects charge by bean-temp
  drop from preheat max (default threshold 25 °C, ≥2 preheat samples). Detected
  T0 event payload includes `source: "auto_t0"`, charge temp, drop, threshold.
- **FC status** (`FirstCrackStatus`, `mcp_server.py:270-298`): `mode`
  (disabled/audio/manual), `status` (pending/detected/manual/faulted/…),
  detection timestamps, `allow_manual_override`, plus audio pipeline counters
  (queued/emitted/dropped/processed windows) — surface these counters in the
  dashboard's diagnostics drawer.
- **Export** (`exports.py`): `roast.jsonl`, `roast.csv` (20 columns incl. RoR,
  dev %, FC model metadata), `summary.json`. `ExportRoastLogResult` returns all
  paths + `ready` flag.
- **Simulation paths that already exist**: default driver is `mock`
  (`config.py:31-38`); audio can run from WAV (`COFFEE_AUDIO_SOURCE=wav`,
  `COFFEE_AUDIO_REPLAY_MODE=realtime|detector_paced`). ⇒ **Full-loop demo and
  CI runs need no hardware**: mock driver + recorded roast WAV exercises the
  real FC detector end to end.

**Implication adopted**: because MCP T0/FC are latched singleton events, the
agent's 3-tick T0 debounce primarily guards read errors/staleness rather than
sensor flapping (MCP latches detection internally). Keep the debounce — it is
cheap and defends against transient `get_roast_state` failures — but tests
should reflect that flapping originates from read faults, not MCP state.

## 3. Phase Mapping (agent ↔ MCP)

Agent phases are the operator-facing truth; MCP phases are inputs.

| Agent phase | MCP phase observed | Entry trigger | Exit trigger |
|---|---|---|---|
| `idle` | no session | — | operator starts roast |
| `starting` | no session → `pre_roast` | `POST /api/roasts` | `start_roast_session` OK |
| `preheating` | `pre_roast` | session started | `t0_status.status == "detected"` (or recovery-only operator `mark_beans_added`) held for `t0_debounce_ticks` |
| `roasting_pre_first_crack` | `roasting` | T0 confirmed | `first_crack_status.status == "detected"` or operator `mark_first_crack` |
| `development` | `development` | FC confirmed | validated drop decision or operator drop → `drop_beans` |
| `cooling` | `dropped`/`cooling` | `drop_beans` executed | cooling stopped (operator or policy) |
| `complete` | `complete` | `stop_cooling` + `export_roast_log` ready | — |
| `faulted` | any (often `fault`) | safety verdict FAULT/E-STOP, MCP fault, unrecoverable error | operator acknowledgement |
| `operator_recovery_required` | any | restart with possibly-active run; ambiguous MCP state; configured overrun severity | explicit operator action |

Verification story (M1): confirm on mock + hardware whether `drop_beans`
engages cooling on the Hottop (orchestration plan treats `drop_beans` as
drop+cooling; MCP records `cooling_started` as a separate event). The
controller's cooling entry handles both: if `cooling_on` is not observed within
a configured window after drop, controller issues `start_cooling` and logs it.

## 4. Module Design

Per orchestration plan § Implementation Modules, with refinements:

```text
src/roastpilot_agent/
├── controller.py     # RoastPhase enum, transition table, tick() loop, T0 debounce
├── mcp_client.py     # Typed wrapper over the 13 tools; owns the MCP child process
│                     #   (spawn, health, restart→recovery); Pydantic mirrors of
│                     #   RoastSessionState / T0Status / FirstCrackStatus
├── advisor.py        # RoastAdvisor ABC, AdvisorContext, RoastDecision,
│                     #   PydanticAIAdvisor (OpenRouter), FakeAdvisor (tests/demo)
├── safety.py         # SafetyVerdict enum, SafetyEvaluation, rule set, rate limits
├── store.py          # aiosqlite store, schema v1, recovery reads
├── api.py            # FastAPI: REST + SSE + static web/ mount; replay mode
├── replay.py         # ReplaySource: streams recorded exports through the real
│                     #   SSE pipeline at 1×–60× (dev/demo/UI prototyping)
├── models.py         # Shared Pydantic models & enums (incl. RoastProfile)
└── config.py         # ControllerConfig, AdvisorConfig, SafetyLimits, AppConfig
web/                  # Vite + React + TS SPA (built into the wheel)
```

Advisor specifics (D5):
- `AdvisorConfig`: `provider_base_url` (default OpenRouter), `api_key_env`,
  `model_slug`, `timeout_seconds=10.0`, `temperature`, `prompt_version`.
- `AdvisorContext` built from `RoastSessionState` + profile + recent decisions
  (+ `reference_roasts: list[RoastReference] = []`, empty until M2).
- Failure handling unchanged from orchestration plan: timeout/malformed/unsafe
  ⇒ rejected recommendation ⇒ deterministic fallback (hold current targets);
  every outcome persisted.

## 5. SQLite Schema v1

WAL + `synchronous=FULL` (orchestration plan defaults). Commit per tick during
active roasts; telemetry rows every `telemetry_log_interval_seconds` (5 s).

```sql
CREATE TABLE roast_runs (
  id TEXT PRIMARY KEY,                      -- uuid4
  mcp_session_id TEXT,
  agent_phase TEXT NOT NULL,                -- last persisted agent phase
  profile_json TEXT NOT NULL,               -- frozen RoastProfile
  config_json TEXT NOT NULL,                -- frozen ControllerConfig + SafetyLimits
  started_at_utc TEXT NOT NULL,
  completed_at_utc TEXT,
  outcome TEXT,                             -- completed | aborted | faulted
  fault_reason TEXT,
  log_dir TEXT,                             -- from ExportRoastLogResult
  export_manifest_json TEXT,                -- jsonl/csv/summary paths + ready
  operator_rating INTEGER CHECK (operator_rating BETWEEN 1 AND 5),
  operator_notes TEXT,
  cloud_sync_status TEXT NOT NULL DEFAULT 'local_only',
                                            -- local_only|pending_sync|synced|sync_failed
  cloud_roast_id TEXT,
  public_slug TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE roast_events (                 -- agent-level event log (superset of MCP events)
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  kind TEXT NOT NULL,                       -- run_started|phase_changed|charge_guidance|
                                            -- t0_detected|first_crack|advisory|command_*|
                                            -- safety_*|fault|recovery_*|logs_exported|run_completed
  source TEXT NOT NULL,                     -- controller|mcp|operator|advisor|safety
  monotonic_seconds REAL,
  recorded_at_utc TEXT NOT NULL,
  payload_json TEXT
);

CREATE TABLE telemetry_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  recorded_at_utc TEXT NOT NULL,
  elapsed_seconds REAL,
  agent_phase TEXT NOT NULL,
  mcp_phase TEXT,
  bean_temp_c REAL, env_temp_c REAL,
  bean_ror_c_per_min REAL, env_ror_c_per_min REAL,
  heat_level_percent INTEGER, fan_level_percent INTEGER,
  cooling_on INTEGER,
  development_percent REAL,
  raw_state_json TEXT                       -- full RoastSessionState dump
);

CREATE TABLE safety_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  rule TEXT NOT NULL,                       -- which rule fired / 'all_clear'
  verdict TEXT NOT NULL,                    -- allow|clamp|reject|recovery|fault|emergency_stop
  input_heat INTEGER, input_fan INTEGER,
  adjusted_heat INTEGER, adjusted_fan INTEGER,
  reason TEXT NOT NULL,
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE advisor_decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  provider TEXT NOT NULL, model TEXT NOT NULL, prompt_version TEXT NOT NULL,
  context_hash TEXT NOT NULL,               -- hash, not raw payload (plan policy)
  latency_ms INTEGER,
  decision_json TEXT,                       -- RoastDecision or NULL on failure
  status TEXT NOT NULL,                     -- ok|timeout|malformed|provider_error
  safety_evaluation_id INTEGER REFERENCES safety_evaluations(id),
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE command_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  tick INTEGER NOT NULL,
  tool TEXT NOT NULL,                       -- MCP tool name
  args_json TEXT,
  source TEXT NOT NULL,                     -- policy|advisor|operator|safety|recovery
  safety_evaluation_id INTEGER REFERENCES safety_evaluations(id),
  status TEXT NOT NULL,                     -- ok|failed
  result_json TEXT,
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE operator_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT REFERENCES roast_runs(id),
  action TEXT NOT NULL,
  payload_json TEXT,
  result TEXT NOT NULL,                     -- accepted|rejected|failed
  recorded_at_utc TEXT NOT NULL
);

CREATE TABLE sync_jobs (                    -- M2; table ships in v1 schema
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL REFERENCES roast_runs(id),
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,                     -- pending|in_flight|done|failed
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE reference_roasts (             -- M2 cache; table ships in v1 schema
  id TEXT PRIMARY KEY,                      -- cloud summary id
  bean_origin TEXT NOT NULL,
  roast_level TEXT NOT NULL,
  summary_json TEXT NOT NULL,               -- RoastReference payload
  fetched_at_utc TEXT NOT NULL
);
```

Indexes: `(run_id, tick)` on telemetry/safety/advisor/command tables;
`(run_id, kind)` on roast_events; `cloud_sync_status` on roast_runs.

## 6. API Contract (REST + SSE)

REST (JSON; Pydantic response models in `models.py`):

| Method & path | Purpose |
|---|---|
| `GET /api/health` | liveness + MCP child status + active run id |
| `POST /api/roasts` | start roast; body = `RoastProfile` (inline, D7); 409 if run active |
| `GET /api/roasts` | history list (id, started, outcome, bean, rating, dev %) |
| `GET /api/roasts/{id}` | run detail: profile, phase, outcome, export manifest |
| `GET /api/roasts/{id}/telemetry` | persisted snapshots (downsample query param) |
| `GET /api/roasts/{id}/timeline` | roast_events + safety + advisor + command trail (the decision trace — also the talk demo data) |
| `GET /api/roasts/{id}/log` | export manifest; file download endpoints |
| `POST /api/roasts/{id}/operator-actions` | body `{action, payload?}` — see below |
| `POST /api/roasts/{id}/rating` | operator self-rating `{stars, notes}` |
| `GET /api/roasts/{id}/events` | **SSE** stream |

Operator actions (enum): `mark_beans_added` (recovery-only), `mark_first_crack`,
`pause_advisory`, `resume_advisory`, `drop_beans`, `start_cooling`
(recovery-only), `stop_cooling`, `emergency_stop`, `acknowledge_recovery`.
Every action → `operator_actions` row → controller queue → safety policy → MCP.

SSE event types (`event:` field; `data:` = typed JSON): `run_started`,
`phase_changed`, `telemetry` (every tick), `charge_guidance`, `t0_detected`,
`first_crack`, `advisory` (decision + safety verdict + rationale),
`command_executed`, `command_failed`, `safety_alert`, `fault`,
`recovery_required`, `logs_exported`, `run_completed`, `heartbeat` (15 s).
SPA renders only from these events + snapshots — never infers phase locally.

## 7. Device SPA (`web/`)

Stack: Vite + React + TypeScript, Tailwind + shadcn/ui, **uPlot** for curves,
TanStack Query (REST) + native `EventSource` (SSE).

Pages (D8):
- **`/` Dashboard (live)** — the demo centerpiece:
  - Header: phase badge, elapsed / development time, dev %, profile name, MCP
    connection + FC pipeline status (diagnostics drawer shows audio counters).
  - Live curve (uPlot), **five series**: bean temp, env temp (left axis, °C);
    RoR (right axis, °C/min); **heat % and fan % as step-after lines** on a
    0–100 % scale (Artisan convention — control values are stepwise, drawn
    thinner/dimmer in the gauge colors, amber/teal, so cause-and-effect with
    the temp curves is visible). Event markers (T0, FC, drop), charge guidance
    band (170–200 °C) during preheat.
  - **Legend with live cursor readout**: color-keyed entries for all five
    series showing the value at the hovered time (uPlot's native legend);
    click-to-toggle series visibility for decluttering.
  - Control row: heat % and fan % (current + advisor target), cooling state.
  - **Advisory panel**: latest `RoastDecision` (targets, confidence, rationale)
    with **verdict badge ALLOW / CLAMP / REJECT** and reason; scrollable
    decision history. This panel is the talk's safety-boundary visual.
  - Safety banner (alerts/faults) + recovery modal (`operator_recovery_required`).
  - Operator action bar: Emergency Stop (prominent, confirm-press), Drop,
    Mark First Crack, Pause/Resume advisory, Stop Cooling.
  - Add-beans guidance toast (non-blocking, per plan).
- **`/roasts` History** — table: date, bean, profile, outcome, FC time, dev %,
  rating; links to detail.
- **`/roasts/:id` Detail** — full curve from persisted telemetry (same five
  series + legend + cursor readout as the live chart; scrubbing shows
  temps, RoR, **and heat/fan control values** at that moment, so advisory
  decisions in the trace can be visually correlated with their effect), event
  timeline, decision trace table (advisory → verdict → command), export
  downloads, self-rating widget (writes `operator_rating`).
  - **Trace-row → chart highlight**: clicking a decision-trace row highlights
    that timestamp on the curve (vertical marker + row selection state),
    linking each ALLOW/CLAMP/REJECT to its visible effect on the temp/RoR
    curves and the heat/fan step lines. This makes the recorded demo's
    decision-trace walkthrough self-explanatory.

**M2 additions to the SPA (owner-side cloud UI, per cloud-plan D10 — not M1
scope)**: because the owner never logs into the cloud, these live in the
device SPA and talk to the cloud through the agent:

- **Detail page cloud section**: sync status badge (`local_only /
  pending_sync / synced / sync_failed` with retry button), **Share** (copy
  unlisted link `https://…/r/{slug}`), visibility selector
  (private/unlisted/public), **Regenerate link** (slug revocation, with
  "old links stop working" confirmation), **Delete from cloud**
  (confirmation states what cascades: reviews + artifacts).
- **Cloud reviews in detail view**: taster reviews fetched via agent
  (`GET /api/roasts/{id}/reviews` on the cloud), shown alongside the operator
  self-rating.
- **History list**: small sync-status glyph per row.
- Agent REST additions for these: `POST /api/roasts/{id}/sync` (exists in
  plan), plus proxy endpoints for visibility/slug/delete/reviews — defined at
  M2 alongside cloud C3.

**Replay harness** (`replay.py` + `--replay` CLI flag): streams a recorded
roast export (JSONL/CSV from real past roasts) through the *real* SSE pipeline
at 1×–60×. Uses: UI development without hardware, deterministic UI tests,
and recording the talk's screen-capture. Note this complements, not replaces,
full-loop simulation via MCP mock driver + WAV audio source.

Packaging: `web/dist` built in CI (Node step) and included in the wheel via a
hatchling `force-include`/build hook; `api.py` mounts it as static files. Dev
mode: Vite dev server proxying `/api`.

## 8. Test Plan

Maps orchestration plan § Testing Plan to concrete suites (all M1 tests run
hardware-free):

| Suite | Coverage |
|---|---|
| `test_controller.py` | transition table (valid path, invalid rejections), T0 debounce (incl. read-fault flapping per §2 note), tick scheduler drift/jitter, add-beans guidance emitted once |
| `test_safety.py` | max bean/env temp, pre-T0 overrun → heat 0% + recovery/fault by severity, stale/missing telemetry, bounds, rate limits, unsafe drop rejection, e-stop |
| `test_advisor.py` | FakeAdvisor fixtures: valid / malformed / unsafe / timeout / provider error; OpenRouter impl behind a recorded-response test double |
| `test_mcp_client.py` | typed mirrors vs recorded `get_roast_state` payloads from real MCP (contract fixtures), child-process lifecycle, read/write failure paths |
| `test_store.py` | schema migration, per-tick commit rows, restart recovery reads, completed-run immutability |
| `test_api.py` | routes, SSE stream typing, operator action queue, disconnect handling |
| `test_milestone1.py` | the 12-step mock vertical slice end-to-end (fake MCP), then against real MCP server in mock mode (subprocess) |
| `web/` tests | component tests + Playwright against the replay harness |

Contract fixtures: capture real `RoastSessionState` JSON from the actual MCP
server (mock driver) and commit as fixtures — `mcp-contract-checker` sub-agent
re-validates them against the installed `coffee-roaster-mcp` version.

## 9. Epic / Story Breakdown (spec-driven coding-agent workflow)

| Epic | Scope | Depends on |
|---|---|---|
| E1 Scaffold | pyproject (py3.11+), ruff/pyright/pytest gates, CI, README skeleton, **AGENTS.md** (canonical repo rules per D14, templated on coffee-roaster-mcp's) + one-line `CLAUDE.md` (`@AGENTS.md`), `.claude/agents/` sub-agents (§10), `docs/epics/` spec files | — |
| E2 Models & config | enums, RoastProfile, ControllerConfig, AdvisorConfig, SafetyLimits, SafetyVerdict/Evaluation | E1 |
| E3 Safety policy | full rule set + tests | E2 |
| E4 Controller | state machine, tick loop, debounce, fake-MCP harness | E2, E3 |
| E5 MCP client | typed wrapper, subprocess lifecycle, contract fixtures | E2 |
| E6 Store | schema v1, recovery reads, tick commits | E2 |
| E7 API | REST + SSE + operator action queue | E4, E6 |
| E8 Advisor | interface + FakeAdvisor + OpenRouter impl + call-frequency policy | E2 |
| E9 Vertical slice | 12-step mock milestone test; wire E4–E8 together | E4–E8 |
| E10 SPA | scaffold, replay harness, dashboard, detail, history | E7 |
| E11 Packaging | wheel incl. `web/dist`, systemd unit, deployment doc | E9, E10 |
| E12 Validation & demo | supervised Hottop runs; record demo traces (≥1 CLAMP, ≥1 REJECT), MCP interaction trace, full-workflow screen capture | E11 |

E12's outputs are the talk's demo plan artifacts — treat them as deliverables,
not byproducts.

## 10. Sub-Agent Definitions (`.claude/agents/` in the new repo)

- **safety-reviewer** — triggered for PRs touching `safety.py`, `controller.py`,
  `models.py` enums. Checks: every transition has a test; no code path delivers
  advisor output to `mcp_client` without a `SafetyEvaluation`; verdicts remain
  typed (no string comparisons); restart never auto-resumes heat/fan; e-stop
  reachable from every phase. Tools: Read, Grep, Bash (pytest).
- **mcp-contract-checker** — re-derives the tool surface from the installed
  `coffee-roaster-mcp` package and diffs against `mcp_client.py` mirrors +
  committed contract fixtures. Run on dependency bumps.
- **sim-roast-runner** — runs the mock vertical slice and/or replay scenarios,
  summarizes the decision trace (advisory → verdict → command) as markdown;
  used for regression review and generating talk demo traces.
- **ui-reviewer** — Playwright against the replay harness; screenshots each
  page state (preheat, roasting, development w/ CLAMP verdict, recovery modal,
  fault) and reviews against the page inventory in §7.

## 11. Remaining Open Items

1. Exact OpenRouter model slug + structured-output settings — confirm at E8.
2. `drop_beans` cooling behavior on real hardware — E12 verification story (§3).
3. Hatchling build-hook details for `web/dist` — resolve at E11 (fallback:
   commit built dist for the first release).
4. SSE keep-alive/reconnect behavior on Safari/iOS (operator may use an iPad) —
   test at E10.
