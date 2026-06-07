# Gemini UI Sketch Prompts — RoastPilot Device SPA

Prompts for generating UI sketches/mockups with Gemini Pro. Each prompt is
self-contained: paste the **shared context block** first, then one screen
prompt. Data fields and value ranges are taken from the agreed plan
(`plan.md` §6–7) and the real MCP contract, so the sketches double as specs.

**Workflow**: ask for an annotated wireframe first → pick a direction → ask for
a high-fidelity pass of the winner → only then move to v0.dev/code. Always ask
for **3 distinct layout variations** per screen — Gemini's value here is
exploring layout space cheaply.

---

## Shared context block (paste at the top of every prompt)

```text
You are designing the UI for RoastPilot, a home coffee-roasting control
application. It runs as a local web app controlling a Hottop drum roaster via
a deterministic software controller. An LLM "advisor" suggests heat/fan
adjustments, but deterministic safety code validates every suggestion before
anything reaches the hardware — the UI must make this safety boundary visible.

Design language:
- Dark theme primary (roastery at night), warm accent palette: amber/copper
  for heat, cool teal for fan/air, neutral grays. Subtle coffee-brown tones.
- Information-dense but calm: this is an operator console, not a consumer app.
  Closest relatives: Artisan roasting software, Grafana dashboards, flight
  instrumentation.
- Typography: clear numeric displays (tabular figures) for temperatures and
  timers; large enough to read from 1 m away while handling a hot roaster.
- Desktop 16:9 primary; must also work on an iPad in landscape.
- Status colors: green = nominal, amber = caution/CLAMP, red = fault/REJECT/
  emergency. Phase accent color shifts as the roast progresses.

Domain facts for realistic sketch data (all temperatures Celsius):
- A roast: preheat to ~200 °C, beans added (T0), temp dips then climbs,
  first crack at ~195-205 °C around 8-10 min, "development" phase 1.5-3 min,
  drop at ~210-225 °C, then cooling ~4 min.
- Bean temp range on the chart: 80-230 °C. Rate of rise (RoR): 0-25 °C/min,
  declining over the roast. Heat and fan: 0-100 % in steps.
- Phases: Preheating → Roasting → Development → Cooling → Complete, plus
  Fault and "Operator recovery required" states.
```

---

## Prompt A — Live Roast Dashboard (the centerpiece)

```text
Design the live roast dashboard screen.

Layout requirements:
1. Header strip: current phase badge ("DEVELOPMENT"), roast timer 09:42,
   development timer 01:12, development percentage 11.8 %, profile name
   "Ethiopian Yirgacheffe — Medium", connection status dots (roaster: green,
   first-crack audio: green).
2. Dominant element: live roast chart (about 60 % of screen) with FIVE series:
   two temperature lines (bean temp 198.4 °C, environment temp 211.0 °C), RoR
   line on a secondary axis (8.2 °C/min), and the two CONTROL values plotted
   as thin step-style lines on a 0-100 % scale along the lower part of the
   plot: heat % (amber, stepping e.g. 80 → 75 → 65) and fan % (teal, stepping
   e.g. 40 → 45 → 70). The step lines visually correlate control changes with
   the temperature response (like Artisan roasting software). Include a
   color-keyed legend for all five series that doubles as a readout of each
   value at the hovered/current time. Vertical event markers labeled T0
   (00:00), FIRST CRACK (08:30). During preheat the chart shows a shaded
   horizontal "charge zone" band at 170-200 °C.
3. Control row: two large readouts with slider-style indicators —
   HEAT 65 % (amber) and FAN 70 % (teal). Each shows a small ghost marker for
   the advisor's recommended target (heat 60 %, fan 75 %).
4. Advisory panel (right side or lower third): the latest LLM recommendation
   as a card: recommended heat 60 %, fan 75 %, "should drop: no",
   confidence 0.82, one-sentence rationale ("RoR declining steadily; reduce
   heat to stretch development"), and a prominent verdict badge from the
   safety system: one of ALLOW (green), CLAMP (amber, shows "heat clamped
   60→65 % — rate limit"), REJECT (red, with reason). Below: a compact history
   list of the last 4 decisions with their verdict badges.
5. Operator action bar (always visible, bottom): EMERGENCY STOP (large, red,
   guarded), DROP BEANS, MARK FIRST CRACK, PAUSE ADVISOR, STOP COOLING
   (disabled in this phase).
6. A dismissible toast example: "Charge zone reached — you can add beans."

Render as a high-fidelity dark-theme UI mockup, desktop 16:9. Produce 3
distinct layout variations (e.g., advisory panel right vs bottom; chart
full-width vs with side rail) and annotate the key regions.
```

## Prompt B — Recovery & Fault States

```text
Design two exceptional-state treatments of the same dashboard:

1. OPERATOR RECOVERY REQUIRED: the service restarted during an active roast.
   A blocking modal over a dimmed (but still updating) dashboard: explains
   last known state ("Restarted during DEVELOPMENT at 10:02, bean temp
   204 °C, heat was 60 %"), current hardware readout, and explicit action
   buttons: RESUME MONITORING ONLY, DROP BEANS NOW, START COOLING,
   EMERGENCY STOP. No auto-resume; the design must communicate "the system
   will not touch heat or fan until you decide."
2. FAULT: pre-T0 thermal overrun (bean temp exceeded 200 °C before beans
   were added). Full-width red banner, heat forced to 0 % indicator, fan held
   at safe level, single primary action: ACKNOWLEDGE FAULT, with the event
   trail visible (what the safety layer did and when).

Dark theme, desktop 16:9, high-fidelity, annotated. The tone is serious but
not alarmist — an operator console, not a consumer error page.
```

