# D239: Anchored finish control for the winter roast

Status: owner direction, 23 Nov 2026 (Sertan, in session). This decision sets the control model; the numbers below are starting hypotheses to validate on replay and simulation, not tuned values. No hardware action, installation or live GO is authorised here.

## Why

The only winter roast that charged beans (7 Nov 2026, Brazil Santos 250 g, room about 19–20°C, ordinary AUTOMATIC `serve` route) missed its 195°C / 14% recipe:

- The pre-FC trim cut heat 100→65% at charge +7:02 (BT about 157°C) on an ETA of 43 s to 176°C. Reaching 176°C took 124 s. The ETA is a five-sample slope (`roast_history.py`, `min_samples=5`), and the trim latches until FC.
- Audio missed FC. The operator marked at +11:17.7, about 189°C, possibly late.
- Post-FC, D88's never-add-heat ceiling capped heat at the 65% trim entry, and the PI deadband moved it only to 61%. RoR stayed 6–7°C/min.
- The 196°C ceiling guard dropped at +12:12: 54 s of development, 7.43%.

Sources: Career `november-roast-audit.md` and `eta-pi-response-audit.md`. The audit replay found a 30 s slope window cut median ETA error from 20.8 s to 7.3 s.

Today's design treats the observed FC (audio or mark) as the moment that changes the control law. In a cold room that moment arrives late and uncertain, and the heat decisions that decide the finish have already been made. The owner's direction is to anchor control on the anticipated FC instead.

## Decision

