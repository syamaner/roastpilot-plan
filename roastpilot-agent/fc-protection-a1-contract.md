# A1 contract: human-mode protection, dispatch and recovery (Agent #1076)

**Status: proposed for owner approval, not ratified.** This is the lead-consolidated story-planner contract, with the six recorded defects corrected on 11 November 2026. It supersedes both draft versions for review. No implementation, admission or hardware-readiness claim follows from it. The source bindings below remain unchanged; fresh bindings and the ratified body hash are required before each slice.

## 0. Bindings, provenance and gates before delegation

| Binding | Value (as supplied by the orchestrator) |
|---|---|
| Implementation base (Agent) | `1a9c27118ab804d64a564e75158072b758f3b898` (the read-only planning tree; never the implementation tree) |
| Plan repository | `9fe71dc2a604fea85b16ae5a643d2d145f512584` |
| MCP producer (inline evidence only) | merge `58197aa2e28944d359487d4932b8c81f79a8cdc1`, tree `9fcf1e9741a106b13f6f1ba6cbaf48d0d74678d0`, reviewed head `e28153c1732b243a80079395a56efff12e23f51c` |
| Issue | Agent #1076. Author `syamaner`, `OWNER` (checked against the API by the parent). Body SHA-256 `48a60e43f3a22234c90757d02d71d2779a929cf8c52c2e0d35657a88519a472b`. No comments. |
| Registry | `docs/state/registry.md`. Active epic E11 (`docs/epics/E11-packaging.md:195-201`). E11 has no D230 row, and **A1 does not claim or change E11-S3 or #954.** |
| Plan anchor | `roastpilot-agent/fc-protection-d230.md` (clauses at 42-91, stale-reading clarification at 99-123, pre-endpoint recovery clarification at 125-150, architecture gate at 165-199) and `roastpilot-agent/fc-protection-stories-d230.md:34-42` (A1 body) and `:140-238` (criteria) |
| Planner launch | An ordinary native invocation. The owner relaxed the CLI pin once (CLI 2.1.322). **D219 confinement is not claimed**, so the lead must check the tool transcript for reads outside the tree. The initial run stayed within the packet file list; the second run's nine-file Grep deviation is disclosed in §10. The final wording includes lead corrections and the roast agent's bounded producer check. |

**Gates before delegation (they fail closed):**

1. **G0-a.** The lead confirms that Plan `9fe71dc` contains the verified merge of Plan PR #101, so D230 is in effect. The issue body binds an earlier prepared revision `d0aef5f…`, and the D230 file at this SHA still carries draft-effectiveness prose (`fc-protection-d230.md:3-5`, `:152-157`). If this cannot be confirmed, stop.
2. **G0-b.** The owner ratifies this exact consolidated contract, including the human-only fixed-zero/fan trade-off and the four-slice PR plan. There is no alternative permitting ordinary human-mode resends. Before implementation, adopt the approved PR-plan refinement into the Plan story file; the prepared amendment is separate and unmerged.
3. **G0-c.** Each slice is re-provisioned off updated `main`, and its citations are re-checked there. The issue body, comments and watermark are refreshed per slice.

---

## 1. Acceptance criteria

The issue body is maintainer-authored (`OWNER`). The numbered criteria below reproduce its requirements; AC-common is an abridged quotation. The complete issue snapshot and body hash remain authoritative. A1 owns criteria 4, 5, 7, 8 and 11. It owns the latch boundary of 10 and its own scope within 12 (stories file `:132-138`). Sub-items carry IDs so tests can be mapped to them.

**AC-common.** "All stories inherit the eight clauses, source bases and architectural boundaries in D230 … Tests must fail causally when the corresponding guard is removed or inverted. No controller or transport behaviour is proved by document preparation. Safety/controller/recovery/runtime capability changes take SAFETY_CRITICAL: full unfiltered native validation, statics, boundary contracts, mandatory independent safety review and other triggered lenses."

**AC-4.** "A1 handles below/equal/above threshold, charge/phase/freshness combinations and same-tick confirmed charge without storage ahead of urgent action. Calling current `_apply_phase_rules` first is insufficient because it awaits storage. Include accepted-temperature stalls while session time/raw packet counts advance, counter resets/wrong types and ignored/error/unit-invalid readings. Non-finite BT or ET is invalid and cannot count as fresh evidence. With valid eligibility, admit one safety-evaluated compound drop with no model/DTR/advisor/dwell gate; record interrupted/unmet target, not success. Each gate independence and one-dispatch guard needs a causal mutation test. Invalid/stale temperature evidence inhibits routine heat/fan and enters recovery; it cannot admit a new protective drop. Existing endpoint latch and no-heating-resume persist. If freshness fails before actual drop dispatch, withhold it and show operator intervention/reconciliation. Freshness restoration alone cannot dispatch the pending drop. Test stale-before-admission, stale-between-admission-and-dispatch, recovered-freshness, issued/unknown drop, and the separately eligible operator disposition. Never retry an issued/unknown drop. Fixed-zero remains subject to clause 4; independent emergency intent remains available. If no endpoint was admitted before freshness loss, recovered readings alone neither resume routine heat/fan nor admit an automatic drop from recovery. Require explicit operator reconciliation through safety. For an eligible continued roast, restore the control phase only through that action and evaluate fresh BT >=196°C protection before any routine heat/fan dispatch. Unknown command disposition or endpoint history blocks continuation. Test fresh recovery below/equal/above 196°C, no operator action, failed reconciliation, and independent emergency intent. An admitted-endpoint latch continues to forbid heating resume."

Sub-items:

| ID | Requirement |
|---|---|
| 4a | Threshold is inclusive: below does not fire, equal fires, above fires |
| 4b | The run must be charged |
| 4c | Phase must be pre-FC or development |
| 4d | Freshness rules |
| 4e | Same-tick charge |
| 4f | No storage before the urgent action |
| 4g | Accepted-stall / reset / type / ignored / non-finite cases |
| 4h | One compound drop through safety, with no model, DTR, advisor or dwell gate |
| 4i | Outcome recorded as interrupted/unmet |
| 4j | Stale evidence goes to recovery and cannot admit a drop |
| 4k | A drop withheld when dispatch-time freshness fails |
| 4l | Recovered readings do not dispatch |
| 4m | No retry of an issued or unknown drop |
| 4n | Before any endpoint: recovery, then explicit reconciliation, then protection evaluated before any routine write |
| 4o | Unknown history blocks continuation |
| 4p | The endpoint latch forbids heating resume |
| 4q | Emergency stays available |

**AC-5.** "A1 fences every queued/new routine heat/fan/drop path, joins operator/legacy endpoint requests, preserves emergency admission and records in-flight intervals." Sub-items: 5a fence; 5b join; 5c emergency; 5d intervals.

**AC-7.** "A1 treats MCP local timeout as remote-unknown. Selected-SDK real-stdio tests reproduce sync blockage and async controls; no false preemption/settlement claim."

**AC-8 (A1 share).** "A1/C perform no automatic retry from the unproven reservation-conflict category; no unknown-result retry or automatic redrop. Resolve interaction with existing safety heat-off retries explicitly before contracting. A material safety/behaviour change or conflict with ratified no-resend policy returns to the owner; source proof that existing independent emergency semantics remain unchanged does not itself require a new product choice. Unknown drop/containment results cause zero reconnect, child-restart or new-session escape attempts. Emergency remains callable; remote service/physical success are separate claims." The heat-off retry interaction is resolved as RD-1 (§9), which the owner must ratify.

**AC-10 (latch boundary only).** "Post-endpoint new notes never change phase/DTR or cancel protection; model detections never do so." Reconciling the canonical human mark belongs to C and is not in A1.

**AC-11.** "Restart/fault/recovery cannot replay heat/drop or auto-resume. UI projects server authority, unknown durability/actuation and operator intervention, without asserting physical cooling from command-state fields. Operator disposition must not require heating resume or bypass exact-session, charge, fresh evidence and known prior-drop state, all through safety evaluation. In the approved stale-reading disposition path, missing fresh evidence makes software operator drop unavailable; expose physical intervention/reconciliation. Independent emergency authority is unchanged. Test blocked restart persistence. An unknown possible prior drop refuses another software drop, exposes unknown outcome and requires physical operator intervention/reconciliation. Show that existing emergency fallbacks may stop the drum and close the chute; never present emergency admission or RPC completion as physical evacuation proof."

**AC-12 (A1 scope).** "Preserve automatic-mode behaviour and existing MCP mock-only restrictions. Record BT/ET/measured ambient validity/age/placement, batch and initial thermal state, command timeline, human FC, recording continuity and outcome for the later baseline. No recipe-success or hardware-ready claim is made by a mock pass. Invalid/non-finite ambient is recorded as invalid, never a valid measurement."

*A1 evidence scope:* record available BT/ET validity, accepted-reading age/validity, measured ambient value/age/validity, dispatch intervals, endpoint disposition and interrupted/unmet outcome. Absent measurements remain absent; invalid/non-finite values never become valid zeroes. This does not claim all recording/placement/batch/thermal-state inputs are absent from the wider product. A1 adds no new capture input surface.

Probe placement, batch/initial thermal state and recording/shadow continuity remain explicit prerequisites of later candidate qualification. The standalone collector owner and contract remain unassigned; no collector implementation is delegated to A1/A2/C by this contract. A1 completion claims only its share of criterion12 and never the complete next-roast evidence package. Measured room temperature (rather than the reported seasonal19–20°C/25+°C context) and ET must accompany later identification/tuning; no seasonal offset is introduced here.

**AC-D230 (clause-derived, quoted from the Plan).**

- Clause 4: "One reviewed exact-session fixed-zero containment operation may run only when prior ownership is settled and eligibility is proven; it preserves the other commanded actuator bits. The initial new capability has no automatic retry on reservation conflicts."
- Clause 2: "Wrong types, counter reset/epoch mismatch, ignored/error/unit-invalid readings and stalled accepted progress must not look fresh … Do not invent readings or silently fall back to session time."
- Architecture gate: "A newly observed counter must not receive age zero: under valid ordered same-child history, use the previous observation's request-admission time as a conservative acceptance lower bound. Initial/reset/lost history and a long unobserved gap remain unproven; unchanged or ignored samples do not renew freshness. Recheck age at actual dispatch." (`fc-protection-d230.md:186-190`)
- "Driver support uses an explicit versioned capability contract, not driver-name or method-presence inference." (`:171-173`)

