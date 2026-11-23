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
2. **Control toward the planned finish starts at the anchor.** With target development fraction p and drop target temperature BT_target from the saved profile, the planned finish is T = F / (1 − p) seconds after charge. From the anchor's activation, heat (and fan, secondarily) is steered so BT arrives at BT_target at T. This finish-tracking law replaces the fixed 65% late-Maillard trim latch and the post-FC never-add-heat cap while it is enabled.
3. **An observed first crack is evidence, not a control switch.** The operator mark and MCP audio are recorded for the debrief and for scoring. If the first observed FC (subject to #1116's plausibility floor) differs from the frozen anchor by more than a re-anchor threshold, the anchor moves to the observed time once and the plan is recomputed (owner answer 2b). A smaller difference is logged and ignored.
4. **Drop at the target temperature.** The automatic drop fires when indicated BT reaches BT_target, whatever the development percentage (owner answer 3a, as a safety measure). Development percentage is delivered approximately by the trajectory, not waited for. If T passes with BT short, the roast continues to BT_target under the 196°C guard.
5. **Independent protections are unchanged and always armed.** The 196°C ceiling guard acts on bean temperature from charge confirmation onward, independent of any FC event. The operator's Drop Beans and Emergency Stop work in every phase that allows them today. Every roaster write still passes `SafetyPolicy`; the advisor stays advisory-only.

## Design (starting hypotheses, all config)

- **Estimator (owner direction, 23 Nov: room temperature helps).** FC ETA from a small physical (two-node bean/environment) model whose inputs include the live room temperature from the ambient probe, plus the heat and fan actually applied. Its constants are fitted to the 15 summer roasts that recorded room temperature (23.1–31.6°C, June to August 2026), validated leave-one-out against the five-sample and 30 s slopes, and checked on the 7 Nov trace at an assumed 19.5°C. Winter (19–20°C) sits 3–4°C below the fitted range, so the first winter roast is also the first winter calibration point. If the room reading is missing or stale, or the model is unavailable, the ETA falls back to a least-squares slope over the last 30 s of bean samples toward `first_crack_target_bean_temp_c` (176°C), and the fallback is logged. Invalid or missing samples keep the previous estimate and never start control.
- **Anchor window.** Provisional from BT ≥ 155°C with a valid ETA ≤ 120 s; frozen when ETA ≤ 45 s or BT ≥ 171°C, whichever first. Re-anchor threshold 30 s.
- **Finish-tracking law.** Required rate r* = (BT_target − BT) / (T − t), in °C/min, recomputed each control tick. To respect thermal lag, the comparison uses BT projected forward by a lag horizon (initially 30 s, from the 25–35 s Hottop lag). Heat moves in bounded steps toward closing (RoR − r*), with a floor (25%), a ceiling (100%), a per-tick step limit and the existing rate limits. Heat may rise again after a cut, within those bounds. Fan stays at the configured base (30%) and is used only when heat is at its floor and RoR still exceeds r*; a fan rule for the cold room is not yet evidenced.
- **Phases.** RoastPhase is unchanged. DEVELOPMENT still begins on the observed FC per `first_crack_source` (#1116), for the operator-facing phase and the recorded development clock. Finish tracking runs across pre-FC and development regardless of that phase edge.
- **Advisor.** While finish tracking is enabled, the advisor cannot move heat or fan; its development-phase output remains advisory text and its drop recommendation remains coherence-gated and earlier-only.
- **Flag.** `finish_control.enabled`, default off. `roast-live.sh` gains a launch switch, and the banner prints the resolved state.

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
2. **Estimator and anchor, observe-only.** First an offline fit study (research output, its own PR): the room-temperature model fitted to the 15 summer roasts, leave-one-out errors against both slopes, and the 7 Nov replay. Then the chosen estimator with its 30 s slope fallback, and the anchor tracker with freeze and re-anchor, logged and exposed in the trace; no actuation change.
3. **Finish-tracking law and temperature-led drop**, behind `finish_control.enabled`. Mandatory `safety-reviewer`.
4. **Rehearsal.** Normal service over simulated USB/audio with the matched winter two-node simulation (sensitivity only; the model is uncalibrated), plus the summer replays, scored as above.

Then the owner's cold check, and a supervised roast with `finish_control.enabled` and Drop Beans to hand.

## Not decided here

The numeric thresholds above, any fan rule for the cold room, the D96 retirement, the host receipt-age limit and live GO all stay open.
