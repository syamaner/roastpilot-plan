# Deterministic Control Loop — Advisor Redesign Plan (proposed D35)

**Status:** DRAFT for operator ratification (14 Jun 2026). Author: PM pass after the
attempt-3 supervised hardware roast. Supersedes the "better-prompt" framing of the
advisor (D33/D34, #214). Source of truth once ratified into `plan.md` §1 as **D35**.

---

## 0. Why (the live evidence)

Attempt-3 (the 4th supervised hardware roast, profile "test 6") gave two clean results:

1. **The safety keystone held.** #209's post-charge settle window kept the advisor silent
   through the charge crash; the heat-flooring that aborted attempt 2 did not recur.
2. **The free-judgment advisor is the wrong design for in-roast control.** Post-charge,
   `gemini-3.1-flash-lite` + the v4 prompt drove the roast badly and dangerously
   (#218): fan micro-twiddling (30↔40↔50↔60↔70), heat thrashing (70→40→20→0 %),
   raising fan to 60–80 % approaching FC (crashes RoR into the crack), cutting heat on an
   already-flatlined RoR, and a final self-contradictory recommendation ("reduce heat to
   0 % to prevent overshoot ... without stalling" at RoR ~1). It baked the batch.

The operator's **own proven system** (`coffee-roasting/.../Autonomous Coffee Roast v3 -
Dual Loop (Agent 1 & 2).json`) shows why it works and ours did not. It does **not** use
free LLM judgment for control. It is a **deterministic decision tree the LLM executes**,
split across two phase agents, on **gpt-4o**:

- Pre-FC is fully deterministic: **heat 100 / fan 30**, monitor, watch for FC.
- Development is an explicit threshold tree (FC → 80/50; 190–193 & dev<12 % → 50/70;
  **drop at 193–196 °C AND dev 10–20 %**; emergency bounds at 196/198).
- Cadence is deliberate and phase-adaptive (pre-FC ~10 s, development ~5 s), not
  change-based-every-tick.

See memory `operator-working-n8n-roast-system` for the full extract.

## 1. Proposed decision (D35)

> **Reframe the advisor from per-tick free-form heat/fan judgment to a DETERMINISTIC
> PHASE CONTROLLER that owns the heat/fan rules, with the LLM reserved for the drop
> decision and anomaly flags only. Pre-first-crack is fully deterministic and the
> free-form advisor is not consulted there. Port the operator's proven n8n decision
> tree (thresholds profile-derived, not hardcoded) onto RoastPilot's deterministic
> controller + safety envelope.**

This is not a retreat from the project thesis. It is the thesis taken to its logical
end: "the controller owns the loop; the LLM advises." We had the controller owning the
*tick* but the LLM owning the *levers*. D35 moves the **heat/fan rules into the
controller** and shrinks the LLM to where it adds genuine judgment.

### Control split — RESOLVED at the first-crack boundary (operator, 14 Jun 2026)

The control path is split at **first crack**:

- **Before FC (preheat → charge → drying → Maillard): DETERMINISTIC controller, no LLM.**
  Heat 100 / fan low, drive to FC. This is the phase where the free-form advisor thrashed
  and baked the roast (#218), and where there is no craft to add (max heat, low fan). The
  LLM is not consulted here at all.
- **After FC (development → drop): LLM advises HEAT + FAN + the DROP**, inside a hard
  safety box (see below). Operator rationale: post-FC the stall risk is low, the bean has
  momentum, and development is where the actual roast-craft lives (steering RoR to the
  flavour / DTR target, then dropping). It is also a **fast, dynamic** phase, so a
  **decisive lever step is expected and correct** there, unlike the steady drying ramp.
- **Emergency limits set at the start clamp the LLM the whole way:** the bean-temp ceiling,
  the ≤196 °C indicated bitter ceiling, an emergency-drop bound (>198 °C), and fail-closed.
  The LLM advises *within* the box; it cannot blow through it. Every lever still passes the
  SafetyEvaluation.

Design consequence (the v4 failure must not recur post-FC): **damp incoherent oscillation,
not magnitude.** The post-FC LLM is allowed bold, deliberate moves (a real heat cut, a real
fan change) — what it must NOT do is twiddle (30↔40↔50 every tick) or self-contradict. So:
fast post-FC cadence (~5 s), a hysteresis/deadband on *direction-flipping* (not on size),
and the safety box. Validate on the replay harness (§C) before trusting it live.

---

## 2. Issue audit — redundancy / consolidation

| Issue | Disposition under D35 |
|---|---|
| **#218** advisor over-adjusts fan/heat (the evidence log) | **Becomes the "why" for D35.** Keep open as the evidence/acceptance anchor; close when the deterministic controller lands and a replay shows roaster-like levers. |
| **#214** v9 charge-aware *prompt* | **Reframe, do not build as written.** "Better prompt" is the wrong fix. Re-scope #214 to "advisor role under D35" (drop-confirmation / anomaly prompt) or close as superseded. |
| **#172** stage-tuned advisor *prompt* sections | **Close as superseded** by D35 (per-phase control moves to the controller, not the prompt). |
| **#209** post-charge settle window (merged) | **Superseded** by "pre-FC is deterministic, advisor not consulted pre-FC." Keep the code until the deterministic pre-FC lands, then remove (the settle window is a no-op once the advisor never runs pre-FC). |
| **#205** RoR staircase smoothing | **Keep — now higher value.** Clean RoR feeds the deterministic thresholds + the drop rule, not just the chart. |
| **#219** roast clock from charge (T0) | **Keep — prerequisite.** DTR (the drop rule's input) is wrong until this lands. Foundational for D35. |
| **#220** surface development time / DTR | **Keep.** Depends on #219. The operator must see the number the controller drops on. |
| **#216** dwell-timer seed on reconnect | **Fold into #220** (same DTR/clock cluster) or keep as a minor follow-up. |
| **#217** fixed 0–215 Y-axis scaling | **Keep, independent.** Local hotfix already applied; needs the real PR. |
| **#210** drop after fault / **#212** shutdown wedge | **Keep, independent operability/safety.** Deferred to after the next roast (operator). |
| **#177 / #176** shutdown-timeout / cooling-on-shutdown | **Keep — relate to #212.** Consider consolidating #177 + #212 (same wedged-child shutdown surface). |
| **manual heat/fan override** (raised on #218) | **New decision needed.** Tonight proved minimal-UX leaves no lever when control is wrong. Under D35 the controller is deterministic + correct, which *weakens* the need; but a manual override remains the human safety net. Operator call — see §4-D. |

**Net redundancy:** #214 + #172 (prompt work) are superseded by D35; #209 becomes a
no-op; #216 folds into #220; #177 may merge with #212. Everything else is independent
and stays.

---

## 3. Target architecture

The controller owns a per-phase **deterministic lever policy** (the n8n decision tree,
thresholds resolved from the active `RoastProfile`, not hardcoded):

| Phase | Deterministic rule (lever policy) | LLM role |
|---|---|---|
| **preheat** | heat 100 / fan ≤30, ramp to charge band; emit the (bean-keyed) charge cue | none |
| **charge → turning point** | hold heat 100 / fan low; auto-T0 from MCP bean-drop | none (this is #209's job, now deterministic) |
| **drying → browning** | **heat high / fan low** (operator method: do not extend roast time); fan opens only entering browning | none / commentary |
| **late Maillard → FC** (still pre-FC) | deterministic anticipatory heat **trim** (moderate, e.g. ~60–70 %, not a crash), fan controlled; bend RoR into FC | **none** (deterministic) |
| **development → drop** (post-FC) | the safety box only: ≤196 °C ceiling, emergency-drop >198, fail-closed; direction-flip deadband on lever changes | **LLM advises heat + fan + the drop** — decisive moves allowed (fast phase), thrash damped; fast cadence (~5 s); gpt-4o |
| **cooling / complete** | stop sequence | none |

Constants to lift from the operator's proven system (then tune to the profile):
pre-FC heat 100 / fan 30; FC → heat 80 / fan 50; drop 193–196 °C + DTR 10–20 %;
emergency heat 20 / fan 90 at ≥196 & dev<12 %; emergency drop >198 °C. Cross-check the
operator profile (FC 170–180, drop ≤196, DTR ~15 %, max-heat/low-fan-until-browning).

Cadence: deliberate + phase-adaptive (pre-FC ~10 s, development ~5 s), replacing the
change-based-every-tick cadence (D32) that drove the twiddling.

Safety envelope unchanged: every lever write still passes the SafetyEvaluation; the
six verdicts and the fail-closed paths are untouched. D35 changes *who decides the
lever* (controller rules, not the LLM), not the safety gate.

---

## 4. Workstreams

### A. Harness changes (the agent)
1. **Deterministic phase lever-policy in the controller.** A `RoastControlPolicy`
   (profile-parameterised) that maps (phase, telemetry, DTR) → target heat/fan, run
   every tick through the existing safety path. Subsumes #209.
2. **Gate the free-form advisor out of pre-FC entirely**; engage it only post-FC and only
   for its D35 role (drop-confirm / anomaly), per option (a)/(b).
3. **Config / profile-derived thresholds** (no magic numbers in code; tunable per profile;
   defaults from the operator's proven values).
4. **#219** roast clock from charge (DTR correctness) — prerequisite for the drop rule.
5. **#205** RoR smoothing — feeds the thresholds + drop rule (now load-bearing, not cosmetic).
6. **Operability:** #210 (drop in FAULTED), #212/#177 (bounded force-shutdown). Independent
   but should land before unsupervised operation.

### B. LLM eval (re-scope)
- The advisor's job shrinks; eval shrinks with it. Under (b), eval the **drop decision**
  only (v4 already scores recall 1.0 there) and add **gpt-4o** (the operator's proven
  model) to the roster. Under (a), eval the LLM's anomaly/commentary usefulness separately
  and stop gating control on it.
- **Eval the deterministic controller itself** — the bigger eval shift. Replay recorded
  roasts through `RoastControlPolicy` and score the produced trajectory against the
  operator's actual roast (roaster-like fan/heat moves, FC timing, drop temp/DTR), not
  just the LLM drop call. Reward trajectory sanity (fan-change count, no momentum-killing
  cuts), the gaps tonight's bake-off could not see.
- Keep the bake-off harness; point it at the consolidated test set (§C).

### C. Consolidate logs → a real test harness (the highest-leverage item)
Build one replayable roast dataset + two harnesses on it. Sources on disk now:
- **47 annotated Artisan `.alog`** roasts (operator iCloud) — already adapted via
  `scripts/alog_to_fixture.py` (the bake-off set).
- **2 coffee-roaster-mcp live roasts (7 Jun)** — `docs/validation/2026-06-07-live-roast/`
  (full telemetry + events).
- **6 real-Hottop SQLite traces from 13–14 Jun** (`~/roasts/roastpilot.sqlite3`) —
  including **tonight's v4-failure runs**: the charge-flood (attempt 2), the baked
  test-6 run (heat 70→40→20→0). These are gold **negative regression cases** the
  deterministic controller must avoid. Extract per run via the schema in the memories.
- **n8n FC-eval CSVs** (`coffee-roasting/evaluation/`) — FC-detection ground truth.

Two harnesses:
1. **Controller-replay harness:** feed a recorded roast's telemetry to
   `RoastControlPolicy`, assert it produces a roaster-like lever trajectory + a sane drop
   (vs the recorded operator roast). Tonight's failure runs become assertions ("must not
   crash heat to <50 % on a flatlined pre-FC RoR").
2. **Advisor-drop eval** (existing bake-off, expanded with gpt-4o) — only meaningful under (b).

Deliverable: a documented, versioned fixture set + a `make`-able eval that runs in CI for
the controller and on-demand (operator-gated, costs credits) for the LLM.

### D. Anything else (PM additions)
- **Manual heat/fan override (operator decision).** Tonight proved minimal-UX gives no
  lever when control is wrong. D35 makes control deterministic + correct, which lowers the
  need; but a manual override is the human safety net for the unforeseen. Recommend a
  **guarded manual override** (operator can take a lever; it still passes safety) as a
  small follow-up, decoupled from the appliance-UX principle. Operator ratifies.
- **Model decision.** gpt-4o for any retained LLM judgment (proven). Keep config-swappable.
  Note: under (a) the model barely matters; the rules carry the roast.
- **UI cluster:** #217 (scaling), #219 (clock), #220 (DTR) ship together as the
  "observability" slice — the operator must *see* what the deterministic controller is doing.

---

## 5. Sequencing (D35a — priority: get to a successful FIRST ROAST, operator 14 Jun)

The priority is a successful first roast. The roast design is **option c**: deterministic
PRE-FC, and the **post-FC LLM control loop POST-FC** (it is part of the first roast, not a
deferred add-on). The reason attempt 3 failed post-FC was missing context, not "an LLM
cannot do this", so the build supplies the context the model lacked and gates it. The
deterministic n8n thresholds become the post-FC **safety box / execute-or-not rules**, not
a replacement for the LLM. "Fastest path" means minimal scope to a *good* roast, not LLM-off.

**Critical path to the first roast (do in order):**
1. **#222 — deterministic pre-FC** (heat 100 / fan low, watch FC; advisor not consulted pre-FC).
2. **#223 — post-FC LLM control loop** (from FC: consult every ~5 s; context = bean/env/RoR
   + roast duration + post-FC flag + dev time/%; **the model's own decisions since FC**
   (anti-thrash) + **the objective + a reference curve**; LLM advises → the controller's outer
   loop executes-or-not through the safety box + a coherence/deadband gate). The n8n thresholds
   are the box.
3. **#219 — charge-referenced clock** → correct DTR + roast-duration (inputs to #223's context
   and the drop). Prerequisite.
4. **#224 (replay-harness part only)** — validate the contexted+gated post-FC LLM loop on the
   recorded roasts (does it produce sane, coherent trajectories, not tonight's thrash?) BEFORE
   the live roast.
→ then the supervised roast (clears the **#134** gate).

**Deferred — after the first good roast:**
- **#205** RoR smoothing, **#217** fixed-scale curve, **#220** DTR surfacing (observability),
  **#210/#212** operability (the manual override at the machine covers supervised runs),
  the broader **LLM-eval** + §7.2 training-corpus / outcome-labels work (→ roastpilot-cloud, D29).

The first roast carries the post-FC LLM by design; the replay-harness validation (#224) is the
de-risk before beans, and the safety box + the decision-history context are what make it safe.

---

## 6. Decision-log entry (proposed, for `plan.md` §1 once ratified)

> **D35** — Control path **split at first crack** (14 Jun 2026, operator-decided after the
> attempt-3 baked roast + review of the operator's working n8n dual-loop system).
> **Pre-FC: a deterministic phase control policy** in the controller (heat 100 / fan low to
> FC; the operator's proven n8n decision-tree values, profile-derived) — **the free-form
> LLM advisor is NOT consulted pre-FC.** **Post-FC (development → drop): the LLM advises
> heat + fan + the drop**, because stall risk is low, momentum is established, and the craft
> + fast dynamics live there; **clamped by emergency limits set at start** (bean-temp
> ceiling, ≤196 °C bitter ceiling, emergency-drop >198 °C, fail-closed) and a
> direction-flip deadband (damp thrash, not decisive moves). Model for the post-FC LLM:
> gpt-4o (operator-proven). Supersedes the "better-prompt" advisor work (D33/D34 framing,
> #214, #172); subsumes #209 (pre-FC determinism makes the settle window a no-op); promotes
> #205/#219 to load-bearing (RoR + charge-clock feed the post-FC LLM + drop). Cross-refs:
> #218 (evidence), memory `operator-working-n8n-roast-system`, `operator-hottop-roast-profile`,
> `automated-roaster-minimal-ux`. **The M1 design must keep §7's learning/fine-tuning goals
> open (no painting into a corner).**

---

## 7. Design goals beyond M1 — learning loop + fine-tuning (operator, 14 Jun 2026)

The deterministic controller + post-FC LLM is the **M1 floor, not the ceiling.** Two
forward goals shape the M1 design so we don't paint into a corner:

### 7.1 A learning loop → anticipatory control, pre-FC included
A roaster doesn't only react tick-by-tick; they **plan** the roast for a given bean from
experience, then execute toward that plan. The system should evolve the same way: a
feedback / older-roast learning loop produces a **per-bean target plan** (target curve /
thresholds / charge + drying strategy), and the controller tracks it **anticipatorily,
before first crack too**, not just via static rules. The operator's "max heat / low fan
until browning" is the *default* drying strategy; learning can refine it per bean (a
denser / higher-grown bean wants a different ramp).

**M1 must therefore make the control PARAMETERS, not constants:**
- The pre-FC lever policy + the post-FC thresholds (drop window, DTR target, ramp shape)
  are **profile / parameter-driven**, resolvable from a *plan object* the learning loop can
  later supply. M1 ships sensible defaults (the operator's proven values); the *interface*
  must accept a learned plan.
- Leave room for a **target-curve input** the controller tracks (anticipatory), not only
  threshold reactions. The deterministic policy is the degenerate case (no learned plan).
- The learning / feedback brain lives in **roastpilot-cloud** (D29 — profile / feedback
  learning deferred there). The *agent* must emit the data it needs and accept the plan it
  returns; this plan must not contradict that split.

### 7.2 Roast logs as a training corpus → eventual fine-tune
With enough roasts, **train / fine-tune a model from the logs** (a roast-control model
and / or a better drop / anomaly model). The §C test-harness data and the **training
corpus are the same asset**, so design data collection for ML from the start:

- **Completeness + structure:** every roast persists the full tick stream (telemetry, RoR,
  lever commands + who issued them, safety verdicts, advisor decisions, phase events, FC).
  The agent SQLite trace already does most of this; formalise the export.
- **Outcome labels are the missing piece.** Capture the **operator rating + cup notes +
  drop / DTR outcome per roast** (the supervised label). Without outcome labels the corpus
  trains "what we did", not "what was *good*". Highest-value new data work; ties to the
  cloud feedback loop (7.1).
- **Versioned, anonymised, exportable** fixtures (the bake-off set is the template:
  `alog_to_fixture.py`, `artisan-NN`, gitignored). Add the live SQLite traces + the n8n
  history → one growing, labelled roast dataset usable for both replay-eval and training.
- **Swappable control brain:** the "decide levers / decide drop" component is an interface
  (rules → LLM → fine-tuned model) so a trained model can later own more of the loop without
  re-architecting.

**Net:** M1 = deterministic controller + post-FC LLM, but built on (i) a parameterised
plan interface and (ii) an ML-grade, outcome-labelled log / export. Those two make the
learning loop and the eventual fine-tune **additive, not a rewrite.** Cross-refs:
roastpilot-cloud plan, D29 (feedback-learning deferred to cloud), §C (test harness =
training corpus), memory `artisan-roast-logs-dataset`, `advisor-bakeoff-harness`.
