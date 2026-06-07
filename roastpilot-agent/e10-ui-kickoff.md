# E10 UI Kickoff Brief

**Audience**: the implementation session, at the moment E7 (API + SSE) merges
and E10's issues are minted from `docs/epics/E10-spa.md`.
**Written**: 7 June 2026. This brief supplements the E10 epic spec — it adds
the prototype mapping, design tokens, baselines, and demo wiring that the
spec doesn't carry. Where they disagree, plan §7 + the epic spec win.

---

## 1. Design tokens — do this first (E10-S2, first commit)

Extract the palette from the prototype's theme into
`web/src/styles/tokens.css` (CSS custom properties + Tailwind preset):

- Source: `roastpilot-plan/roastpilot-agent/sketches/live-dashboard/src/styles/theme.css`
  — the `--roast-*` variables (heat, fan, coffee, nominal, caution, fault,
  phase-*) are already defined there. **Remember the export's dark-mode trap**:
  those variables live in a `.dark {}` block — the real app should define them
  unconditionally (dark is the only theme in M1).
- Typography: tabular figures for all numeric displays (temps, timers,
  percentages) — readable from 1 m at the roaster.

## 2. Prototype → component mapping (rebuild, never port)

| Prototype (`sketches/live-dashboard/src/app/components/`) | Real component | Data source | Watch for |
|---|---|---|---|
| `Layout3Enhanced` | `DashboardPage` | SSE stream | Drop the dev toolbars/annotations |
| `RoastHeader` | `RoastHeader` | `phase_changed`, `telemetry` events | Phase badge colors from tokens |
| `TemperatureChart` | `LiveCurve` (uPlot) | `telemetry` events (append) | **Recharts → uPlot.** 5 series incl. heat/fan step-after; legend = cursor readout + click-to-toggle (toggle is specced but was never in the prototype); charge band only in `preheating` |
| `ControlIndicator` ×2 | `ControlRow` | `telemetry` + latest `advisory` | Ghost markers = advisor targets |
| `AdvisoryPanel` | `AdvisoryPanel` | `advisory` events | **Verdict rendering per D15** — see §3 |
| `ActionBar` | `OperatorActionBar` | POST `/api/roasts/{id}/operator-actions` | E-stop = confirm-press, enabled in every phase; per-phase enablement of the rest comes from the server state, mirroring E3's command×phase matrix — never hardcode it client-side |
| `OperatorRecoveryModal` | `RecoveryModal` | `recovery_required` event | Copy must state "no auto-resume; system will not touch heat/fan until you choose" |
| `FaultBanner` | `FaultBanner` | `fault` + `safety_alert` events | Includes the safety event trail |
| `NotificationCenter` | keep or fold into toasts | `charge_guidance` etc. | Add-beans toast is non-blocking guidance |
| `RoastDetailLayout1`, `DecisionTraceTable`, `RoastCurveChart`, `EventTimeline`, `RoastRating`, `ExportOptions` | detail page | REST: `/telemetry`, `/timeline`, `/log`, `/rating` | Trace-row → curve highlight already prototyped; keep the toggle-on-reclick behavior |
| `RoastHistoryScreen` + table/filter/empty | history page | `GET /api/roasts` | Sparklines optional — cut first if time is tight |

## 3. Verdict rendering nuance (D15 — six verdicts, three badges)

The prototype shows three advisory badges. The real vocabulary is six. The
mapping the UI must implement:

- **ALLOW / CLAMP / REJECT** → advisory-panel badges (outcomes of advisor
  recommendations). Prototype said `ACCEPT` — the enum says `ALLOW`; UI copy
  follows the enum.
- **RECOVERY** → not a badge: it manifests as the `recovery_required` event
  → RecoveryModal.
- **FAULT / EMERGENCY_STOP** → not badges: FaultBanner + phase change.
- The decision trace (detail page) may show all six in its verdict column —
  it renders history, not advisory state.

## 4. Replay fixtures — use the real roasts

`coffee-roaster-mcp/docs/validation/2026-06-07-live-roast/{session,session-2}/`
(real Hottop, live audio FC at 0.907/0.906 confidence, auto-T0 in session 2).
Session 2 is the better demo fixture (auto-T0 with full payload). Copy the
chosen exports into `tests/fixtures/replay/` in the agent repo — don't
reference across repos at runtime.

Replay rates: 1× for screen-recording (E12), 60× for development, deterministic
stepping for Playwright.

## 5. Screenshot baselines for ui-reviewer

The approved direction is frozen in
`roastpilot-plan/roastpilot-agent/sketches/screenshots/`. The ui-reviewer
sub-agent compares Playwright captures of the real SPA against them —
*direction match, not pixel match* (the rebuild will differ; deviations from
the plan are what it flags). Required capture states (mirror the baseline
set): dashboard-live (preheat, charge band visible), dashboard-recovery,
dashboard-fault, roast-detail, roast-detail-selected (CLAMP row + curve
marker), history, history-empty. Known prototype deviations are listed in
`sketches/README.md` — the plan wins.

## 6. SSE behavior (E10-S4 + plan §11.4)

- Render from events + snapshots only; on (re)connect, hydrate from
  `GET /api/roasts/{id}` then apply events — never infer phase locally.
- Reconnect with capped backoff; surface a "live / reconnecting / stale"
  indicator in the header (operator trust depends on knowing data is fresh —
  staleness is a safety-relevant UI state).
- Safari/iPadOS: verify EventSource behavior under tab backgrounding and
  screen lock at the roaster; 15 s heartbeat is the liveness signal. Record
  the resolution in plan §11 (closes item 4).

## 7. Demo wiring (feeds E12 — capture as you go)

- E10-S1's replay harness at 1× **is** the screen-recording rig; record a
  full mock-roast workflow as soon as the dashboard renders one — don't wait
  for polish (early takes have saved more talks than late perfection).
- The advisory panel showing one CLAMP with its reason on the live dashboard
  is the talk's key frame — make sure the replay fixture's decision sequence
  produces one on screen.
- Measured M1 metrics (plan E12 row): acceptance mix, interventions,
  recovery-free completions — the detail page's trace table is their visual.

## 8. Out of scope (resist)

M2 cloud controls (sync badge, share, visibility — agent plan §7 "M2
additions"), settings UI (config file per D8), curve-target profiles (D7),
series smoothing/zoom beyond uPlot defaults, light theme.