## Prompt C — Roast Detail (post-roast analysis)

```text
Design the roast detail screen for a completed roast.

Content:
1. Title block: "Ethiopian Yirgacheffe — Medium", date, outcome chip
   (COMPLETED), headline stats: total time 12:54, first crack 08:30 at
   201.2 °C, drop 10:45 at 218.5 °C, development 21.0 %.
2. Full roast curve with five series (bean temp, env temp, RoR, plus heat %
   and fan % as thin step lines on a 0-100 % scale) with a color-keyed legend,
   event markers, and a scrubber; hovering shows all five values at that
   moment — so decision-trace rows can be visually matched to the control
   changes and their temperature effect.
3. Decision trace table — the heart of this screen: one row per advisory
   decision: time, recommended heat/fan, safety verdict badge
   (ALLOW/CLAMP/REJECT), what was actually executed, rationale (truncated,
   expandable). Include one CLAMP row and one REJECT row in the sketch.
   Rows are clickable: selecting a row highlights that timestamp on the roast
   curve (vertical marker) so the decision links to its visible effect — show
   one row in selected state with the corresponding chart marker.
4. Event timeline strip: T0, first crack (source: audio model, confidence
   0.94), drop, cooling start/stop, export completed.
5. Self-rating widget: 1-5 stars + free-text notes ("Good body, slightly
   bright"), save button.
6. Export row: download JSONL / CSV / summary JSON.

Dark theme, desktop 16:9, high-fidelity, 3 layout variations.
```

## Prompt D — Roast History

```text
Design the roast history screen: a dense, scannable table/list of past
roasts. Columns: date, bean & profile, outcome chip, first-crack time, drop
temp, development %, operator rating (stars), tiny inline sparkline of the
bean-temp curve. Filter bar: bean origin, outcome, rating. Each row links to
the detail screen. Include an empty state ("No roasts yet — start your
first roast"). Dark theme, desktop 16:9, one strong variation is enough.
```

## Bonus Prompt E — Cloud taster review page (roastpilot-cloud, M2)

```text
Different surface: a public mobile-first web page opened from an unlisted
link a friend received with a bag of coffee. No account, no login.

Content: coffee name + roast date + a small elegant roast-curve thumbnail;
"Rate this coffee" — 1-5 stars (large touch targets); flavor sliders or chip
selectors: aroma, acidity, sweetness, body, aftertaste; brew method chips
(espresso, V60, French press, moka); free-text note; optional name field;
submit. Friendly and warm (this one IS consumer-facing), light theme, works
one-handed on a phone, under 30 seconds to complete. Produce mobile
portrait mockups, 3 variations.
```

## Prompt F — Public roast page (roastpilot-cloud, M2)

```text
Same surface as Prompt E (public, no account, opened from a shared link),
but the full page AROUND the rating form: a shared coffee roast page.

Content, top to bottom:
1. Header: coffee name "Ethiopian Yirgacheffe — Medium", roasted date, and
   if reviews exist a small average rating (4.5 ★ · 3 reviews).
2. Roast summary stats as compact cards: total time 12:54, first crack at
   08:30 (201 °C), dropped at 10:45 (218 °C), development 21 %.
3. Roast curve chart: bean temp, env temp, RoR lines plus thin dashed step
   lines for heat % and fan % on a 0-100 % scale, with a small color legend.
   Read-only, elegant, not an operator console — this is the "show your
   friends" view.
4. Reviews so far: 2-3 short review cards (name or "Anonymous", stars, one
   line of notes, brew method chip).
5. "Rate this coffee" call-to-action leading into the rating form from
   Prompt E.

Warm, light theme matching Prompt E. Mobile portrait first (this opens from
a chat link on a phone), but also show a desktop variant. The page should
feel like a gift tag on a bag of coffee, not an analytics dashboard.
Produce 3 variations.
```

---

## Tips

**Tool decision (7 June 2026): Figma Make** — tried and produced decent
results; chosen over Gemini image sketches. The prompts above work unchanged.

- AI output drifts on exact numbers/labels — treat prototypes as layout
  exploration; the prompt text above is the spec of record.
- When a direction wins, regenerate at tablet landscape (iPad) too — the
  operator console must work there (plan §11.4).
- **Export → agent rewrite workflow**: iterate in Make only until the layout
  stops moving (mind the credit caps), then export the React code. The export
  is a *reference spec* for the coding agent, **not seed code** — each E10
  story rebuilds its screen in the repo stack (Vite + TS + Tailwind/shadcn +
  uPlot) using the export for layout/hierarchy/spacing intent. Two things the
  prototype cannot supply and must be built fresh: the live uPlot curve wired
  to SSE + replay harness, and all state logic (verdict badges, phase
  transitions, recovery modal, reconnect).
- Check whether Figma's Dev Mode MCP server covers Make files — if so, coding
  agents can read the prototype directly instead of via exported code.
- Keep every prototype export in `roastpilot-agent/sketches/` (this repo) with
  the prompt + Make file link, so each E10 story has a traceable input
  artifact.