1. **The anticipated first crack is the control anchor.** The controller estimates the FC time F from the bean curve and RoR. The anchor is provisional and updates every control tick from when the estimate becomes trustworthy until a freeze point, then it is fixed (owner answer 1b).
2. **Control toward the planned finish starts at the anchor.** With target development fraction p and drop target temperature BT_target from the saved profile, the planned finish is T = F / (1 − p) seconds after charge. From the anchor's activation, heat (and fan, secondarily) is steered so BT arrives at BT_target at T. This finish-tracking law replaces the fixed 65% late-Maillard trim latch and the post-FC never-add-heat cap while it is enabled. **Amended 23 Nov (owner): the law is predictive.** Each control step it simulates candidate heat levels forward through the thermal lag with the two-node model, corrected online from this roast's own history, and picks the level that lands BT at BT_target at T. So heat rises when the finish is running late and backs off early when it is running hot.
3. **An observed first crack is evidence, not a control switch.** The operator mark and MCP audio are recorded for the debrief and for scoring. If the first observed FC (subject to #1116's plausibility floor) differs from the frozen anchor by more than a re-anchor threshold, the anchor moves to the observed time once and the plan is recomputed (owner answer 2b). A smaller difference is logged and ignored.
4. **Drop at the target temperature.** The automatic drop fires when indicated BT reaches BT_target, whatever the development percentage (owner answer 3a, as a safety measure). Development percentage is delivered approximately by the trajectory, not waited for. If T passes with BT short, the predictive law keeps raising heat within its bounds, with the lag and this roast's history guiding the step, until BT reaches the target; the 196°C guard still bounds it. If BT reaches the target with development more than 4 percentage points under target, the drop still fires and a `SAFETY_ALERT` records the shortfall for the debrief (owner, 23 Nov).
5. **Independent protections are unchanged and always armed.** The 196°C ceiling guard acts on bean temperature from charge confirmation onward, independent of any FC event. The operator's Drop Beans and Emergency Stop work in every phase that allows them today. Every roaster write still passes `SafetyPolicy`; the advisor stays advisory-only.

## Design (starting hypotheses, all config)

- **Estimator (owner decision, 23 Nov, after the offline fit study).** The anchor uses a least-squares slope over the last 30 s of bean samples toward `first_crack_target_bean_temp_c` (176°C), replacing the five-sample slope. Leave-one-out over the 15 summer roasts with recorded room temperature (23.1–31.6°C) gave a median error at 120 s before 176°C of 54 s early for the five-sample slope, 14 s for the 30 s slope and 7 s for a fitted two-node bean/environment model. On the 7 Nov trace at the trim moment (observed 124 s to 176°C), the predictions were 43 s, 125–131 s and about 148 s respectively. The room term moved the model by only about 0.5 s/°C, and its fitted constants were poorly identified across folds. So the two-node model, with the live ambient probe reading as an input, runs in **shadow** for the anchor: it is logged every second and does not set the anchor. **Amended 23 Nov (owner):** the same model, with an online correction (below), drives the finish-tracking law's heat choice; the anchor itself stays on the 30 s slope. The choice is revisited after the first winter roast, which is also the first winter calibration point. Invalid or missing samples keep the previous estimate and never start control.
- **Anchor window.** Provisional from BT ≥ 155°C with a valid ETA ≤ 120 s; frozen when ETA ≤ 45 s or BT ≥ 171°C, whichever first. Re-anchor threshold 30 s.
- **Finish-tracking law (predictive, amended 23 Nov).** Every control cadence (5 s) the law takes the current smoothed BT/ET, the replayed heater state and the room reading, and simulates a small set of candidate heat levels (current, and current ± one or two step limits) forward with the two-node model to T. It picks the candidate whose predicted BT at T is closest to BT_target, so thermal lag is handled by the simulation rather than a fixed look-ahead. Heat stays within a floor (25%) and ceiling (100%), moves at most one step limit per cadence, and obeys the existing rate limits; it may rise again after a cut.
- **Online correction from this roast.** The fitted constants come from summer roasts and are poorly identified, so each cadence the law compares the model's prediction from about 60-120 s earlier with what BT actually did, and updates a bounded gain-and-offset correction (a small recursive estimate). The correction is reset per run.
- **Fallback.** If the room reading is missing or stale, the correction leaves its bounds, or the recent prediction error is too large, the law falls back to rate-of-rise feedback: r* = (BT_target − BT_projected) / (T − t − h) with h the 30 s lag horizon, closed by bounded heat steps. Every step logs which law drove it.
- **Fan.** Stays at the configured base (30%) in slice 3; a cold-room fan rule is not yet evidenced and the fitted model cannot identify fan.
- **Before the anchor.** With the law enabled the fixed late-Maillard trim never arms; heat holds the flat pre-FC level until the anchor exists (owner, 23 Nov).
- **Resume.** Resuming a roast is not supported in this workflow (owner, 23 Nov). The law never re-engages after recovery; the safe default stands (no automatic heat, the advisor cannot move levers, drops and the guard stay armed).
- **Never on a drop tick.** No heat increase on a tick where the 196°C guard or the target drop is due.
- **Phases.** RoastPhase is unchanged. DEVELOPMENT still begins on the observed FC per `first_crack_source` (#1116), for the operator-facing phase and the recorded development clock. Finish tracking runs across pre-FC and development regardless of that phase edge.
- **Advisor.** While finish tracking is enabled, the advisor cannot move heat or fan; its development-phase output remains advisory text and its drop recommendation remains coherence-gated and earlier-only.
- **Flag.** `finish_control.enabled`, default off. `roast-live.sh` gains a launch switch, and the banner prints the resolved state.

- **Amended 27 Nov (D242, owner):** the anchor's default target is `fc_anchor.first_crack_bean_temp_c`, 180°C, no longer the 176°C trim trigger. The #1138 study measured a median 182°C crack on the agent's summer runs (trim schedule), and the operator's flat-burner Artisan roasts cracked at a median 178°C; the finish law holds 100% heat before the anchor, so 180°C hedges between the two. The freeze point moves with it to 175°C. A per-bean `first_crack_bean_temp_c` still wins. With the law enabled, a drop target at or above the 196°C guard keeps the law off, and the run now says so once from charge (`finish_disabled_target_at_guard`).

## Scoring every comparison

For each replay, simulation or roast, report:

- indicated BT at the planned finish T (from the anchor in force);
- development percentage when BT_target was first reached, measured from the anchor and, separately, from the first observed FC;
- the frozen anchor, any re-anchor, and the observed FC times;
- every heat/fan command that reached the simulated USB (or the roaster), with the reading that caused it.

## Relationship to earlier decisions

- **D35 / D88 / D96.** The phase split stays. With finish tracking enabled, D88's taper cap and the fixed trim latch are bypassed, and D96's bounded recovery is subsumed by the tracking law's bounded raise. With it disabled, D88/D96 behave exactly as today.
- **D84.** The deterministic drop becomes temperature-led when finish tracking is on: development percentage is reported, not required.
- **D230 / D238.** Those govern the HUMAN-authority route, which is parked for this roast. D239 governs the ordinary AUTOMATIC route. D238's rule that the human mark is canonical for development timing does not apply to the AUTOMATIC route under D239; the mark is evidence and a re-anchor input.

## Delivery plan (Agent repo, one PR per slice)

1. **#1116 (in flight).** Operator-only FC source, mark plausibility floor, 196°C guard from charge under `operator_only`.
2. **Estimator and anchor, observe-only.** First the offline fit study as research output in its own PR. Then the 30 s slope estimator, the shadow two-node model, 1 Hz telemetry logging for calibration, and the anchor tracker with freeze and re-anchor, logged and exposed in the trace; no actuation change.
3. **Finish-tracking law and temperature-led drop**, behind `finish_control.enabled`, in four PRs: (a) closed-loop two-node plant harness and scorer, including a mismatched-plant mode (plant constants from the leave-one-out fold extremes) so the online correction is tested against a model that is wrong; (b) the pure predictive tracker with online correction and feedback fallback; (c) controller wiring, bypasses, temperature-led drop and alerts; (d) launcher switch, banner and the scored closed-loop comparison against today's controller. Mandatory `safety-reviewer` on (b)-(d). The closed-loop simulation proves control logic and lag handling, not real-world accuracy; the first winter roast is the real test.
4. **Rehearsal.** Normal service over simulated USB/audio with the matched winter two-node simulation (sensitivity only; the model is uncalibrated), plus the summer replays, scored as above.

Then the owner's cold check, and a supervised roast with `finish_control.enabled` and Drop Beans to hand.

## Not decided here

The numeric thresholds above, any fan rule for the cold room, the D96 retirement, the host receipt-age limit and live GO all stay open.