**AC-NA (structural).** Human authority is a typed constructor capability on controller/runner, default AUTOMATIC; no config/API/CLI selection is added. Tests construct HUMAN directly. A1 remains non-admitted until A2/C and installed-candidate qualification. The application lifecycle guard below can retain unresolved HUMAN ownership even if a caller attempts to select AUTOMATIC for a new run.

---

## 2. Spec

### 2.1 Current-source facts (all checked at `1a9c271`)

**Runner turn order.**
- `tick_once` (`api.py:1352-1377`) runs `_drain_queue()` at `:1370`, which executes **every** queued operator action, before `controller.tick()` at `:1372`.
- Inside the drain, EMERGENCY_STOP items are sorted first (`api.py:1416`).
- Each ordinary `_dispatch` persists its audit (`record_operator_action` at `api.py:1463`; `_record_dispatch_command` at `:1525`) before the tick.
- Post-tick history comes after (`api.py:1379-1400`).
- An out-of-band emergency route exists at `api.py:1528-1549`.
- The post-durable-End branch is at `api.py:1360-1369`.
- So a latch or `protection_check_pending` set only inside `controller.tick()` cannot protect queued work that is drained earlier in the same turn.

**Telemetry reads.**
- The normal tick reads at `controller.py:2617` and then awaits `persist_snapshot` (`:2623`) and `persist_evaluation` (`:2627`) before `_act_on_safety` (`:2630`) and `_apply_phase_rules` (`:2639`).
- The latched tick reads again at `controller.py:4621`, deliberately bypassing the failure counter (`:4617-4623`).
- The adapter's `read_telemetry` (`mcp_client.py:1502-1514`) captures `now` **after** the `get_roast_state` await (`:1503-1504`). Its `age_seconds` comes from the session clock (`:1505-1508`) and is not the age of an accepted reading.

**Counter source.**
- `RoastSessionState` (`mcp_client.py:276-314`) has no counter fields.
- It carries `device_state: RoasterDeviceState | None` (`:308`), and `RoasterDeviceState.raw_vendor_data: dict[str, EventPayloadValue]` (`:201`) holds them.
- The producer puts `status_packet_count` and `ignored_temperature_packet_count` in `raw_vendor_data` (producer `drivers.py:1097-1098`, from the evidence the lead supplied).
- No production control module (`controller.py`, `safety.py`, `mcp_client.py`, `api.py`) reads them. The only readers are in `cold_characterisation/*`, a separate subsystem that A1 neither reuses nor modifies (§4).

**Drop replies.** `RoasterControlAdapter.drop_beans` returns `None` on a malformed reply (`mcp_client.py:1662-1685`). Callers then adopt and treat the drop as executed (`controller.py:3589-3597`, `:5016-5023`, `:5675-5682`).

**Failed-drop clamp and retries.**
- `_clamp_heat_after_failed_drop` is called at `controller.py:3587`, `:5012` and `:5673`.
- Ordinary fail-safe: `_apply_fail_safe` (`:4426-4483`), retried through `_pending_fail_safe` (`:2602`, `:4564-4578`).
- E-stop retry rule: `:4556`.

**Routine-write choke point.**
- `_run_routine_write` is defined at `controller.py:2511-2534`.
- Its 11 callers are listed in §4 S-1.
- `CommandArbiter.run_routine` rechecks admission before and after every wait (`:208-264`).
- E-stop priority comes from `admit_emergency_stop` and `run_emergency_stop` (`:141-149`, `:266-307`).

**Terminal fault-control drop path.**
- `FaultControlExecutor` maps actions at `controller.py:604` and `:975`, and dispatches DROP_BEANS through `mcp_client.py:1488-1497`. This path does **not** go through `_run_routine_write`.
- The D212 cooling stop goes through `execute_fault_acknowledgement_stop` (`controller.py:2480-2493`), called only from `api.py:1747-1751` (cooling stop only).

**Recovery and resume.**
- `operator_resume` is synchronous (`controller.py:5527-5545`) and is called from `api.py:1665`.
- The transition table is at `controller.py:367-376`.
- The DROP_BEANS row in `COMMAND_PHASE_MATRIX` excludes OPERATOR_RECOVERY_REQUIRED (`safety.py:98-100`).

**Transport.**
- `ToolSession` and `InitializableSession` expose only `call_tool` and `initialize` (`mcp_client.py:1762-1775`).
- Nothing in `src/roastpilot_agent` calls `list_tools`.

**Dependencies.**
- `mcp>=1.0.0,<2` and `pydantic>=2.10,<2.14` (`pyproject.toml:62-63`).
- The dev pin `coffee-roaster-mcp==0.2.4` (`:189`) predates the MCP producer change (M), so it lacks the new tool.
- The producer was proven on Pydantic 2.14.1, which is **outside** the Agent's `<2.14` bound. Producer SDK validation therefore says nothing about the Agent's resolved SDK.

### 2.2 Domain module `src/roastpilot_agent/human_protection.py` (S1; pure; no SDK, storage or UI imports)

All enums are plain `Enum`.

**Authority, write class and freshness enums.**
- `ControlAuthority`: `AUTOMATIC`, `HUMAN`.
- `WriteClass`: `HEAT`, `FAN`, `DROP`, `CONTAINMENT`, `SESSION_START`, `NON_HEAT` (marks, cooling start/stop, D212 cooling stop).
- `ReadingFreshness`: `FRESH`, `STALE`, `UNPROVEN`, `INVALID`.

**`CounterEvidence`.** A frozen dataclass with fields `status: int | None`, `ignored: int | None` and `class_: CounterClass`. `CounterClass` is `PRESENT`, `ABSENT` or `INVALID`.

`extract_accepted_counters(raw: Mapping[str, object] | None) -> CounterEvidence` follows this closed grammar:

| Input | Result |
|---|---|
| `raw is None`, or either key missing | `ABSENT` (absent never means zero) |
| either value not exactly `int` (`type(v) is int`; bool, float and str are rejected) | `INVALID` |
| any value negative, or `ignored > status` | `INVALID` |
| otherwise | `PRESENT` |

**`AcceptedReadingTracker(clock: Callable[[], float], max_age_s: float)`.** `max_age_s` takes the existing `ControllerConfig.max_stale_telemetry_seconds`; no new threshold is added.

`observe(*, child_epoch: int, counters: CounterEvidence, bean_temp_c: object, env_temp_c: object, request_admitted_at: float) -> ReadingFreshness`:

| Condition | Result and history effect |
|---|---|
| counters `ABSENT` | `UNPROVEN`; clear the acceptance bound and previous-observation baseline. This observation cannot seed the next acceptance interval. |
| counters `INVALID`, or BT/ET not an exact finite `float`/`int` (bool rejected) | `INVALID`; clear both acceptance bound and previous-observation baseline. |
| no prior observation for this epoch | `UNPROVEN`; this observation stored |
| epoch differs, status/ignored/accepted decreases, or request-admission time is non-finite, reversed or not strictly ordered | `INVALID`; clear bound and baseline; this discontinuity observation does not seed history. |
| accepted unchanged | no renewal |
| accepted increased and the previous observation is valid, same epoch, and arrived within `max_age_s` | new acceptance lower bound = the previous observation's `request_admitted_at` (**never `now`**) |
| gap since the prior request-admission time exceeds `max_age_s`, regardless of counter change | `UNPROVEN`; clear old bound; retain only the current otherwise-valid snapshot as a new baseline. |

Evaluate discontinuity/invalid/absent/long-gap rows before considering progress. After a reset, the first valid same-child snapshot is only a baseline and remains UNPROVEN; only a later strictly ordered valid snapshot with increased accepted count may establish a new bound from that baseline's request-admission time. Each valid continuous observation, including unchanged counters, becomes the next previous-observation baseline without changing an existing acceptance bound; invalid/absent observations never do. Advancing ignored packets alone never renews the bound. If the baseline exists but no acceptance bound exists, unchanged accepted count remains UNPROVEN. If an established bound exists and accepted count is unchanged, retain that bound and derive FRESH or STALE from its age; never replace it with the latest request time. A finite monotonic now must be >= the bound; otherwise invalidate history. FRESH requires `0 <= now - bound <= max_age_s`; an expired established bound is STALE. Recheck after the response as well as at dispatch, so delayed reads cannot create fresh evidence.

The tracker proves progress of accepted finite pairs, not sensor calibration or backlog age. Producer `drivers.py:1311-1322` increments status for every decoded packet, ignored for invalid pairs, and updates BT/ET only for accepted pairs. Thus `status - ignored` is the accepted-pair count at this producer; absence/reset loses continuity. An ignored-only batch or transport/read error cannot renew it. A failed read is an explicit continuity break, clearing bound/baseline. Non-finite/invalid canonical readings remain INVALID even if counters increase. No cached evidence from before that break is reusable as FRESH.

`recheck() -> ReadingFreshness` re-derives the result from the stored bound at `clock()`. All values are kept in memory for the run only, and are never persisted or compared across restarts.

**Endpoint and command dispositions.**
- `EndpointDisposition`: `NONE`, `ADMITTED`, `IN_FLIGHT`, `ISSUED`, `UNKNOWN`, `WITHHELD`, `HISTORY_UNKNOWN`.
- `EndpointOwner`: `PROTECTION`, `OPERATOR`, `OPERATOR_RECOVERY`, `FAULT_CONTROL`.
- `CommandDisposition`: `SETTLED`, `UNKNOWN`.
- No A1 code path moves `UNKNOWN` back to `SETTLED`. Neither a refusal, a supersession, a respawn nor recovered freshness clears it. Clearing it needs a reconciliation that A1 does not provide (C owns it).

**`ContainmentOutcome`.** `REFUSED_IDENTITY`, `REFUSED_CAPABILITY`, `REFUSED_BUSY`, `COMMAND_STATE_RETURNED`, `UNKNOWN_DRIVER_RESULT`, `UNKNOWN_COMPLETION`, `UNKNOWN_TRANSPORT`, `UNKNOWN_MALFORMED_RESPONSE`, `NOT_ATTEMPTED`.
- `is_unknown` is true for exactly the four `UNKNOWN_*` members.
- `ContainmentReason` is a plain `Enum` mirroring the 16 wire reason codes in §2.5.

