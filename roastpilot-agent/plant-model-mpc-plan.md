# Learned Plant Model → Predictive (MPC) Post-FC Control (proposed D102)

**Status:** PROPOSED as **D102** (18 Jul 2026, operator + lead). Operationalises the
**process-model half** of the D42 learning loop (`ml-learning-loop-plan.md` §2.3 —
"MPC-family needs a process model"). D42's target-curve half answers *what trajectory
to aim for* (a learned per-bean ideal); this answers *how the machine responds* so a
controller can hit any target anticipatorily. Data- and hardware-gated; ship-disabled
until validated, exactly like D88/D96.

Motivation is on record from the 18 Jul Brazil-Santos roast: the advisor dropped ~7 °C
early (bean 188 °C while its rationale claimed "reached 195 °C") — a decision made on a
*felt* sense of the trajectory, not a projected one. Today only ONE genuine RoR
projection exists in the system: the pre-FC FC-ETA (`#229`, an RoR extrapolation) that
triggers the late-Maillard trim. The post-FC taper (D88) is reactive (declines from the
measured engagement RoR on a clock); the drop anchor is threshold-based; the advisor
under c3 does not project. The Hottop's ~25–35 s thermocouple lag + ~12–21 s FC-audio
lag mean acting on *current* RoR is acting on stale data — projection is the only
principled lag compensation. This plan builds that projection as a learned forward model.

**Distinct from the parked reference-curve feature (#567).** That learned "what a good
roast looks like" (bean-specific outcome shape; parked 18 Jul — inert data, fragile
prose, small bean-varying corpus). This learns "how the machine responds" (heat/fan →
RoR), which is roughly **bean-invariant machine physics** and therefore transfers across
sessions — the reason cross-session training is defensible here where it was not for #567.

---

## 1. The data (fully specified)

The whole ladder rests on the data, so it is pinned here. **Two corpora, ONE plant**
(operator-confirmed 18 Jul: same Hottop, same room).

### Corpus A — Artisan `.alog` history (47 roasts, ~41.5k samples)
- Path: `~/Library/Mobile Documents/com~apple~CloudDocs/roasting/*.alog`.
- Parser: existing `roastpilot-agent/scripts/alog_to_fixture.py` (`load_alog`, mark +
  event decode). Format = `ast.literal_eval`-able dict.
- Fields (verified across all 47, 18 Jul):
  - `timex` — seconds from record start (~1 Hz; median 865 samples/roast).
  - `temp2` — **BT (bean temp)**, fully populated.
  - `temp1` — **ET (env temp)**, fully populated in all 47 and NOT a duplicate of BT
    (0 files where they match) — a genuine second series. (Corrects an early operator
    assumption that ET was absent; what is genuinely absent is *ambient/room* temp.)
  - `specialevents` / `specialeventstype` / `specialeventsvalue` — the **control track**:
    type `3` = Burner/heat, type `0` = Air/fan. EVENT setpoints (7–44/roast) → forward-fill
    to a continuous per-tick series (the parser decodes setpoints).
  - Charge / first-crack / drop marks = indices into `timex`.
- **Lacks:** ambient/room temp (the Yocto probe, `#342`, is a RoastPilot-only recent add);
  RoR (derive from BT); phase/dev (derive from marks).

### Corpus B — RoastPilot store (26 completed roasts, ~18k samples)
- Path: `~/roasts/roastpilot.sqlite3`, table `telemetry_snapshots`. **READ-ONLY** — copy the
  file or open `mode=ro`; never open the operator's live DB read-write (bake-off #578 lesson).
- Fields per tick: `bean_temp_c`, `env_temp_c`, `heat_level_percent`, `fan_level_percent`,
  `bean_ror_c_per_min`, `env_ror_c_per_min`, `development_percent`, `agent_phase`,
  `charge_elapsed_seconds`; `roast_runs` for marks + `operator_rating`; ambient triad
  (Yocto, store-only).

### Combined + future
- **~73 roasts / ~60k samples**, 1 Hz, one plant. Comfortably enough for a low-order ARX or
  grey-box; enough to test a small ML comparator honestly; **not** enough for deep nets yet.
- **Future landing zone: Snowflake `roast_telemetry` (D97, live via D99 — Azure UK South).**
  As new roasts sync (M2/C1), the corpus grows in Snowflake, which becomes the durable
  feature store. Near-term Phases 1–2 run against the local combined corpus; the pipeline is
  designed so Snowflake is a drop-in source once populated.

### Unified feature schema (per tick, charge-referenced `t`)
`t, BT, ET, heat, fan, RoR_bean (= smoothed dBT/dt), RoR_env, phase/dev, marks`. Model
features: BT-RoR autoregressive lags; a **heat history window spanning the dead-time**
(the term that captures "heat move → delayed RoR"); fan history; **time-since-last-heat-change**
(transient position); a **pre/post-FC exotherm indicator** (regime change at FC).
Targets: RoR_bean at **t+20 / t+30 / t+40 s** (past the lag; multi-horizon).

