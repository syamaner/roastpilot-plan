# UI Prototypes (Figma Make exports) — Design Record

**Source of truth: the plan (`../plan.md` + `../ui-prompts.md`), NOT these
prototypes.** Where prototype and plan disagree, the plan wins. The exports are
reference specs for the E10 SPA rebuild (layout, hierarchy, spacing intent) —
never seed code.

## Contents

| Path | What |
|---|---|
| `live-dashboard/` | Figma Make export: device SPA prototype (prompt A–D — live dashboard, recovery, fault, detail, history) |
| `cloud-review/` | Figma Make export: cloud taster review page (prompt E, mobile-first) |
| `screenshots/` | Frozen renders of the approved direction (capture details below) |
| `capture.mjs` | Playwright script that regenerates the screenshots |

## Screenshots (captured 7 June 2026)

| File | State |
|---|---|
| `dashboard-live.png` | Live roast, normal operation (preheating, charge band, advisory panel with verdict badges) |
| `dashboard-recovery.png` | `operator_recovery_required` modal — last known state, hardware readout, explicit operator actions, no auto-resume |
| `dashboard-fault.png` | Pre-T0 thermal overrun fault — heat forced 0 %, fan safe, safety event trail, acknowledge action |
| `roast-detail.png` | Completed roast: curve, event timeline, LLM decision trace, headline stats |
| `roast-detail-selected.png` | Same, with the CLAMP trace row selected → white `DECISION` marker on the curve + cursor readout at that time (trace-row → chart highlight, plan §7) |
| `history.png` / `history-empty.png` | History table with sparklines / empty state |
| `cloud-review-mobile.png` | Taster review page at 390×844 (phone) |

## Known deviations from the plan (rebuild follows the plan)

1. **Verdict naming**: prototype says `ACCEPT`; the typed `SafetyVerdict` enum
   (and talk wording) is **`ALLOW`** / CLAMP / REJECT.
2. **Chart library**: prototype uses Recharts 2.x with static mock data; the
   real SPA uses **uPlot** wired to SSE + the replay harness (plan §7).
3. **Chart series (agreed 7 June 2026)**: the original Make export plotted
   only bean temp / env temp / RoR with no proper legend. The prototype was
   locally extended to match the plan: **five series** (heat % and fan % as
   dashed step lines on a hidden 0–100 % scale), legend with value readout,
   and the **trace-row → chart highlight** interaction in the detail view
   (plan §7, ui-prompts prompts A & C). Series toggle (click legend entry to
   hide a series) is specced in the plan but not implemented in the prototype.
4. **Mock data quirks**: temperatures/timings are generated, not from real
   roast logs; treat all numbers as placeholders.
5. The on-screen view/state switcher pills (top-left & bottom-center) and the
   white/amber annotation labels on the fault banner and recovery modal are
   prototype dev tooling only — hidden in the captures, not part of the design.
6. The prototype's root layout scrolls internally, so the temperature chart
   falls below the fold in `dashboard-fault.png`; the fault *treatment* (banner,
   safety state, event trail, locked controls) is fully captured, and the
   normal chart layout is in `dashboard-live.png`.

## Local changes made to the raw exports

- `live-dashboard/index.html`: added `class="dark"` to `<html>`. The export
  defines all custom `--roast-*` colors inside a `.dark {}` block but never
  sets the class (Figma Make's preview shell did). Without it, chart lines and
  accent colors don't render.
- Chart/trace extensions (7 June 2026, to match plan §7): heat/fan step-line
  series + legend readout in `TemperatureChart.tsx` and `RoastCurveChart.tsx`;
  control-value mock data in `App.tsx` (steps derived from the decision
  trace); clickable trace rows + chart highlight marker in
  `DecisionTraceTable.tsx` / `RoastDetailLayout1.tsx`.
- Folders renamed from the Make export names to kebab-case.

## Regenerating screenshots

```bash
# Terminal 1 (and 2): start the prototype(s)
cd live-dashboard && npm install && npm run dev -- --port 5173 --strictPort
cd cloud-review   && npm install && npm run dev -- --port 5174 --strictPort

# Then:
npm install            # installs playwright-core (uses system Google Chrome)
node capture.mjs dashboard
node capture.mjs cloud
```