**`ContainmentAttempt`.** A per-run state with the values `AVAILABLE`, `CONSUMED`. It is created `AVAILABLE` only when a new run's controller state is constructed (a new `run_id`). It becomes `CONSUMED` synchronously **before** any await on the containment path, and **nothing in the run resets it**: not recovery re-entry, freshness restoration, a refusal, a matching-owner cleanup, a child respawn, a new child epoch, a new MCP session id, `operator_resume`, or `recover_from_restart`.

**Eligibility.** `protection_eligible(...) -> bool` is true iff all of these hold:
- authority is HUMAN;
- the run is charged (already confirmed, or same-tick per §2.4 H2);
- phase is `ROASTING_PRE_FIRST_CRACK` or `DEVELOPMENT`;
- freshness is `FRESH`;
- BT is finite and `>= HUMAN_PROTECTION_BT_C`;
- endpoint is `NONE`;
- command disposition is `SETTLED`.

`HUMAN_PROTECTION_BT_C = 196.0` is a module constant and is not configurable.

### 2.3 Typed safety additions (`safety.py`, S1)

Each evaluator returns a `SafetyEvaluation`. `COMMAND_PHASE_MATRIX`, including the DROP_BEANS row at `safety.py:98-100`, does not change. Any input outside the listed ALLOW set gives REJECT.

- **`evaluate_human_protective_drop(...)`:** ALLOW iff `protection_eligible`.
- **`evaluate_human_reading(*, phase, charged, freshness)`:** in charged active phases, anything other than FRESH gives **RECOVERY**, rule `human_reading_invalid`, with no adjusted heat or fan (the action follows RD-1). Uncharged phases defer to the existing rules.
- **`evaluate_human_recovery_drop(*, phase, session_matches, charged, freshness_at_eval, endpoint, command)`:** ALLOW only when phase ∈ {OPERATOR_RECOVERY_REQUIRED, FAULTED}, the session matches, the run is charged, freshness is FRESH, endpoint ∈ {NONE, WITHHELD} and command is SETTLED. A REJECT names physical intervention.
- **`evaluate_human_continuation(*, target, session_matches, charged, freshness, endpoint, command)`:** ALLOW only when target ∈ {ROASTING_PRE_FIRST_CRACK, DEVELOPMENT}, the run is charged, the requested target agrees with canonical human-FC evidence (no model-derived DEVELOPMENT), endpoint is NONE, command is SETTLED, freshness is FRESH and the exact run/session/child generation matches the explicit operator request. A PREHEATING target is REJECT once charged. Non-heating targets keep today's behaviour.

**RD-3 mapping (an already-ratified clarification, not a new choice; `fc-protection-d230.md:99-123`).** For HUMAN authority in charged active phases:
- the existing stale or missing session-clock rule (`safety.py:322-344`) is mapped to the same RECOVERY disposition;
- MCP read and transport failures keep FAULT.

### 2.4 The human turn (S3, with runner wiring in `api.py`)

This applies only when `authority is HUMAN`. The AUTOMATIC turn keeps its **behaviour**: the same reads, MCP calls, events and persisted records in the same order. Shared signatures change (for example `write_class=`), so the source is not identical.

**H0. Branches left as they are.** The post-durable-End branch (`api.py:1360-1369`) and the out-of-band emergency route (`api.py:1528-1549`) are unchanged.

**H1. Emergency first.**
- Take the queue batch synchronously, with the same run-id filter as `api.py:1407-1415`.
- Dispatch only its EMERGENCY_STOP items, exactly as today (including their audit).
- Dispatch nothing else yet.
- Emergency is more urgent than protection, so its audit may come first. Once an e-stop is admitted, H2 does nothing.

**H2. `await controller.human_urgent_stage()`.** There are **no sink or storage awaits in H2.** Decisions, evaluations and events are buffered in memory and persisted in H4.

1. Return at once if `_emergency_stop_transition_pending` is set or the generation has changed.
2. **One read for the turn:** call `reader.read_human_evidence()`. This is a new adapter method that captures `request_admitted_at = clock()` *before* a single `get_roast_state` await. It updates `_last_elapsed`, `_last_change_monotonic` and `_last_state` exactly as `read_telemetry` does (`mcp_client.py:1505-1509`), and returns `(RoastTelemetry, CounterEvidence, request_admitted_at)`. `CounterEvidence` comes from `extract_accepted_counters(state.device_state.raw_vendor_data if state.device_state else None)`.
3. **Read failures.** If the read raised or returned `None`:
   - outside `TERMINAL_LATCH_PHASES`, it counts once toward the existing failure counter;
   - inside them it bypasses the counter, as `controller.py:4617-4623` does.
   - The read is recorded as failed for this turn, and **no second read happens anywhere in the turn.**
4. `tracker.observe(...)`.
5. **Existing safety precedence before optional protection.** Run the existing typed safety evaluation on this reading without weakening its invalid-input handling or changing hard-limit semantics. An EMERGENCY_STOP verdict takes the existing e-stop path before protective drop. The196guard never overrides an emergency or converts invalid evidence into drop eligibility.
6. **Same-tick charge is computed once, without awaits:** derive the next T0-streak value and event-source verdict from current state and this turn's evidence (`controller.py:4109-4122`). Only if the existing transition and source policy permit charge confirmation may the urgent stage commit the corresponding in-memory charge timestamp/streak and PRE_FC transition, then evaluate protection using that effective phase. The real phase must be eligible before a drop is admitted; `charged=True` alone does not bypass phase policy. Buffer the same event/evaluation for H4, which consumes it rather than incrementing the streak or re-emitting/reconfirming T0. Preserve original canonical charge timing and generation/emergency fences. This is required for a threshold reading on the charge-confirming turn to dispatch before storage; never infer charge from temperature alone.
7. **If protection is eligible:**
   - evaluate `evaluate_human_protective_drop`;
   - set `endpoint=ADMITTED` (owner PROTECTION) **synchronously, with no await between the decision and the latch**;
   - dispatch `drop_beans` through `_run_routine_write(..., write_class=WriteClass.DROP, endpoint_owner=EndpointOwner.PROTECTION)`.
   - The dispatch's `admitted()` re-checks `tracker.recheck() is FRESH` and that the endpoint is still ADMITTED. It moves to IN_FLIGHT just before the operation.
8. **If the reading is invalid in a charged active phase** (`evaluate_human_reading` gives RECOVERY):
   - set `_routine_inhibited = True` synchronously;
   - make a synchronous `transition_to(OPERATOR_RECOVERY_REQUIRED)`;
   - then, per RD-1, at most one containment attempt (§2.6).
   - No protective drop is admitted.
9. **If `protection_check_pending` is set** (from a continuation accepted in an earlier turn):
   - FRESH and BT <196 may clear **both** `protection_check_pending` and `_routine_inhibited` synchronously, but only after a new safety evaluation ALLOWs the stored explicit continuation request for this exact run/session/child generation, charge and canonical target phase, with endpoint NONE, command SETTLED, no unresolved lifecycle owner, and no concurrent emergency/generation change. Clear that pending continuation request in the same transition. No await occurs between revalidation and clearing; record the evaluation after the urgent stage. A queued request, fresh reading alone or an old ALLOW cannot clear either flag;
   - FRESH and BT ≥196 keeps routine inhibition and runs the protected endpoint admission in step7; it never clears either flag first;
   - not FRESH runs step 8.
   - Only this safety-evaluated step clears the pending flag and routine inhibit. A refusal, expired/cross-generation request, invalid reading or changed ownership retains inhibition and operator recovery. Unknown/admitted endpoint states never reach the clear transition.

**H3. The rest of the batch.**
- Dispatch the remaining items in their original order, keeping the acknowledgement filtering at `api.py:1421-1436`.
- Every routine write goes through the human fence (§2.4-F), which re-checks freshness at actual dispatch.
- **ACKNOWLEDGE_RECOVERY** in HUMAN mode routes to a new async `controller.human_operator_continue(target)` in place of the synchronous call at `api.py:1665`. It evaluates `evaluate_human_continuation` on `tracker.recheck()` and persists the evaluation. On ALLOW it transitions and sets `protection_check_pending = True`, and `_routine_inhibited` stays `True` until H2 clears the pending flag on a **later turn**. Fresh evidence alone never resumes anything.
- An operator **DROP_BEANS** item goes to the endpoint join (§2.4-J) or the recovery disposition (§2.4-R).

**H4. `controller.tick()` reuses H2's evidence.**
- It makes no `_reader.read_telemetry()` call; that includes the latched path at `controller.py:4621`, which evaluates escalation on the turn's reading and holds silently if the turn's read failed.
- It then persists the snapshot, the evaluations buffered in H2, and the existing stages.
- While `_routine_inhibited` or `protection_check_pending` is set, the pre-FC, post-FC, ceiling, anchor and advisor write stages are skipped (the fence would refuse them anyway; skipping avoids noise).

**H5. History.** Post-tick history persistence (`api.py:1379-1400`) is unchanged.

**Storage scope.** Except the already admitted emergency path, A1 puts H2 decision/latch/dispatch before all ordinary queue processing and its audit persistence. Ordinary actions retain their safety evaluation and audit obligations after H2. Bounding the storage awaits after H2 is A2's job and is not claimed here.

**Escalation clause.** If the implementer finds a dispatch or persistence path that H1–H4 cannot order this way without changing an emergency or automatic semantic, the slice stops and returns `ESCALATE` naming that path. It does not hand back a partial AC-4/5.

**F. The fence.** `_run_routine_write` and `execute_fault_acknowledgement_stop` take a **required** `write_class: WriteClass`; pyright enforces it. In HUMAN mode `routine_admission_is_current` also requires:

| Write class | Allowed only when |
|---|---|
| HEAT, FAN | endpoint = NONE, not inhibited, command SETTLED, no pending protection check, and `tracker.recheck()` is FRESH |
| DROP | the caller is the latched owner of an ADMITTED or IN_FLIGHT endpoint whose evaluator allowed it, and `recheck()` is FRESH |
| CONTAINMENT | per §2.6 |
| NON_HEAT, SESSION_START | Preserve ordinary behaviour only if the lifecycle guard below permits it. Unknown HUMAN ownership never becomes a new-session/cooling/mark escape. Independent emergency uses its separate path. |