### Known data gaps + handling (load-bearing)
- **Calibration alignment (Artisan BT ↔ current MCP BT).** Operator does not know if it
  matches; **resolve empirically in Phase 1 step 1** by comparing BT landmark distributions
  (dry-end ~150 °C, FC, drop). Offset → subtract or keep corpora separate.
- **Ambient absent from Artisan.** Do NOT backfill upfront (weak second-order covariate;
  indoor≠outdoor is lossy ±3 °C; mixing measured + estimated confuses the model). Gate: run
  core model without ambient (all 73), then test *measured* ambient on the 26 that have it;
  only if it earns its keep, backfill the Artisan set from historical weather (timestamps are
  in the filenames; Open-Meteo, free; pressure backfills cleanly, temp/RH are heating-confounded).
- **Bean features (mass, density, moisture).** Charge mass is available; density + moisture
  are NOT captured (schema gap, cf. bean-similarity note) — a Phase-2 dependency if bean terms matter.
- **Excitation.** The model only learns responses it has seen; smooth roasts teach little.
  First thing Phase 1 checks; if under-excited, deliberately vary control on a few future roasts.

---

## 2. The pipeline

```
.alog (47) ──parse/forward-fill──┐
                                 ├─► unify to per-tick schema ─► calibration-align ─►
store sqlite (26, read-only) ────┘        (1 Hz, charge-ref)     (Phase 1 step 1)

  ─► feature-engineer (RoR derive, lagged windows, exotherm indicator)
  ─► [near-term] local numpy fit      [durable] Snowflake roast_telemetry feature store (M2/D97)
  ─► model train/eval (leave-one-roast-out CV, multi-horizon, vs baseline, counterfactual)
  ─► [Phase 4] MPC rollout in the replay/sim harness
  ─► [Phase 5] deterministic MPC controller (replaces/augments D88 taper), hardware A/B
```

Snowflake (M2) is the **substrate** (feature store + analysis surface), not the model. Phase 0
is part of the live M2 telemetry-sync work; Phases 1+ are its first analytical consumer — which
usefully shapes the `roast_telemetry` schema around a concrete downstream need.

---

## 3. Phases (cheap-first, data-gated — complexity follows the corpus)

- **Phase 0 — Data foundation.** Land per-tick telemetry in Snowflake (M2/D97); define the tidy,
  clock-aligned feature table (mind telemetry=run-relative vs events=absolute-monotonic — rebase
  before joining or every lag feature is wrong). *Gate:* corpus queryable with clean units + aligned clocks.
- **Phase 1 — ARX feasibility (RUNNING, 18 Jul).** Low-order linear ARX on the combined 73 roasts;
  multi-horizon RoR prediction (t+20/30/40) under leave-one-roast-out CV; beat a naive
  persistence/extrapolation baseline; the decisive **heat-step counterfactual** (predict the RoR
  response to a heat change). *Gate:* good enough at control horizons → proceed; else grey-box; else more data/excitation.
- **Phase 2 — Refinement + regime + bean/ambient features.** Grey-box thermal model or separate
  pre/post-FC fits; add charge mass (+ density/moisture once captured); test *measured* ambient on
  the 26; gradient-boosted-tree comparator; **uncertainty bands** (needed for safe control). *Gate:*
  validated forward model with quantified accuracy + confidence.
- **Phase 3 — Deep learning (data-gated, not calendar-gated).** Sequence models (TCN/LSTM/small
  transformer) only once the corpus is large + varied. *Gate:* beats the ARX/grey-box baseline on
  held-out multi-step by a real margin (a perfect small-set score is a warning — the house rigor bar).
- **Phase 4 — MPC in simulation.** Forward model as the plant; roll out candidate control moves per
  tick, pick the one tracking the target RoR/temp trajectory (D42's learned target curve when
  available; a fixed setpoint until then). Validate in the replay/sim harness. *Gate:* beats the D88
  taper in sim without violating safety bounds.
- **Phase 5 — Supervised hardware validation.** Hardware A/B vs the taper, operator-supervised,
  tasting sign-off, ship-disabled until it passes.

---

## 4. Architecture guardrails (non-negotiable)

- The **controller owns the loop**; the MPC is deterministic controller code (an upgrade path for
  the D88 taper). The **advisor stays advisory-only** — the plant model never hands it write tools.
- **Every roaster write still passes safety policy.** MPC output is clamped into the same box.
- **Ship-disabled + hardware-gated**, like every control change (D88/D96). No default-on before a
  supervised A/B + tasting.
- Route any Phase-4/5 controller change through `safety-reviewer`.

## 5. Honest caveats
- Data volume caps model class: ARX/grey-box now, DL only when earned.
- Thermal lag needs a *dynamic* model (history, not a snapshot); a static regression fails.
- FC exotherm is a regime change; handle explicitly.
- Excitation is the silent killer; check it before trusting any fit.
- Calibration + ambient handled as above.

## 6. Status
- **Phase 1 feasibility running (18 Jul)** against the combined 73-roast corpus — verdict pending
  (calibration finding + multi-horizon RMSE-vs-baseline + heat-step counterfactual → GO/NO-GO).
- Tracking issue: **roastpilot-agent#580** (mirrors this plan; the phased checklist lives there).