AUTOMATIC mode ignores the extra predicate. `run_emergency_stop` never consults the fence.

**J. Join.**
- While endpoint ∈ {ADMITTED, IN_FLIGHT, ISSUED}, an operator drop, an advisor `should_drop`, the ceiling guard, the anchor and the fault-control terminal drop send nothing and record `joined_protective_endpoint`.
- While endpoint ∈ {UNKNOWN, HISTORY_UNKNOWN}, they record `refused_unknown_prior_drop` and project physical intervention.
- While endpoint is WITHHELD, only §2.4-R may drop.
- An operator drop with endpoint NONE in PRE_FC or DEVELOPMENT latches `ADMITTED`/OPERATOR synchronously and is then classified exactly like H2-7.

**R. Recovery disposition.**
- `operator_drop_beans` in OPERATOR_RECOVERY_REQUIRED, and the `FaultControlExecutor` DROP_BEANS path (`controller.py:604`, `mcp_client.py:1488-1497`) in FAULTED, both evaluate `evaluate_human_recovery_drop` and persist it.
- On ALLOW they latch `ADMITTED`/OPERATOR_RECOVERY or FAULT_CONTROL synchronously and dispatch with a freshness re-check at dispatch.
- `enabled_actions` lists DROP_BEANS iff that evaluator would ALLOW now. When it does not, the snapshot projects `physical_intervention_required`.

**Outcome classification (every human drop owner).**

| Result | Disposition |
|---|---|
| Arbiter discarded it, or `admitted()` was false because of freshness | WITHHELD, then RD-1 containment at most once, then OPERATOR_RECOVERY_REQUIRED and RECOVERY_REQUIRED `{"endpoint":"withheld","physical_intervention_required":true}` |
| Discarded by an e-stop generation | the latch stays and the new owner governs |
| Valid applied state | ISSUED, then COOLING, `DropReason.HUMAN_PROTECTION` (or the operator reason), `target_outcome:"interrupted_unmet"` for PROTECTION |
| Any exception (including `MCPToolTimeoutError`; `CancelledError` is re-raised after classification), or applied `None` | UNKNOWN, command UNKNOWN, OPERATOR_RECOVERY_REQUIRED |

After an UNKNOWN there are **zero** further drops, zero `_clamp_heat_after_failed_drop`, zero containment, and zero reconnect, respawn or new-session attempts. Every case records the dispatch interval (start and end UTC, and the run-local monotonic duration).

**Restart (RD-2, a temporary A1 limit).** In HUMAN mode `recover_from_restart` sets endpoint `HISTORY_UNKNOWN` and command `UNKNOWN`, because A1 persists neither. Within A1, continuation and software drop are therefore refused after a restart, and physical intervention is shown. This is **not** a permanent restart ban: A2 must integrate durable ownership evidence with A1's explicit safe continuation interface before admission; C separately admits canonical human authority and reconciles human FC. No generic recovery-policy implementation is silently assigned to C. A previously admitted or unknown endpoint remains non-resumable. Positively reconciled pre-endpoint interruption retains the approved explicit-continuation path. Human mode is unreachable until then (AC-NA), so the temporary limit never reaches an operator.

**Emergency.** The following are unchanged in every human state:
- `admit_emergency_stop` and `run_emergency_stop`;
- `_execute_emergency_stop`;
- the `_EMERGENCY_STOP_RETRY_RULE` retry (`controller.py:4556`);
- `_maybe_escalate_while_latched`, except that its source changes from a re-read to the turn evidence.

The projection says that the existing MCP emergency fallback may stop the drum and close the chute, and that admission or RPC return does not prove evacuation.

**After the endpoint.** Once endpoint ≠ NONE, no FC mark or model detection changes phase or DTR or clears the latch. In HUMAN mode `telemetry.first_crack_detected` is never protection input. Only canonical human FC may govern development; C owns the admission and reconciliation interface.

### 2.5 Fixed-zero consumer (S2, `mcp_client.py`; human path only)

**Discovery.**
- Add a separate `ToolDiscoverySession` protocol (`list_tools`). The transport exposes `discover_fixed_zero() -> ToolDiscovery` (`DISCOVERED`, `ABSENT`).
- It is an explicit read-only HUMAN preparation operation, callable after MCP transport initialization and **before** `start_roast_session`, session identity reset, or initial heat/fan actuation. Cache by exact initialized child generation; one discovery attempt per generation. No Start is needed to call it. A1 exposes and tests this capability but adds no HUMAN enablement; C composes its full pre-Start admission with this evidence. Failure/absence remains ABSENT and cannot initiate Start or fallback. AUTOMATIC never calls `list_tools`; legacy bootstrap/inventory remain unchanged.
- Tool discovery carries no run/session identity and is not driver eligibility. After a separately admitted successful Start, containment additionally binds the exact session returned by that same child and server-owned capability/refusal checks. A changed/restarted child invalidates discovery and session evidence; a fresh child is never spawned to clear unknown command ownership.
- The result is `DISCOVERED` only when the one `list_tools` response is terminal (`nextCursor` absent or null; any non-null value, including an empty string, fails closed) and exactly one tool is named `contain_heat_fixed_zero` and its `inputSchema`, as a JSON object, has:
  - `type: "object"` and `additionalProperties: false`;
  - `required` is a list of exactly two distinct strings equal as a set to {`expected_session_id`, `containment_protocol`}; duplicate entries are rejected;
  - `properties` with exactly those two keys;
  - `expected_session_id` with `type: "string"`, exact-int (not bool/float/string) `minLength: 1`, and exact-int `maxLength: 128`;
  - `containment_protocol` with `type: "string"`, `const: "fixed_zero/v1"`.
  - Title and description keys are ignored.
- Anything else gives `ABSENT`: no tool, a duplicate, extra or missing keys, a different value, a session without `list_tools`, or a raised call. No retry happens within an epoch, and a respawn invalidates the result.
- `DISCOVERED` means only that the tool is advertised. It is **not** proof of driver support, and not permission to dispatch: driver support is learned only from the outcome (`refused_capability`), and dispatch permission is §2.6.

**Request.** Exactly `{"expected_session_id": <_started_session_id>, "containment_protocol": "fixed_zero/v1"}`. The session id must be a `str` of 1 to 128 code points, with no normalisation. Otherwise there is no call, and the outcome is `NOT_ATTEMPTED`. There is no heat argument.

**Response grammar (closed and complete).** Use a dedicated strict structured-response path for this new containment call. Check the outer SDK `isError` first and map it through the typed transport failure path. Otherwise require actual SDK `structuredContent` to be a JSON object; absent, null, scalar or non-object evidence gives `UNKNOWN_MALFORMED_RESPONSE`. Never parse text content as a fallback, unwrap scalar content, or accept a dictionary whose structured provenance was erased by the legacy parser. Preserve legacy `parse_tool_result` and `call_tool` behaviour for existing/automatic callers. The transport-level strict method uses the same bounded single SDK call and typed timeout/cancellation handling, with a distinct malformed-structured-evidence classification before any lifecycle cleanup can initiate replacement. SDK types stay in infrastructure; only the validated closed domain result reaches orchestration. A malformed payload cannot escape classification via `JSONDecodeError` because no fallback JSON text parse is performed. The object must have exactly these 11 keys, no extras and none missing:

| Key | Constraint |
|---|---|
| `containment_protocol` | `type is str` and `== "fixed_zero/v1"` |
| `containment_version` | `type is int` and `== 1` |
| `outcome` | one of `refused_identity`, `refused_capability`, `refused_busy`, `command_state_returned`, `unknown_driver_result`, `unknown_completion` |
| `request_dispatch` | `"not_invoked"` or `"invoked"` |
| `automatic_retry_permitted` | `type is bool` and `is False` |
| `requested_session_id` | str, 1–128 code points, **equal to the id sent** |
| `validated_session_id` | null, or a str **equal to `requested_session_id`** |
| `commanded_state` | null, or the 8-key object below |
| `session_projection` | `"recorded_in_memory"`, `"unknown"` or `"not_changed"` |
| `durability` | `== "not_provided_by_this_tool"` |
| `reason_code` | null, or one of the 16 codes below |

The 16 reason codes are: `unknown_session`, `not_latest_session`, `session_not_active`, `session_faulted`, `capability_absent`, `capability_version_unsupported`, `capability_malformed`, `capability_unreadable`, `capability_port_missing`, `finalisation_in_progress`, `command_in_progress`, `driver_raised`, `driver_result_missing`, `driver_result_invalid`, `completion_ownership_changed`, `projection_unconfirmed`.

**The six outcome rows** must match exactly; any other combination gives `UNKNOWN_MALFORMED_RESPONSE`:

| outcome | request_dispatch | validated_session_id | session_projection | commanded_state | reason_code ∈ |
|---|---|---|---|---|---|
| refused_identity | not_invoked | null | not_changed | null | {unknown_session, not_latest_session, session_not_active, session_faulted} |
| refused_capability | not_invoked | = requested | not_changed | null | {capability_absent, capability_version_unsupported, capability_malformed, capability_unreadable, capability_port_missing} |
| refused_busy | not_invoked | = requested | not_changed | null | {finalisation_in_progress, command_in_progress} |
| command_state_returned | invoked | = requested | recorded_in_memory | present | null only |
| unknown_driver_result | invoked | = requested | unknown | null | {driver_raised, driver_result_missing, driver_result_invalid} |
| unknown_completion | invoked | = requested | unknown | present | {completion_ownership_changed, projection_unconfirmed} |

**`commanded_state`** must have exactly 8 keys:
- `driver`: str with `re.fullmatch(r"[a-z][a-z0-9_-]{0,63}", v, flags=re.ASCII)`;
- `capability_version`: `type is int` and `== 1`;
- `heat_level_percent`: `type is int` and `== 0`;
- `roast_fan_level_percent` and `main_fan_level_percent`: `type is int`, between 0 and 100;
- `drum_motor_on`, `cooling_motor_on` and `solenoid_open`: `type is bool`.

Any violation gives `UNKNOWN_MALFORMED_RESPONSE`, because the call may still have been invoked.

**Transport.** `MCPToolTimeoutError`, `MCPConnectionError`, `MCPToolError` (`isError`, which includes an outer SDK argument or protocol error) and `CancelledError` all give `UNKNOWN_TRANSPORT`. Cancellation is re-raised after recording. No retry, reconnect, respawn or new session follows.

**Domain result.** `ContainmentResult(outcome, reason: ContainmentReason | None, evidence_heat_zero_commanded: bool | None, evidence_is_pre_fallback: bool)`. Pydantic and SDK types never cross into the controller.
- **`command_state_returned`** is projected as "commanded heat 0 recorded in server memory". It is never projected as physical heat removal, the latest state, transport settlement or durable audit.
- **`unknown_completion`** sets `evidence_is_pre_fallback = True`. Its commanded state was read **before** a possible MCP stale-completion emergency fallback, which may set drum off, solenoid closed, cooling on and main fan 100. It is never projected as the latest or physical state.
- `CommandExecutor` gains `contain_heat_fixed_zero() -> ContainmentResult`, and the fakes are updated.

### 2.6 RD-1 containment consumption (HUMAN only)

**Preconditions.** The controller attempts containment only when all of these hold. If any fails, the outcome is `NOT_ATTEMPTED`: no caller fallback, no `set_heat`, no e-stop substitution.
- `ContainmentAttempt is AVAILABLE`;
- discovery is `DISCOVERED` for the current epoch;
- the exact session id is known;
- command disposition is `SETTLED`;
- **prior ownership is settled**: no human endpoint is ADMITTED or IN_FLIGHT, and no other routine write is in flight in the arbiter. The arbiter's in-flight state is read without awaiting.

**Dispatch.** Set `CONSUMED` synchronously, then dispatch through `_run_routine_write(write_class=CONTAINMENT)`. If the arbiter discards it, it is known not dispatched and stays `CONSUMED`.

**Outcomes.**
- `REFUSED_*` (including `refused_busy`): known non-dispatch. No retry, no fallback. Physical intervention is projected.
- `COMMAND_STATE_RETURNED`: recorded as command state only.
- Any `is_unknown` outcome: command `UNKNOWN`, which blocks every routine HEAT, FAN and DROP and blocks continuation for the rest of the run.

**Required human-mode effect.** In HUMAN mode the ordinary `_apply_fail_safe` `set_targets` path and the #206 `_pending_fail_safe` retry are not used. The exception is the `_EMERGENCY_STOP_RETRY_RULE` retry, which stays as it is.

---

### 2.7 Application lifecycle ownership gate (S3)

Introduce a cohesive application-owned, in-memory `HumanRunOwnership` capability shared by controller, runner/service start admission and adapter identity lifecycle. It retains `(run_id, child_generation, session_id, endpoint_disposition, command_disposition, containment_consumed)` for the current HUMAN run. The controller synchronously publishes admission/unknown transitions before awaits; the capability never clears them from a refusal, cleanup, cached-id reset or successful transport restart. It has no SDK/store/UI types. The capability outlives any one runner/controller object within the process.

- Before `start_roast` performs config reload, respawn, run creation or runner replacement, reject if prior HUMAN ownership is unresolved or its endpoint disposition is not known/reconciled as closed. Recheck after waits and immediately before effectful steps under the existing start-admission ownership. Changing the requested authority to AUTOMATIC cannot evade this guard.
- `_respawn_mcp_for_device_config`, `_build_runner`'s call to `reset_session_identity_for_new_run`, `RoasterControlAdapter.start_session` and application-triggered `MCPClient.start` must all observe the same blocked ownership before reset/spawn/session dispatch. Low-level methods receive a consumer-owned predicate/capability; they do not discover application state through globals. No new reconnect/retry policy is introduced.
- A local command timeout/cancellation/malformed result marks the ownership unknown before any teardown/error continuation could initiate a replacement. Necessary cleanup/stop of an existing child remains allowed, and does not clear uncertainty or authorize a new child. Independent emergency remains callable through its existing admission; no physical service/preemption guarantee is added.
- Ordinary NON_HEAT MCP actions do not bypass unresolved ownership. Local diagnostic notes may be recorded without a hardware call, phase/DTR change or latch release. An independently admitted emergency is the sole unchanged exception. Operator drop still needs the exact-session/charge/freshness/known-prior-drop evaluator.
- A1 provides no 'clear unknown' endpoint and no persistence substitute. Recovery construction starts UNKNOWN/HISTORY_UNKNOWN, never AVAILABLE from absence. A2 adds durable restoration to this capability before HUMAN admission. Known completed prior runs may later be replaced only through existing explicit safe start/reconciliation authority, without treating uncertain storage or unknown command outcomes as completion. No automatic new run can reset a consumed attempt.

The service guard is checked again at the HTTP Start delegate (`api.py:8346`) through its service call; the HTTP route has no independent bypass.

Source anchors at the bound Agent base: adapter reset `mcp_client.py:1314`, start-session `:1594`/reset`:1618`; child start`:2406`, teardown`:2677`; API device respawn`:2767`, start`:5556`, create-run`:5756`, runner construction`:5992`/reset`:6026`, restart recovery`:6217`. Enumerate these with the exact scoped searches below. Actual changed paths remain inside Agent; no producer or collector change is implied.

## 3. Test list

All tests run hardware-free: a fake MCP, an injected clock and sinks, and an SDK-built in-test stdio server. None need the E12 hardware stories, and no hardware or qualification claim follows from them. Each guard is listed with the test that must fail when the guard is removed or inverted. Every row is filled in.

**S1** (`tests/test_human_protection.py`, `tests/test_safety_human.py`)

| Guard | AC | Test | Removing/inverting the guard must fail |
|---|---|---|---|
| G1 inclusive threshold | 4a | T1 `test_threshold_inclusive_below_equal_above` (195.99 / 196.0 / 196.01) | `>=` changed to `>` fails T1 at 196.0 |
| G2 charged conjunct | 4b | T2 `test_uncharged_never_eligible` | dropping `charged` fails T2 |
| G3 phase set | 4c | T3 `test_phase_set_pre_fc_and_development_only` (all `RoastPhase` members) | adding COOLING or dropping PRE_FC fails T3 |
| G4 FRESH conjunct | 4j | T3b `test_non_fresh_never_eligible` (STALE/UNPROVEN/INVALID) | dropping the freshness conjunct fails T3b |
| G5 endpoint NONE conjunct | 4h | T3c `test_latched_endpoint_never_eligible` (every non-NONE member) | dropping it fails T3c |
| G5b command SETTLED conjunct | 4o | T3d `test_unknown_command_never_eligible` | dropping it fails T3d |
| G6 accepted = status − ignored | 4g | T4 `test_ignored_rising_with_status_is_not_fresh` | using the raw status count fails T4 |
| G7 decrease or epoch change gives INVALID and reset | 4g | T5 `test_counter_decrease_and_epoch_change_invalid_and_reset` | removing either check fails T5 |
| G8 exact-int counters | 4g | T6 `test_counter_bool_float_str_none_invalid` | `isinstance(v, int)` fails T6 on `True` |
| G9 finite BT/ET | 4g | T7 `test_nan_inf_bt_or_et_invalid` | removing `isfinite` fails T7 |
| G10 first observation UNPROVEN | AC-D230 | T8 `test_first_observation_unproven_not_age_zero` | defaulting age to 0 fails T8 |
| G11 previous admission time as the bound | AC-D230 | T9 `test_increase_bound_is_previous_request_admission` | using `now` fails T9 |
| G12 no renewal / long gap | AC-D230 | T10 `test_unchanged_does_not_renew`, `test_long_gap_unproven` | renewing on unchanged fails T10 |
| G13 absent ≠ zero | 4g | T27 `test_missing_raw_vendor_keys_or_device_state_none_absent` | defaulting to 0 fails T27 |
| G13b ignored > status gives INVALID | 4g | T27b | removing the check fails T27b |
| G14 no model, DTR, advisor or dwell gate | 4h | T11 parametrised over advisor None or raising, DTR None, dev% None, post-FC disabled, `ceiling_guard_drop_enabled=False` | adding any of these gates fails T11 |
| G15 constant 196.0 | 4h | T13 `test_constant_equals_bitter_ceiling_default` | drift fails T13 |
| G16 matrix unchanged | 11 | T14 `test_drop_row_excludes_recovery` plus the existing completeness test | extending the row fails T14 |
| G17 plain Enum | AC-NA | T15 `test_new_enums_plain_enum` | changing to `StrEnum` fails T15 |
| G18 recovery-drop conjuncts | 11 | T12a, exhaustive over all inputs; each single conjunct false gives REJECT | dropping any conjunct fails its row |
| G19 continuation conjuncts | 4n/4o | T12b, exhaustive; PREHEATING once charged gives REJECT | dropping any conjunct fails its row |
| G20 RD-3 mapping | 4j | T16 `test_human_charged_session_clock_stale_maps_recovery_read_failure_stays_fault` | mapping a read failure to RECOVERY, or a stale clock to FAULT, fails T16 |

**S2** (`tests/test_mcp_fixed_zero.py`, `tests/test_mcp_client.py`)

| Guard | AC | Test | Removing/inverting the guard must fail |
|---|---|---|---|
| G47 exact request | D230-4 | T20 `test_request_exact_two_keys_no_heat` | adding any key fails T20 |
| G47b session-id bound | D230-4 | T20b: `""`, 129 code points, or non-str gives `NOT_ATTEMPTED` with zero calls | removing the bound fails T20b |
| G48 six-row table | 8 | T21: each row valid passes; for each row, every single-cell deviation (dispatch, validated presence, projection, state presence, out-of-row reason, null reason where a set is required) gives MALFORMED | removing any row check fails its case |
| G54 identity echo | 8 | T21b: requested ≠ sent, or validated ≠ requested, gives MALFORMED | removing either check fails T21b |
| G49 exact types and keys | 8 | T22: `True` for 1, `0.0` for 0, `"false"`/`0` for `False`, an extra or missing key (top level and state), non-ASCII or uppercase driver, fan 101 or −1 | loosening any check fails its case |
| G50 transport gives unknown | 7/8 | T23: each error type and `CancelledError` gives `UNKNOWN_TRANSPORT`; cancel re-raised; zero further calls; child start/stop spies at zero | mapping timeout to `REFUSED_*` fails T23 |
| G51 exact discovery schema | D230 | T24: missing, duplicate, extra property, missing `additionalProperties:false`, wrong const, wrong bounds, `list_tools` raises, session without `list_tools` all give ABSENT; respawn invalidates | method-presence or name-only inference fails T24 |
| G51b discovery is not support | D230 | T24b: DISCOVERED plus `refused_capability` gives REFUSED, with no "supported" claim in the projection | treating DISCOVERED as support fails T24b |
| G53 no retry on any outcome | 8 | T25: each of the 9 outcomes gives exactly one call | any retry fails T25 |
| G55 / G56 non-physical projection | 11 | T57 `test_command_state_returned_projection_not_physical`; T57b `test_unknown_completion_marked_pre_fallback_not_latest` | dropping the pre-fallback flag fails T57b |
| G50b sync blockage (AC-7) | 7 | T26 (`slow`+`serial`): a real stdio session against an in-test FastMCP tool that blocks synchronously beyond `call_timeout_seconds` gives `UNKNOWN_TRANSPORT`; a concurrent second request is not serviced while it blocks; an async-handler control gives the same classification; no settlement or preemption claim; the resolved `mcp`/`pydantic` versions go in the message; no scheduler-callback-race assertion | classifying the late settlement as success fails T26 |

**S3** (`tests/test_controller_human_mode.py`, `tests/test_runner_human_turn.py`, plus additions to `tests/test_command_arbiter_edges.py`, `tests/test_controller.py` and `tests/test_controller_stale_generation.py`)

| Guard | AC | Test | Removing/inverting the guard must fail |
|---|---|---|---|
| G20b no storage before urgent dispatch | 4f | T30: every sink blocks forever; `drop_beans` is still called | moving H2 after `persist_snapshot` fails T30 |
| G21 urgent before ordinary queued dispatch and its audit | 4f/5a | T30b: a queued operator action and its `record_operator_action` are recorded after the protective drop call (ordered spy) | draining before H2 fails T30b |
| G21b emergency still first | 4q/5c | T30c: a queued e-stop is dispatched before H2 and H2 does nothing | running H2 first fails T30c |
| G22 pure same-tick charge | 4e | T31: same-tick T0 plus BT 196 fires with sinks blocked | requiring `_apply_phase_rules` fails T31 |
| G23 synchronous latch / one dispatch | 4h | T32: H2, a queued operator drop, the ceiling guard, the anchor and the advisor in the same and next turns give exactly 1 `drop_beans` call | an await between decision and latch, or removing the DROP fence, fails T32 |
| G24 dispatch-time recheck | 4k | T33: the clock advances while the operation is held in the arbiter; the result is WITHHELD with 0 calls | removing the recheck in `admitted()` fails T33 |
| G25 no dispatch from recovered freshness | 4l | T34 | redispatching a WITHHELD drop fails T34 |
| G4b stale before admission | 4j | T35: BT ≥ 196 while STALE gives recovery and no drop | — (G4 proven by T3b; T35 is the integration check) |
| G26 / G27 unknown drop classification and no retry | 4m/8 | T36, parametrised over raise, timeout, cancel and `None` applied state: 0 further drops, 0 clamps, 0 containment, 0 restarts | restoring the clamp or retry, or treating `None` as ISSUED, fails T36 |
| G28 HEAT/FAN fence | 5a | T37: routine heat/fan queued behind an in-flight drop is discarded after the latch | removing the fence fails T37 |
| G28b dispatch-time freshness for HEAT/FAN | 5a | T37b: freshness lost between H2 and an H4 lever gives 0 writes | removing the HEAT/FAN recheck fails T37b |
| G29 join and refuse | 5b | T38 `joins_admitted`, `refused_on_unknown` | removing either fails T38 |
| G30 fault-control terminal drop fence | 5b/11 | T39: the `FaultControlExecutor` DROP_BEANS path is refused for an unknown prior drop, stale evidence or a latched endpoint | removing the fence fails T39 |
| G31 no heating resume after the endpoint | 4p | T40: every endpoint ≠ NONE × {PREHEATING, PRE_FC, DEVELOPMENT} gives REJECT | removing the endpoint conjunct fails T40 |
| G32 fresh alone does not resume | 4n | T41: stale then fresh stays in recovery with 0 heat/fan/drop | auto-resume fails T41 |
| G33 pending protection check | 4n | T42: fresh below, equal and above 196; at ≥ 196 the first write on the next turn is `drop_beans`, never `set_heat` | removing the flag fails T42 |
| G34 no routine writes in the continuation turn | 4n/5a | T42b: ACK in H3, then the same turn's H4 makes 0 routine writes | clearing inhibition at the ACK fails T42b |
| G19b continuation refusal | 4o | T43: unknown containment, failed reconciliation or HISTORY_UNKNOWN gives REJECT | — (conjuncts proven by T12b) |
| G18b recovery-drop integration | 11 | T44: each conjunct false refuses; stale removes DROP from `enabled_actions` and projects physical intervention | removing the `enabled_actions` predicate fails T44 |
| G35 emergency unaffected | 4q/5c | T45: e-stop admission in every endpoint, command and inhibition state; T54: the arbiter's `run_emergency_stop` never consults the fence; `_EMERGENCY_STOP_RETRY_RULE` parity | applying the fence to e-stop fails T54 |
| G36 one containment attempt per run | RD-1 | T46b: after one attempt (each outcome), recovery re-entry, recovered freshness, a refusal, a respawn or new epoch, a new session id, a resume, or a restart within the run give 0 further calls | resetting `CONSUMED` anywhere fails T46b |
| G36b prior-ownership precondition | RD-1 | T46c: containment while a routine write is in flight, or while an endpoint is IN_FLIGHT, gives `NOT_ATTEMPTED` | removing the check fails T46c |
| G37 refusal has no fallback | RD-1 | T47: each `REFUSED_*` gives 0 `set_heat`, 0 e-stop | adding a fallback fails T47 |
| G38 unknown containment blocks | RD-1 | T48: an unknown result blocks HEAT/FAN/DROP and continuation | removing the block fails T48 |
| G39 HUMAN fail-safe  | RD-1 | T46: 0 `set_targets`, 0 `_pending_fail_safe` retries; the e-stop retry is preserved | restoring the fail-safe in HUMAN fails T46 |
| G40 restart interim | 11/RD-2 | T49: HISTORY_UNKNOWN blocks resume and software drop; a blocked sink during `recover_from_restart` gives no heat/drop replay | removing HISTORY_UNKNOWN fails T49 |
| G41 latch after the endpoint | 10 | T50: an FC mark and a model detection after the endpoint leave phase, DTR and latch unchanged | removing the guard fails T50 |
| G42 / G43 outcome and evidence | 4i/12 | T51: `interrupted_unmet`, BT/ET, freshness, age bound, dispatch interval; T51b: non-finite or malformed ambient recorded `invalid` | recording `success`, or a valid ambient, fails |
| G53b intervals | 5d | T53: intervals for drop and containment | removing them fails T53 |
| G44 automatic behaviour parity | 12 | T52: a canned AUTOMATIC run gives the same executor calls, events and persisted rows as base; the whole existing suite is unchanged | any HUMAN branch leaking into AUTOMATIC fails T52 |
| G52 HUMAN-only discovery and extraction | 12 | T52b: AUTOMATIC makes 0 `list_tools` calls, 0 `extract_accepted_counters` calls and 0 `read_human_evidence` calls; malformed `raw_vendor_data` counters do not change AUTOMATIC behaviour | an unconditional call fails T52b |
| G45 one read per human turn | 4g | T55: exactly one `get_roast_state` per HUMAN turn, including the latched path | a re-read at 4621 or 2617 fails T55 |
| G46 failure-counter parity | 4g | T56: a failed HUMAN read counts once outside the latch and is bypassed inside it | double counting fails T56 |

**Cross-boundary checks before opening.**
- The FE event-kind and payload contract tests.
- The `enabled_actions` biconditional test (`safety.py:177-179`).
- The `DropReason` member and the payload keys.

**S4 (SPA).**
- **G57:** Vitest data-asserts show that the endpoint disposition, physical-intervention, unknown-outcome and emergency-fallback disclosure are rendered only from server fields. There is no local phase inference and no wording that claims cooling or evacuation from command-state fields.
- **Mutations:** deriving the disclosure locally fails the test; showing "cooling confirmed" from `cooling_motor_on` fails the test.
- A Playwright snapshot per CI policy.


**Lead corrections: mandatory causal witnesses in addition to the tables above.**

| Guard | Behavioural test and mutation that must fail |
|---|---|
| L1 both continuation flags clear only after current safe disposition | `test_reconciled_below_threshold_continuation_uninhibits_next_turn`: explicit request, next-turn fresh valid evidence, known history and safety ALLOW clear both flags, allowing the later ordinary write. Retaining either flag fails the positive case. Removing any identity/generation/charge/phase/endpoint/command/freshness/ALLOW check fails its corresponding negative row. Freshness alone, failed reconciliation and stale prior ALLOW never clear either flag. |
| L2 threshold branch never briefly resumes | `test_continuation_equal_above_threshold_never_uninhibits`: assert no intermediate flag clear or heat/fan call at/elevated above196, even if drop waits or becomes unknown. Moving the clear before threshold evaluation fails. |
| L3 absence/error breaks observation history | `test_absent_or_failed_observation_requires_new_baseline_then_progress`: establish fresh bound, inject absent/invalid/read-failure, restore one valid high counter snapshot (UNPROVEN), then valid unchanged (UNPROVEN), then ordered increase (eligible only with age bound). Keeping old bound/baseline, setting age zero, or accepting the first restored snapshot fails. |
| L4 long-gap/out-of-order/epoch reset cannot reuse bound | `test_long_gap_and_discontinuities_reseed_without_freshness`: parameterize gap, epoch, counter reset, reversed/non-finite clock, delayed response. Guard removal or late-response age-zero fails; include exact-age boundary. |
| L5 discovery precedes any Start | `test_human_discovery_is_read_only_pre_start`: obtain discovery on initialized exact child with zero Start/heat/fan/reset calls; ABSENT never starts. Requiring Start first or triggering Start as fallback fails. Child change invalidates evidence; AUTOMATIC makes no discovery call. |
| L6 unknown ownership cannot escape lifecycle | `test_unknown_human_owner_blocks_all_lifecycle_entries`: unknown drop and containment through timeout/cancellation/malformed/driver/completion outcomes; call every source-anchored lifecycle entry directly and via service, including after waits, config change, authority change, reset and replacement runner. Assert zero new run rows, resets, child starts, MCP Starts and ordinary writes. Removing each independent gate fails its corresponding row. |
| L7 cleanup and emergency remain independent | `test_cleanup_does_not_settle_and_emergency_stays_available`: allow required cleanup and existing emergency admission while unknown; assert uncertainty persists and no replacement child/run follows. Treating successful stop/RPC as settlement fails; blanket blocking emergency fails. |
| L9 same-tick charge phase is committed once | `test_same_tick_charge_uses_validated_effective_phase_once`: start just before permitted charge confirmation with BT>=196; assert one canonical T0 event/streak update, one safety-evaluated drop before storage, and no duplicate H4 transition. Removing phase/source validation, leaving effective phase unadvanced, or repeating T0 in H4 fails. |
| L10 only structured containment evidence is accepted | `test_containment_rejects_text_fallback_and_scalar_evidence`: outer isError wins even with plausible structured content; absent/null/scalar structuredContent plus valid/invalid JSON text all yield unknown and no repeat/lifecycle escape. Spies prove the legacy text parser is not called on this new path. Restoring fallback, accepting parsed dictionaries without provenance, or allowing malformed evidence to escape classification fails. |
| L11 discovery proves one complete inventory and exact schema types | `test_discovery_rejects_nonterminal_listing_and_coerced_bounds`: non-null nextCursor (including empty), duplicate required entries, true/1.0/string minLength or maxLength, duplicate tool names and altered semantic keys all give ABSENT with exactly one call and zero Start. Ignoring cursor, coercing bounds or converting required to a set before checking length fails. |
| L8 containment budget survives attempts to replace run | `test_consumed_attempt_cannot_be_reset_by_new_run_request`: every outcome, including known refusal, consumes at most one attempt; no re-entry/session/epoch/generation change enables another in that unresolved run. Resetting ownership on runner construction fails. |

## 4. Class sweep

Run these in `{IMPL_WORKTREE}`. These are ripgrep patterns: alternation uses `-e` or an unescaped `|`. The expected sets are at `1a9c271`.

| ID | Class | Command | Expected set and classification |
|---|---|---|---|
| S-1 | Routine writes need `write_class` | `rg -n '_run_routine_write\(' src/roastpilot_agent/controller.py` | 12 lines: 2488 (D212 cooling stop, NON_HEAT), 2511 (definition), 2553 (HEAT), 2562 (FAN), 3572 (DROP, deterministic), 4996 (DROP, advisor), 5331 (SESSION_START), 5594 (NON_HEAT, mark FC), 5647 (DROP, operator), 5704 (NON_HEAT, stop cooling), 5766 (NON_HEAT, mark beans added), 5809 (NON_HEAT, start cooling). After the change: these plus exactly **one** new CONTAINMENT call site and the new H2 protective-drop site (13 call sites plus the definition). Every call passes `write_class=`. |
| S-2 | Drop dispatch sites | `rg -n -e '_executor\.drop_beans' -e 'operator_drop_beans\(' -e '"drop_beans"' src/roastpilot_agent/controller.py src/roastpilot_agent/api.py src/roastpilot_agent/mcp_client.py` | 18 lines. Dispatches: controller 3573, 4997, 5648; mcp_client 1490 (fault-control terminal, fenced by the §2.4-R/J explicit check); 549 (client tool call, transport only). api 1492 (runner, routed by H3). Definition: controller 5611. Event payload strings: controller 3578, 3594, 5002, 5021, 5651, 5679; docstrings: controller 3535, 4029; type literal: mcp_client 595. After the change the only new hit is the H2 protective drop. |
| S-2b | Fault-control action map | `rg -n -e '_command_for_action' -e 'execute_fault_acknowledgement_stop\(' src/roastpilot_agent` | controller 604, 975, 2480; api 1747. All must be classified: 1747 is NON_HEAT; DROP_BEANS reached via 604/975 goes through G30. |
| S-3 | Fail-safe writers and retries (RD-1) | `rg -n -e '_apply_fail_safe\(' -e '_retry_pending_fail_safe\(' -e '_clamp_heat_after_failed_drop\(' -e '_pending_fail_safe = ' src/roastpilot_agent/controller.py` | 20 lines: 2246, 2451, 2602, 3587, 3599 (definition), 4332, 4342, 4384, 4402, 4412, 4426 (definition), 4462, 4474, 4482, 4556 (e-stop retry, **kept**), 4564 (definition), 4578, 4667, 5012, 5673. Under RD-1, each non-emergency site is HUMAN-gated (T46, T36); 4556 and 4667 are classified as emergency-retry or escalation and stay unchanged. |
| S-4 | Applied state of `None` adopted as success | `rg -n '_adopt_applied_state\(' src/roastpilot_agent/controller.py` | 3591, 4411, 4485 (definition), 4674, 5018, 5677. The HUMAN drop sites 3591, 5018 and 5677 classify `None` as UNKNOWN (T36). 4411 and 4674 are fail-safe and e-stop and stay unchanged. |
| S-5 | Session-clock age used as freshness | `rg -n 'age_seconds' src/roastpilot_agent/controller.py src/roastpilot_agent/safety.py src/roastpilot_agent/mcp_client.py` | controller 4296 (automatic safety input; RD-3 mapping only), 6379, 6405, 6419, 6425, 6428, 6434, 6438, 6457, 6468 (ambient, unchanged); safety 302, 322, 333, 340; mcp_client 1139, 1167, 1168, 1187, 1188, 1216, 1236, 1271, 1512, 1513, 1519. **No** new HUMAN protection, eligibility or fence predicate reads `age_seconds`; only the tracker decides. |
| S-6 | Accepted-counter readers | `rg -n -e 'status_packet_count' -e 'ignored_temperature_packet_count' src/roastpilot_agent` | at base, only `cold_characterisation/{mcp,temperature_projection,temperature_screen}.py`, which are not modified and not imported by A1. After the change: those plus `human_protection.py` (the extractor) and its tests. |
| S-7 | Telemetry reads per turn | `rg -n -e 'read_telemetry\(\)' -e 'read_human_evidence\(\)' src/roastpilot_agent/controller.py` | at base: 2617 (`_read_telemetry`), 4273, 4621. After the change: these plus one H2 `read_human_evidence()`. A HUMAN turn reaches only that one (T55). |
| S-8 | String-compared enums | `rg -n -e 'verdict ==' -e '\.value ==' -e 'outcome ==' src/roastpilot_agent/human_protection.py` | zero matches. Wire strings are compared only inside the adapter decoder, before mapping to `Enum`. |
| S-9 | Known repo classes (`docs/recent-fixes.md`) | the signatures named under "Never treat unknown roaster status as idle", "JSON wire sinks must sanitize non-finite floats", "Configuration floats must be finite by model config", "Real timeout tests must not require a scheduler callback race", "Run-local clocks cannot order or identify persisted rows across a restart" | no reintroduction. Payload floats go through the existing finite sanitiser, any new config uses `FINITE_NUMERIC_MODEL_CONFIG`, and tracker times are never persisted. |

The S4 PR body lists the post-change output of S-1, S-2, S-3 and S-7 with each match classified.

---

**Lifecycle sweep added by the lead:**

`rg -n -e 'def reset_session_identity_for_new_run' -e 'def start_session' -e 'def start\(' -e 'def _fail_closed_teardown' src/roastpilot_agent/mcp_client.py` → definitions1314,1594,2406,2677. Teardown is cleanup-only, not a clearing authority.

`rg -n -e 'def _respawn_mcp_for_device_config' -e 'def start_roast' -e 'def _build_runner' -e 'reset_session_identity_for_new_run\(' -e 'create_run\(' -e 'def recover_on_start' src/roastpilot_agent/api.py` → classify reset protocol declaration295, respawn2767, start5556, create-run5756, build-runner5992, reset6026, recovery6217 and HTTP Start delegate8346; prose matches are non-executable. Gate every operative entry, and record any base-drift matches before implementation. Tests L6–L8 cover this closed base set.

## 5. PR plan

The issue proposes one slice of 350 to 500 lines. This plan proposes four serial slices off `main`, resumed on each merge, purely for reviewability (RD-4). None of the issue's reviewer lenses is dropped by splitting: across the slices, safety, security, MCP-contract and simulation review all fire, and UI and QA fire when triggered.

| # | Branch | Scope | Logic lines (est.) | Depends on | Route and reviewers before opening |
|---|---|---|---|---|---|
| S1 | `feature/1076-human-mode-protection-domain` | `human_protection.py`, the four `safety.py` evaluators plus the RD-3 mapping, `DropReason.HUMAN_PROTECTION` | 320–420 | none | SAFETY_CRITICAL (full gate); `safety-reviewer`; `qa` if tests exceed 600 lines |
| S2 | `feature/1076-human-mode-protection-containment` | adapter request and response decoder, HUMAN-only discovery, `read_human_evidence`, transport classification, `CommandExecutor` method and fakes | 320–420 | S1 | SAFETY_CRITICAL; `safety-reviewer`, `security-reviewer` (parses child output; new tool surface), `mcp-contract-checker` |
| S3 | `feature/1076-human-mode-protection-controller` | human turn H0–H5, latch and dispatch fence, process-level lifecycle ownership gate, join/recovery/continuation, RD-1, restart interim and projection | 550–700 | S1, S2 | SAFETY_CRITICAL; `safety-reviewer`, `sim-roast-runner`, `mcp-contract-checker`, `security-reviewer` (only if the actual diff touches the decoder or the new tool surface); `qa` likely |
| S4 | `feature/1076-human-mode-protection-ui` | SPA rendering of the server-projected disposition and the disclosure | 150–250 (TS) | S3 | **Treated as safety-relevant** (operator recovery UI): full native gate plus `safety-reviewer` and `ui-reviewer`, plus the FE and backend contract tests. It drops to ROUTINE only if an independent reviewer adjudicates that, on the actual diff. |

**Why S3 is above the target (550–700 estimated logic lines, re-estimate at its bound base).** The turn ordering, endpoint/command latch, actual-dispatch fence, lifecycle guard and dispositions jointly prevent repeated or bypassed actuation. The application guard must be wired with the controller handoff in the same review unit; a controller-only unknown state could otherwise be discarded during new-run construction. Splitting them would leave either a latch with no fence or a fence that does not respect the turn ordering, and both are unsafe intermediate states. Human mode is unreachable in every slice.

**Linking.** S1–S3 use `Refs #1076`. S4 uses `Closes #1076` only when every A1 criterion is proved and the product audit agrees. In the completing PR, add a scoped A1/D230 row to the active E11 epic status table and corresponding registry note; do not alter E11-S3 or #954 completion state. Record A2/C/L/collector prerequisites separately. Any SDK fake-server scripts go in a dedicated commit.

## 6. Routing

**Capabilities by slice.**
- S1: domain and safety logic.
- S2: MCP adapter, SDK `list_tools`, async stdio test harness.
- S3: controller and runner.
- S4: React/TS.

**Implementation family.** The Codex parent chooses at the start of each slice from observed capacity. This contract asserts no family and no percentage. Workers are `engineer-be` for S1–S3 and `engineer-fe` for S4.

**Mandatory reviewers before opening.**

| Slice | Reviewers |
|---|---|
| S1 | `safety-reviewer` |
| S2 | `safety-reviewer`, `security-reviewer`, `mcp-contract-checker` |
| S3 | `safety-reviewer`, `sim-roast-runner`, `mcp-contract-checker` |
| S4 | `safety-reviewer` (uncertain safety, so full gate plus safety review), `ui-reviewer` |

`qa` is added wherever tests exceed 600 lines or the acceptance coverage is weak.

**Final reviewer set.** The parent derives it from each actual diff. It may add lenses and never removes these.

**Capacity.** Safety-review capacity is never spent on implementation, and each slice reserves review and repair capacity.

**Validation.** Every slice runs the full native gate (all three coverage roots, branch coverage), the statics and the cross-boundary contract tests.

## 7. Delegation prompt notes

1. **Worktree.** `{IMPL_WORKTREE}` is a placeholder. The orchestrator runs `git worktree add -b <planned-branch> {IMPL_WORKTREE} <base-sha>`, using the branch from §5 and the base off **current** `main` for this slice (without `-b` the HEAD is detached and the handback lands on no branch). It checks that `git status --porcelain --ignored` is empty there and substitutes the real path just before delegation. Every command self-locates. Never use the read-only planning base as the implementation tree, and never guess a path.
2. **Directives.** The worker's only directives are this contract's numbered sections and lead-authored directives. Every `UNTRUSTED-QUOTE` block and non-maintainer URL is stripped before delegation. The ratified contract is the only specification:
   - Do not fetch the story issue, its comments or any GitHub discussion; `gh issue view --comments` and similar are forbidden.
   - Do not open the MCP repository or fetch producer links.
   - §2.5 is the complete wire grammar.
3. **Fresh venv (#738).** Inside the worktree run `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev`. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
4. **Gates before handback.** S1–S4 are all SAFETY_CRITICAL or treated as safety-relevant. Run each command on its own:
   - `.venv/bin/python -m ruff check .`
   - `.venv/bin/python -m ruff format --check .`
   - `.venv/bin/python -m pyright`
   - `.venv/bin/python -m pytest --cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing` (no `-m`, `-k`, `-n` or deselect)
   - the FE contract tests (and, for S4, the web lint, typecheck and unit checks).

   Cover every changed line, and never call a focused pass a full gate. Hand back the S-1, S-2, S-3, S-7 and the lifecycle sweep output, classified.
5. **Attribution invariant.** The handed-back branch must be attributable to the implementation worker acting on its ratified inputs alone: this contract and lead-authored directives, which are the sanctioned channel. Any other model input the worker procures, at any stage, in any form, by any route, breaks that attribution. The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?" A **yes** fails the slice closed: the lead re-delegates it from this contract in a fresh worktree, or records an explicit operator decision naming which lens now supplies the independent pass.
6. **Traps specific to this story:**
   - Plain `Enum` only, no `StrEnum`, no string-compared verdicts. Celsius only.
   - Restore mutations by `cp` from a backup, never with `git checkout --`.
   - Do not change `COMMAND_PHASE_MATRIX`.
   - AUTOMATIC must keep its **behaviour** (T52/T52b): no `list_tools`, no counter extraction, no `read_human_evidence` and no extra clock calls on the AUTOMATIC path. Do not change `RoastSessionState` or `RoasterDeviceState` fields.
   - Never add a config, API or operator surface that selects HUMAN.
   - A HUMAN turn makes exactly one telemetry read, and no storage await comes before the H2 decision, latch and dispatch. If the H1–H4 ordering cannot be achieved without changing emergency or automatic semantics, stop and return `ESCALATE` naming the path.
   - `ContainmentAttempt` is never reset within a run.
   - `CommandDisposition.UNKNOWN` is never cleared in A1.
   - No automatic retry, reconnect, respawn or new session on any unknown or refused outcome, `refused_busy` included.
   - Never treat a `None` applied state as success in HUMAN mode.
   - Add no new `RoastEventKind`.
   - T26 is `slow`+`serial` and must not rely on a scheduler-callback race.
   - The dev pin `coffee-roaster-mcp==0.2.4` lacks the tool. Do not bump it or add dependencies; discovery must report ABSENT against it.
   - Do not modify `cold_characterisation/*`.
7. **Fixtures and contracts to regenerate:** the FE event-payload contract fixture (if `DropReason` or payload keys are snapshotted) and the `enabled_actions` biconditional inputs. No MCP contract fixture changes.

## 8. Risk profile

**Blast radius.** This is roaster-command logic: drop, heat containment, recovery and resume gating. Failure modes would be:
- a missed protective drop;
- a double drop;
- heat resumed after an endpoint;
- routine heat written in a continuation turn;
- a blocked operator disposition.

Mitigations: human mode is unreachable until A2, C and L; AUTOMATIC behaviour parity is pinned (T52/T52b); emergency is unchanged. Data sensitivity is low, with no credentials and no new HTTP endpoint. The principal scope is the existing controller and MCP child, plus one exact-session MCP tool call per run.

**Break these first:**
1. A queued item, or its audit, dispatched or persisted before H2 (the `api.py:1370` trap).
2. A second telemetry read in a HUMAN turn (`controller.py:2617`/`:4621`).
3. A storage await before the latch or dispatch.
4. A drop site that skips the fence (S-2/S-2b, especially the fault-control terminal drop at `controller.py:604`).
5. Freshness renewed from session time, the raw count, a first observation, or `ABSENT` counters treated as zero.
6. `ContainmentAttempt` reset by re-entry, a respawn or a new session.
7. A `None`, malformed or timed-out result reaching a retry, clamp or `set_targets`.
8. Heating resume after an endpoint or HISTORY_UNKNOWN.
9. Routine writes in the continuation turn.
10. The fence leaking into `run_emergency_stop`.
11. A grammar bypass via bool-as-int, an out-of-row reason or an identity mismatch.
12. Discovery accepting a lookalike schema, or being treated as driver support.
13. Discovery or extraction reachable from AUTOMATIC.

**Residual risks retained for owner review.** These are visible to the owner and are not claims:
- A sync-blocked stdio child stops a second request, including an emergency one, from being serviced.
- The emergency retry can keep failing against MCP's unknown-reservation block, which shows up as visible `COMMAND_FAILED` events.
- Stale telemetry gives up the automatic drop, and the operator has to act.
- An emergency audit may come before H2 in the same turn.
- Neither an RPC return, a command state nor an emergency admission proves heat removal or evacuation.
- Producer freshness evidence is Hottop-only, and the mock's semantics are C's.
- No SDK qualification is inherited: the producer's Pydantic 2.14.1 is outside the Agent's `<2.14` bound, and T26 binds only to the resolved Agent environment.
- Placement/batch/thermal-state and recording collector ownership remains a later qualification dependency (§1 AC-12), not implied A1/C implementation scope.

## 9. Approval scope

The owner is asked to ratify this exact contract with two explicit delivery choices:

1. **Human-only fail-safe change:** at most one eligible exact-session fixed-zero containment attempt per run, preserving commanded fan/drum/cooling/solenoid. No ordinary heat/fan resend, refusal retry or generic fallback. The fan is therefore not automatically raised to the legacy overrun-safe setting by this HUMAN fail-safe. If containment is unavailable/refused, commanded heat removal is not proven; retain recovery/inhibition and show physical intervention. Unknown outcomes cannot retry or escape through a new child/run. Independent emergency and AUTOMATIC behaviour remain unchanged. Retaining ordinary HUMAN retries is not offered: it conflicts with ratified D230.
2. **Four serial PRs:** domain/safety, strict MCP consumer, controller/lifecycle integration, and safety-relevant UI. Accept the justified larger cohesive S3, with exact scope/size rechecked at kickoff. The matching Plan PR-plan amendment is prepared separately; apply it under approval before implementation. Source movement invalidates affected contract citations and requires per-slice refresh, not silent reuse.

Approval is for the proposed software contract and review units. It is not hardware/live authority, a completed implementation, a source-review waiver or a retrospective claim that the second planner run stayed within the packet. No worker starts before exact contract ratification and required identity/watermark checks. Current three source pins and issue body were refreshed on 11 November 2026 and remain unchanged; #1076 has no comments.

## 10. Provenance and final readiness

This proposal derives from the committed Claude story-planner role's two read-only handbacks, with explicit lead corrections L1–L11. It is not a fresh independent safety review of the final wording. The second run searched nine additional committed files inside the permitted Agent root beyond the original packet; that deviation remains recorded in `a1-planner-scope-deviation.json`. No out-of-root reads or writes were observed. The latest-CLI one-off exception is recorded separately, with no permanent version-rule change or full D219 qualification claim.

Before public posting or delegation: mechanically scan the exact final text for credential-shaped material, bind its SHA256, verify the maintainer posting identity and issue watermark, and refresh every source pin. The literal ratification provenance marker is added only after owner approval; this draft contains no ratified marker. Implementation must then pass full native validation, source-specific causal tests and independent routed reviews. No software delivery step is physical roast readiness.
