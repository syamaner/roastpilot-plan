> Owner-review copy: text-only story-planner output, with the independent safety review's required C1–C6 corrections folded into the numbered contract by the lead. Raw planner output and review remain immutable in `/private/tmp/a1-s3-am4-final-planning/result.md` and `/private/tmp/a1-s3-am4-final-safety/result.md`. The review verdict is PASS-with-lead-corrections, not an implementation pass. The private sticky flag explicitly covers all uncertain completion routes and prevents a later no-store refusal from clearing earlier uncertainty. Current implementation head `e2668b643042e985737c323b3f56d4758cd652cd` differs from the cited `f18f44c` only by tests; production identity was verified. These exact bytes are proposed for ratification, not yet authorised for implementation.

# A1 contract amendment AM-4 (corrected consolidation): HUMAN fault-drop outcomes, contradictory readback, completion barrier and completed-run drop refusal, fault-control projection (Agent #1076)

**Status: proposed, not ratified.** This text authorises no implementation, delegation, merge, live enablement or hardware action. No worker may use AM-4 until the owner ratifies these exact bytes.

**Supersession.** This text replaces the previous consolidated AM-4 proposal and every earlier draft in full.
- The C-2 choice (keep ISSUED/SETTLED after a contradictory readback) stays withdrawn.
- The safety-review suggestion to allow S3 drop evaluations queued before closure to commit after completion is **rejected**. §2.9 replaces it with the completion barrier the owner approved.
- Lead dispositions 1–11 and the owner-approved directions are folded into the numbered sections below. There are no appendices.

**Authority.** Authority comes from the owner only. Reviewer suggestions count only where the owner or lead adopted them.

The owner approved two directions on 15 November 2026, as supplied by the parent:
1. Refuse NEW HUMAN drops while finalisation is uncertain. Restore eligibility only after proven non-commit, and then subject to existing guards.
2. Settle S3 drop-evaluation persistence that has already started BEFORE completion commits.

Emergency stop and existing exact-session cooling remain available. The earlier approvals (post-finalisation refusal; affirmative contradictory readback becomes UNKNOWN) stand. These are directions, not contract ratification.

**Documents that stay authoritative** except where AM-4 explicitly amends them:

| Document | SHA-256 |
|---|---|
| Original A1 | `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f` |
| AM-1 | `360432547cb36bbe8cd8ce63131e047dc28bb1ac4d32f892f36757236f86a41a` |
| AM-2 | `5cd7ae775efc306d21f4e37452ddd8b11a34ddc5c6f92e03d2d7ac5cba6d3369` |
| AM-3 | `f9057dd9d9b7c99b7f1d6995f5b5d3b8ac9fc3f52e0cb053c0644975a21f0979` |
| AM-3 TE15 correction | `49fac6accf148efb9b41f4c559090d9b6e65cd3d02b3845fa12a7a5a4879df36` |

**Provenance.** This is text-only planner output. I used no tools, read no filesystem and ran nothing. Citations are parent-supplied packet line numbers ("@head"). No gate, test, review PASS, D219, hardware, readiness or release claim follows from this text.

---

## 0. Bindings, evidence and gates

| Binding | Value (as supplied by the parent) |
|---|---|
| Current source | `f18f44c21fe5a9538f040781beac20e1dfc80c91`. The parent verified it is production-byte-identical to `99daba9d44a2032ecf92cefc0ffefa2bb55e3f2b`, `2f02ba5eefa4977440510bcf415db528121d1868` and `6eba684bb89793d53e77c5f99ef095d350825a26`. "@head" cites these bytes. |
| Original S3 base (kept) | `e14af837ecf3c4c14c7cac1728d063952f805107` |
| Agent `origin/main` | `49edaab4`. It adds only five unrelated collector files; integration is deferred until before the final gate. |
| Plan (kept) | main `93806f4c1049b86b21c3309a5f3cba3982708b98`; AM-3 publication `4d8f533c0b635469eb3297f0fef732f69ea6ad94` (not a Plan-main merge) |
| Issue | #1076, `syamaner` / `OWNER`, body SHA-256 `48a60e43f3a22234c90757d02d71d2779a929cf8c52c2e0d35657a88519a472b` |
| Pre-AM-4 comments (all OWNER) | 6796642729 @ 2026-11-11T13:07:07Z; 6833383146 @ 2026-11-12T19:12:47Z; 6875804554 @ 2026-11-14T10:19:06Z; 6894208392 @ 2026-11-15T12:19:18Z; 6894426652 @ 2026-11-15T12:37:47Z |
| Watermark | As supplied: `b47c960be9848256ac820af6dc06b22e56ae91f04ef8779f7ef000cecd7c04c1`. The lead recomputes it using the comment 6796642729 encoding, excluding the AM-4 post. |
| F-IMM reproduction | `f-imm-synthetic.json` at `2f02ba5e`. Production identity with the current source is verified, so it binds to current production. |

**Evidence limits.**
- The executor body is now present at head (`controller.py:583-1027`), so the earlier E-1, E-2 and E-4 limits are resolved and removed.
- Remaining limits, which are not claims:
  - `max_age_s` is configuration that is not in the packet.
  - aiosqlite 0.22.1 `core.py` is in the safety-review packet; no AM-4 rule relies on cross-connection ordering.

**Gates before delegation.** All fail closed.
1. The owner ratifies these exact bytes.
2. The lead refreshes the issue, recomputes the watermark and verifies every hash.
3. At the S3 implementation head, the lead verifies each item below. Any failure returns `ESCALATE`, never a weakened design.
   - (a) `_TERMINAL_VERDICT_SEVERITY` ranks RECOVERY < FAULT < EMERGENCY_STOP with enum keys (`controller.py:446-449`).
   - (b) Under HUMAN authority, a missing or refusing HUMAN controller in the executor gives zero `write_fault_control(DROP_BEANS)` (`controller.py:960-967`). The executor carries the HUMAN hook only for HUMAN authority.
   - (c) A HUMAN fault drop passes no close reservation (`controller.py:2750-2755`). A held D212 or legacy finalisation reservation (`api.py:1795-1797`) therefore discards a queued drop before dispatch, and a superseding e-stop advances the generation.
   - (d) `_handle_completion` is called only from the runner's own loop task, after that tick's drain and controller tick have returned. S3 HUMAN-drop evaluations persisted on the runner task have therefore returned or raised before completion begins. A raised runner-task write follows existing runner persistence behaviour and is recorded in the TF20 census, not claimed settled.
   - (e) A finalised runner's emitter is never flushed again (`api.py:1433-1434`).
   - (f) Completion begins only with an empty registry, so no registered S3 drop-evaluation task is pending or unresolved when any route starts. The lead re-verifies against pinned aiosqlite 0.22.1 (`core.py:48-75`, `:116-132`, `:150-160`, `:199-214`) that a main-connection operation queued before `store.close` executes or fails before close returns while the loop runs, and that later calls raise `ValueError`. Loop-teardown behaviour, and sqlite3 discarding an open transaction on close, are not claimed.
4. The lead runs sweeps F-1 to F-12 (§4) and classifies every hit.

---

## 1. Acceptance criteria (proposed; inferred from the sources named)

**Sources.**
- Original §2.4 outcome table, H2/J/R/F, RD-1, and §2.7.
- AM-3 AM3-5/6/7/13 and TE5/14/25/26.
- Issue AC-8, AC-11 and the outcome row "stale completion cannot release latch or update newer run".
- Base #210.
- The owner directions in the header.

| ID | Criterion |
|---|---|
| AM4-1 | Only the valid-applied-state row (generation and lease current, dispatched, known applied) records ISSUED. An ISSUED drop makes no phase transition when either its admission phase or its completion phase is FAULTED. |
| AM4-2 | The S3 HUMAN FAULTED→COOLING branch in `can_transition` (`controller.py:2289-2298`) is removed. `TRANSITION_TABLE` is unchanged. |
| AM4-3 | **D-14.** A WITHHELD or UNKNOWN projection in FAULTED keeps the phase FAULTED and raises the latch monotonically. It still sets inhibition and still emits the existing physical-intervention RECOVERY_REQUIRED event. |
| AM4-4 | ORR, PRE_FC and DEVELOPMENT behaviour, supersession, joins, RD-1, ownership, lifecycle and the durable-closure guards are otherwise unchanged. |
| AM4-5 | An armed `_EMERGENCY_STOP_RETRY_RULE` retry survives every FAULTED-origin drop outcome. D212 finalisation leaves the phase FAULTED. |
| AM4-6 | Exact-session cooling, D212, e-stop and lease policy follow D-14a to D-14d. No path clears UNKNOWN. |
| AM4-7 | **D-15.** After a strict FAULT_CONTROL write and an ISSUED commit, an affirmative contradictory readback sets the endpoint and command to UNKNOWN. An unavailable or merely non-confirming readback keeps ISSUED/SETTLED. Every exit after ISSUED resolves the readback record exactly once. New lifecycle is refused while a record is outstanding. |
| AM4-8 | **C-1′.** Admission of a non-DROP fault action evaluates zero HUMAN-DROP or fence terms. Every evaluation of the DROP term is exception-safe and can only omit DROP or reject a DROP request. |
| AM4-9 | **D-16.** A HUMAN run that is durably closed, or whose completion has begun and has not been proven uncommitted, cannot authorise a new software DROP or append a new HUMAN drop evaluation. There is no raw-DROP fallback. |
| AM4-10 | **D-17.** Before any completion-persistence route is initiated (separate-connection D212 close, log export, or `complete_run`), HUMAN drop admission is closed atomically and every S3 HUMAN drop evaluation whose persistence was already registered has completed successfully; a cancelled await, a cancelled task or a raised task never counts as settlement. |
| AM4-11 | The AM-3 TE5 test row is corrected (§2.10). Production shutdown and cancellation semantics are unchanged. |
| AM4-12 | No change to shared enums, wire payloads, routes, request or response models, SSE shape, schema, store, adapter, producer, `human_protection.py`, `human_run_ownership.py`, `safety.py`, `COMMAND_PHASE_MATRIX` or AUTOMATIC behaviour. No new `RoastEventKind`. No reconciliation, retry, redrop, timeout, global DB lock or general task framework. |

---

## 2. Spec

### 2.1 Facts @head (the implementer re-verifies each)

**Drop path.**
- The edge branch is at `controller.py:2289-2298`.
- `_execute_human_drop` latches ADMITTED at `:4055-4057` and swallows `Exception` as UNKNOWN at `:4099-4101`.
- ISSUED is set and `transition_to(COOLING)` called at `:4122-4137`.
- `_project_human_drop_recovery` is at `:4151-4161`.
- `execute_human_fault_drop` joins at `:4023`, persists at `:4028` and rechecks at `:4029-4035`.
- The executor HUMAN hook is at `:960-967`. It traces `failed` on a hook raise (`:975-979`) and `not_completed` on a non-dispatch or supersession (`:980-991`, `:1074-1076`). Readback is at `:992-1027`.

**Completion.**
- `_handle_completion` is at `api.py:1992-2167`.
- The D212 close capability is the bool wrapper at `:5515-5531` over the result method at `:5533-5673`.
- The atomic store close runs on a dedicated `BEGIN IMMEDIATE` connection (`store.py:2076-2163`).
- `complete_run` and `record_safety_evaluation` use the main connection (`store.py:3087-3117`, `:2601-2631`).
- Lease opens are strictly monotone (`store.py:2001`, `:2030`).

**F-IMM.** A D212 superseded by an e-stop finalises FAULTED with the lease OPEN (`api.py:2104-2119`, `:2159-2161`). The runner stays bound. The run-id-free completed-run branch (`:4808-4867`) reaches the executor and then `persist_evaluation`. The synthetic run records the tick-0 and tick-4 evaluations and an ISSUED endpoint on a durably closed run.

**Restart.**
- `recover_on_start` returns early for a completed run (`api.py:6457-6458`), so a completed run does **not** become HISTORY_UNKNOWN.
- A live serve process starts with restart clearance REQUIRED (`:3056-3062`), and Start refuses until it is CLEARED (`:5783-5787`). That is a separate, existing fence.
- Recovered active runners reach HISTORY_UNKNOWN through `_mark_human_restart_unknown` (`controller.py:6229-6235`) with no intervening await.

### 2.2 Valid-applied-state row (replaces the original §2.4 row)

> **Valid applied state** (generation and lease current, dispatched, known applied) → ISSUED, with the reason and `target_outcome` unchanged. Then:
> - **(a)** If the admission phase (captured synchronously at the ADMITTED latch) or the completion phase is FAULTED, make no phase transition. The phase is left as found; it is never forced to FAULTED.
> - **(b)** Otherwise, if the run is not durably closed, transition to COOLING (unchanged).
>
> For FAULT_CONTROL, "known applied" means the strict write returned normally. Its readback is classified under §2.5.

**D-13.** Rule (a) applies to every owner. PROTECTION and OPERATOR are admitted only in PRE_FC or DEVELOPMENT, so their reachable behaviour is unchanged.

### 2.3 WITHHELD/UNKNOWN projection in FAULTED (D-14; unchanged from the approved direction)

| Step | Current phase FAULTED | Any other phase |
|---|---|---|
| Inhibition | set | set |
| Phase | no transition | unchanged |
| Latch | the more severe of the existing latch and RECOVERY, compared through `_TERMINAL_VERDICT_SEVERITY` with enum keys; `None` becomes RECOVERY | RECOVERY |
| RECOVERY_REQUIRED | existing kind and payload | unchanged |

**Sub-decisions.** Each is a disclosed consequence of keeping FAULTED, not new policy.
- **D-14a.** Under UNKNOWN, executor START_COOLING and STOP_COOLING keep their base lease admission.
- **D-14b.** Under UNKNOWN, the live D212 NON_HEAT stop write is refused (`controller.py:2669-2672`). D212 records the existing `stop_unconfirmed` reason even though nothing was dispatched (`api.py:1853-1862`).
- **D-14c.** A no-write D212 may close the run when its existing proof allows. UNKNOWN survives closure and blocks new lifecycle.
- **D-14d.** A durably closed run that is WITHHELD/SETTLED is not unresolved. A later explicit Start may follow while the physical-intervention projection remains.

S4 renders the phase only from the server snapshot.

### 2.4 Generation cases during the drop await

| Case | Disposition |
|---|---|
| G-1: current; FAULTED at admission and completion | §2.2, §2.5 and D-14 |
| G-2: current; ORR or active phase | unchanged |
| G-3: e-stop or lease generation advanced | existing supersession row (`controller.py:4103-4113`); a known-applied dispatch stays IN_FLIGHT and lifecycle stays blocked |
| G-4: current generation but the phase changed during the await | white-box only (gate 3(c), shared arbiter) |

### 2.5 Strict-write readback (D-15)

**Scope.** HUMAN, owner FAULT_CONTROL, a G-1 ISSUED commit.

**Record.** In the same synchronous step that sets ISSUED, the controller stores the private `_FaultDropReadback(run, session_id, generation)`:
- `run` is the ownership object, compared by identity.
- There is at most one record per run, and it is never persisted.

**Readback classes.**

| Class | Definition |
|---|---|
| CONFIRMS | The existing DROP confirmation predicate holds (`controller.py:1044-1064`). |
| CONTRADICTS | The readback is a `FaultControlState` with `session_id ==` the record's session, `type(beans_dropped) is bool` and `beans_dropped is False`. This holds regardless of `mcp_phase` or `device_connected`, and that is deliberately fail-closed. |
| UNAVAILABLE | Everything else: no readback, an exception, a timeout, `CancelledError` (re-raised afterwards), or a non-confirming state that does not contradict. |

The production port raises on a session mismatch or a disconnected device and always builds `beans_dropped` as a bool (`mcp_client.py:1542-1562`). Test rows for "session mismatch" and "non-bool" are therefore **white-box only**. Whether the MCP readback reflects the drop immediately is routed to `mcp-contract-checker`. No physical confirmation is claimed.

**Resolver.** The executor's HUMAN branch captures `controller` once (`:961`). It wraps everything from the hook call to its return or raise in `try/finally`, and the `finally` calls `controller.resolve_fault_drop_readback(session_id, observed)` exactly once.
- `observed` is the readback state if one was obtained, otherwise `None`.
- The resolver is never re-selected through `_human_fault_drop_controller`.
- The resolver is synchronous: no await, no I/O, no MCP call.

This covers every exit after ISSUED: a hook raise, generation or reservation lost before readback (`:980-991`), a readback raise, non-confirmation, confirmation, and cancellation.

**Resolver effect.**
1. Take the record and clear it unconditionally.
2. **No-op cases:** no record; `not ownership.is_current(record.run)`; the session differs; the endpoint is not ISSUED; or the owner is not FAULT_CONTROL.
3. **On CONTRADICTS:**
   - set the endpoint and command to UNKNOWN;
   - if the run is neither durably closed nor closing (§2.8), emit the existing `COMMAND_FAILED {"command":"drop_beans","outcome":"unknown"}`, and, only if the arbiter generation still equals `record.generation`, run `_project_human_drop_recovery()` (which applies D-14);
   - otherwise change in-memory state only.
4. **CONFIRMS or UNAVAILABLE:** no change.

No retry, redrop, containment, reconnect, respawn or Start happens on any path.

**Lifecycle.** `_require_unblocked_human_lifecycle` refuses while the current controller holds a record (D-4: refuse, do not wait). D212 closure itself is not blocked.

**No shared lifetime guard.** The parent's D216 source proof shows a recovered runner cannot reach ISSUED: it reaches HISTORY_UNKNOWN before publication, and the join refuses. Start's last admission check comes before respawn and `mcp.stop`. No third pending-call member and no shared readback lifetime guard are added.

**Route expectations.** API strings and trace names are frozen.

| Outcome | Endpoint / command / phase | Executor trace | R1 per-run OPEN lease (`api.py:7869-7897`) | R2 run-id-free, live run |
|---|---|---|---|---|
| Closure refusal (§2.8) | NONE / unchanged / FAULTED | `not_completed` | `failed` | `rejected` |
| Hook persistence raised before admission | NONE / unchanged | `failed` | `failed` | `rejected` |
| Write raised or timed out (swallowed at `:4099-4101`) | UNKNOWN / UNKNOWN / FAULTED (D-14) | `not_completed` | `failed` | `rejected` |
| Superseded before completion (G-3) | existing row (IN_FLIGHT if dispatched) | `not_completed` | `failed` | `rejected` |
| ISSUED, then generation or reservation lost before readback | ISSUED / SETTLED / FAULTED | `not_completed` | `failed` | `rejected` |
| CONFIRMS | ISSUED / SETTLED / FAULTED | `read_back` | `accepted` | `accepted` |
| Readback raised | ISSUED / SETTLED / FAULTED | `readback_failed` | `failed` | `rejected` |
| Non-confirming, not contradicting | ISSUED / SETTLED / FAULTED | `rejected_readback` | `failed` | `rejected` |
| CONTRADICTS | UNKNOWN / UNKNOWN / FAULTED (D-14) | `rejected_readback` | `failed` | `rejected` |

Cancellation keeps its base propagation, and no trace is asserted for it. The run-id-free completed-run route (R3) is unreachable for HUMAN under D-16. The join, not the executor's `beans_dropped` pre-check, is what prevents a duplicate drop.

### 2.6 Fault-control admission and DROP projection (C-1′)

- **P1. Non-DROP admission.** Admission at `api.py:4771-4772` for any action other than DROP_BEANS makes zero evaluations of `_human_fault_drop_controller`, `human_recovery_drop_allowed`, `_human_actuation_admitted`, `closed_reason` or `_teardown_unconfirmed`.
- **P2. Guarded DROP term.** Every HUMAN DROP-term evaluation goes through one synchronous guard. The guard catches `Exception`, returns "not enabled" and logs no values. It applies to `:4771`, to per-run DROP admission (`:7645-7646`, which returns the existing rejected reason), to response projections, and to `_human_recovery_actions` (REST detail and SSE). An exception omits DROP only.
- **P3. Responses.** A response projection is computed only after the outcome is determined, and it never changes that outcome.
- **P4. Emergency.** Admission, reservation, dispatch, retry and result determination keep zero fence reads.
- **P5. AUTOMATIC.** Unchanged.

### 2.7 Edge removal, §2.4-R and AM-3 TE26

- **Edge.** Delete the HUMAN branch. Add no replacement.
- **§2.4-R addition.** "A FAULTED-origin recovery drop under rule (a) issues without a phase transition. Its readback follows §2.5, and a WITHHELD or UNKNOWN projection from FAULTED follows D-14."
- **AM-3 TE26.** "Existing WITHHELD" now means phase FAULTED, latch per D-14, with inhibition and the event present.
- **AM-3 TE17, TE22 and TE23** are unchanged.

### 2.8 Completed-run and uncertain-finalisation HUMAN DROP refusal (D-16)

**Closure predicate.** `human_drop_closed()` is `run.durably_closed or self._human_closure_started`.
- `_human_closure_started` is a private controller marker.
- It is set only by `begin_human_completion()` (§2.9).
- It is cleared only by `clear_human_completion_after_proven_non_commit()`, which the runner calls only on `PROVEN_NOT_COMMITTED` (below).

**Refusal points.** Each refuses with no latch, no event, no containment, no MCP call and no evaluation.
1. The P2 DROP term returns false.
2. `human_recovery_drop_allowed` (`controller.py:4000-4011`) returns false.
3. The **first statement** of `execute_human_fault_drop` returns False, before the join at `:4023` and before registration or persistence.
4. **First term** of the post-persist recheck (`:4029-4035`), before the join at `:4033`.
5. The R3 completed-run branch (`api.py:4808-4867`): under HUMAN, DROP_BEANS returns the existing `failed` "exact terminal fault control is unavailable" **before** `executor.execute`.
6. In the executor, a `None` or refusing HUMAN controller gives zero writes. This is a pin test only; per gate 3(b), no production hunk is needed.

**Typed close result.** This is private to `api.py` and owned by the runner as consumer. No shared model changes.

```python
class _FinalisationCloseEvidence(Enum):   # plain Enum, closed, private
    COMMITTED = auto()
    PROVEN_NOT_COMMITTED = auto()
    UNCERTAIN = auto()
```

- The body of `_close_current_fault_lease_for_acknowledgement_result` moves into a private classified helper that returns `(FaultControlCloseResult, _FinalisationCloseEvidence)`.
- The existing `_result` method returns element `[0]`, and the existing bool wrapper returns `.historically_committed`. Both stay byte-for-byte behaviourally identical for their existing callers.
- A new private capability, `_close_current_fault_lease_for_finalisation`, returns the evidence and is wired as the runner's `fault_lease_close` (`api.py:1064-1066`, `:6262`).

| Branch @head | Evidence |
|---|---|
| `:5548-5551`, finalisation not started (no store call; white-box) | PROVEN_NOT_COMMITTED |
| `:5552-5556`, lease not OPEN or generation < 1 (no store call) | PROVEN_NOT_COMMITTED |
| `:5558-5561`, generation mismatch (no store call) | PROVEN_NOT_COMMITTED |
| `:5562-5570`, identity mismatch or `None` (no store call) | PROVEN_NOT_COMMITTED |
| `:5585-5599`, not committed **and** a fresh read shows the exact same OPEN lease (atomic close connection already closed; monotone generations) | PROVEN_NOT_COMMITTED |
| `:5578-5584`, store raised or returned `None` | UNCERTAIN |
| `:5605-5630`, verification unavailable and re-verify not committed | UNCERTAIN |
| `:5631-5635`, any other durable shape | UNCERTAIN |
| any exception escaping the capability | UNCERTAIN (marker kept; base propagation) |
| historically committed (`:5636-5673`, including stale-generation and unconfirmed-commit rows) | COMMITTED |

**Clearing rules.**
- `False` never implies rollback. Only the five PROVEN rows may clear the marker, subject to the following sticky-uncertainty rule.
- PROVEN_NOT_COMMITTED clears the marker only if no completion attempt since the marker was last set returned UNCERTAIN or raised from the capability. Otherwise the marker stays for the runner's lifetime.
- A private `_human_completion_uncertain: bool`, initially false, records that condition monotonically. Any uncertain result or exception from a completion-persistence route sets it; a later no-store refusal or rollback of a different attempt never clears it. This includes ordinary completion paths whose marker must never be cleared on exception. Clearing the closure marker requires this flag to be false; no automatic reconciliation is introduced.
- `complete_run` and `_export_logs` paths never clear it. Either completion succeeds and the run finalises, or the marker stays.
- On UNCERTAIN, the existing failure branch runs with its existing reason strings and the marker **stays set**. The run remains live-faulted, new HUMAN drops are refused, and e-stop, exact-session cooling and D212 stay available. No new reconciliation is added.
- Eligibility after a proven non-commit returns only through the existing guards.

**Preserved.**
- A drop whose operation has started completes and is classified as before.
- Queued dispatches are discarded by the finalisation reservation or by the generation (gate 3(c)).
- UNKNOWN ownership, exact-session e-stop, cooling, D212, lease and D216 policy are unchanged.
- AUTOMATIC keeps base behaviour, including raw DROP on completed runs.

> **OPERATIONAL CONSEQUENCE (the owner accepts it by ratifying).** In HUMAN mode a new terminal software drop is unavailable once a run is durably closed, while completion persistence is in progress, and after any uncertain finalisation, for the rest of that runner's life. The main case is a D212 superseded by an e-stop, which leaves the run completed and FAULTED with the lease OPEN. Base and AUTOMATIC still offer that drop. E-stop, exact-session cooling, D212 and physical intervention remain. DROP disappears from the projection without a new explanatory field. This text authorises no hardware action; a stranded drum may need manual evacuation.

### 2.9 Completion barrier (D-17)

**Scope of evaluations covered.**
- The barrier covers S3-introduced HUMAN drop safety evaluations whose persistence can overlap `_handle_completion`. That is the `human_recovery_drop` evaluation persisted by `RoastController.execute_human_fault_drop` (`controller.py:4028`).
- Its only caller is `FaultControlExecutor._execute_one` (`:960-967`), which runs on the executor worker task. That worker is reached from R1 (`_submit_open_fault_lease_action`, `api.py:7869-7878`) and from R2 (run-id-free live route through `submit_operator_action`, `:4896`). R3 is refused under D-16 point 5.
- S3 drop evaluations persisted on the runner task have returned or raised before completion begins (gate 3(d)). A raised runner-task write follows existing runner persistence behaviour and is recorded in the TF20 census, not claimed settled. These paths are the operator recovery drop and the buffered protective-drop evaluations flushed in `_finish_human_turn`.
- If sweep F-10 finds any other S3 HUMAN-drop `persist_evaluation` call off the runner task, that call must use the registry below, or the slice returns `ESCALATE`.

**Not covered, and not claimed fixed.** These are recorded in the TF20 census only:
- the base executor tick-0 admission evaluation, recorded in the caller's task (`controller.py:657`);
- executor command traces;
- operator-action audits;
- `_record_fault_acknowledgement_failure`;
- uncommitted statements left on the shared main connection by a cancelled base write;
- tick attribution: task-based `StoreSnapshotSink._tick()` is read on the task's first step and can be one tick later than the former synchronous call. The census records this; no timestamp accuracy claim is added.

**Ownership.** Each HUMAN controller owns one private set, `_human_drop_evaluation_tasks: set[asyncio.Task[int | None]]`, and the marker. Neither is shared across runners. AUTOMATIC never creates or reads them.

**Registration (inside `execute_human_fault_drop`; one synchronous segment).**
1. Refusal point 3 runs first. If `human_drop_closed()`, return False.
2. Join check (existing).
3. Build the evaluation (existing).
4. `task = create_task(self._snapshots.persist_evaluation(evaluation))`. Add it to the set, and attach a done-callback that retrieves the exception or result when the task is not cancelled. The callback logs no values and **never removes** the task from the set.
5. Only now, `await asyncio.shield(task)`.

There is no await between the closure check and registration, so no request can register after closure.

**Settlement and removal.**
- If the hook's await returns normally, the hook removes the task with `set.discard` (the barrier may already have removed it), then runs refusal point 4 and the existing recheck.
- If the hook's await raises a non-cancellation `Exception`, the hook does **not** remove the task and re-raises at once (base propagation: trace `failed`, endpoint NONE). It never runs the recheck and never dispatches.
- If the hook's await is cancelled, the hook does **not** remove the task and re-raises `CancelledError`. The task keeps running under the shield.
- AM-4 code never cancels a registered task.

**Barrier (inside `_handle_completion`, HUMAN only).** The order is:
1. All existing checks through `api.py:2045`.
2. For D212, the synchronous `None` guards (`:2053-2055`). If any fails, take the existing failure branch with **no** marker set, because nothing was initiated.
3. `controller.begin_human_completion()` sets the marker synchronously and idempotently. This is the atomic close of admission.
4. `settled = await controller.settle_human_drop_evaluations()`:
   - Snapshot the set. If it is empty, return True **without awaiting**, so base timing is unchanged.
   - Otherwise `await asyncio.wait(snapshot)`. There is no timeout. It never cancels children or raises their exceptions.
   - Discard every snapshot task that is done, not cancelled and whose `exception()` is `None`. A raised task is retained as unresolved, because a failed COMMIT can leave its INSERT open on the main connection (`store.py:2610-2628`).
   - Return True only if the set is empty.
5. If not settled (a retained task was cancelled externally, white-box, or raised):
   - Do not initiate completion and keep the marker.
   - D212: take the existing failure branch with its existing reason computation.
   - COMPLETE or legacy FAULTED: return False.
   - Later attempts re-run the barrier and stay unsettled for the runner's lifetime.
6. Only after the barrier, initiate exactly one route:
   - D212: the typed capability, handling evidence per §2.8;
   - COMPLETE: `_export_logs`, then `complete_run`;
   - legacy FAULTED: `complete_run`.

**Cancellation.** If the runner task is cancelled during step 4, `CancelledError` propagates. Completion is not initiated and the marker stays set, with no early release. Retained tasks finish and are consumed by their done-callbacks.

**Re-entrance.** The marker and the barrier are idempotent. While the marker is set, the set can only shrink. A proven non-commit clears the marker only under the sticky-uncertainty rule in §2.8, which allows new registrations until the next completion attempt sets it again. Only the hook's success path and the barrier's discard remove tasks. Setting or clearing the marker, the done-callback and cancellation never touch the set.

**What is not changed.**
- The barrier never touches e-stop, executor cooling, the arbiter or the close reservation.
- A registered drop whose evaluation settles after closure is refused at point 4 before ADMITTED or the join. It emits no controller event, and its base executor trace is a census item.

**Disclosed effect.** A hung main-connection evaluation write now also delays D212 finalisation, which base did not wait for. `complete_run` already queues behind such a write. Bounding storage remains A2's job under AC-6; no timeout is added.

A raised S3 drop-evaluation write makes every HUMAN completion route unavailable for that runner. E-stop and exact-session cooling remain. The existing recovery path is process restart and restart clearance; an active prior run enters HISTORY_UNKNOWN and uses D216 End. This describes existing software recovery, not authority to restart hardware or a claim of live admission. No rollback, reconciliation or retry is added.

**Rejected alternative.** "Census evaluations initiated before the marker and allow them to commit after completion" is rejected, as the owner directed.

### 2.10 AM-3 TE5 test-row correction (tests only)

**Facts @head.**
- `_cleanup_step` catches `Exception` only (`cli.py:1150-1154`). E1 shields teardown and re-raises absorbed outer cancellation afterwards (`cli.py:876-893`).
- In `shutdown`:
  - E4 closes the fence at `api.py:6657`.
  - The awaits at `:6663` and `:6668` suppress only `CancelledError`.
  - The closure-end shield at `:6672-6676` re-raises the teardown task's own cancellation.
  - The loop is cancelled at `:6682`.
  - The detached loop re-raises at `:6690-6694`.
- Heat-off failures are caught at `:6583` and `:6604`.
- The `_admit_shutdown_emergency_stop` `RuntimeError` (`:6624`) arms no retry. A raising or timed-out e-stop does arm the preserved retry (`controller.py:5127-5157`, `:5416-5424`).

**Replacement GE5/TE5 row.**

| Guard | AM3 | Test | Mutation that must fail |
|---|---|---|---|
| GE5 | 5 | **TE5a.** An `Exception` at `:6663` or `:6668`, alone or with a heat-off failure. The loop survives into `mcp.stop` with the session attached and `stop_unconfirmed` false. That loop makes zero READ/CONTAINMENT RPCs and zero guarded dispatches except the exact flagged emergency retry. The flagged retry and NON_HEAT follow base policy with zero new fence reads. The fence stays closed. **TE5b.** A standalone heat-off failure, then a successful `shutdown`. The fence is closed throughout. A tick before `:6682` makes zero READ/CONTAINMENT and zero guarded dispatches, **except** the flagged retry where a raising or timed-out e-stop armed it. In the `:6624` variant no retry fires. The loop is cancelled, and survival is not asserted. **TE5c.** Outer cancellation of the E1 task while `_teardown_live` is suspended. The fence is closed before `create_task`, teardown completes under the shield, `CancelledError` surfaces after the exit guard, and zero READ/CONTAINMENT occur. **TE5d.** Cancel the teardown task itself while it is suspended at the closure-end shield (`:6672`). `CancelledError` propagates from `:6676`, the fence stays closed, and zero RPCs occur. The test pins this suspension point, because suppression applies at `:6663`, `:6668`, `:6684` and `:6703`. | Removing close sites; reopening on failure; fencing the flagged retry; changing shutdown or cancellation semantics. |

### 2.11 Explicit amendments to prior contracts

| Item | Amendment |
|---|---|
| Original §2.4 outcome table | §2.2, §2.3, §2.5 |
| Original §2.4-F/J/R | D-16 refusals, placed before the join; the join is unchanged |
| Original §2.7 | Also refuse while a `_FaultDropReadback` is outstanding |
| Original completion ordering | D-17 barrier precedes every HUMAN completion route |
| AM-3 AM3-6/7, TE14, invariant 12 | P1 to P4 |
| AM-3 TE5 | §2.10 |
| AM-3 TE24 | Drop results ISSUED per §2.2, then §2.5 |
| AM-3 TE26 | §2.7 |
| AM-3 §7 "application edits expected" | Limited to §2.12 |

### 2.12 Permitted hunks (closed set)

**`controller.py`:**
- delete the edge;
- capture the admission phase and apply rule (a);
- add the D-14 branch;
- add `_FaultDropReadback`, `resolve_fault_drop_readback` and the outstanding accessor;
- add the marker, the private sticky uncertainty flag, `begin_human_completion`, `clear_human_completion_after_proven_non_commit` and `human_drop_closed`;
- add the evaluation-task set, the registration in `execute_human_fault_drop` and `settle_human_drop_evaluations`;
- apply refusal points 2 to 4;
- add the executor HUMAN-branch `try/finally` resolver on the captured controller.

**`api.py`:**
- add `_FinalisationCloseEvidence`, the classified helper and the finalisation capability (the bool wrapper and `_result` are unchanged);
- change the runner's `fault_lease_close` type;
- reorder `_handle_completion` (marker, barrier, route, clear only on PROVEN);
- apply the P1/P2 guard in `_fault_controls_projection`, `submit_fault_controls_action` (including the R3 refusal), per-run DROP admission and `_human_recovery_actions`;
- allow `_human_fault_drop_controller` to return `None` on closure;
- add the readback-outstanding term to `_require_unblocked_human_lifecycle`.

Nothing else is permitted.

---

## 3. Tests and causal controls (S3; hardware-free)

**Files.** `tests/test_controller_human_mode.py`, `tests/test_runner_human_turn.py`, `tests/test_human_admission_fence.py`. Rows marked white-box use synthetic states.

| Guard | AM4 | Test | Mutation that must fail |
|---|---|---|---|
| GF1 edge removed | 2 | **TF1.** For each owner × endpoint, with source FAULTED, FAULTED→COOLING is false. Rewrite `test_controller_human_mode.py:380-400`. | Restoring the edge. |
| GF2 FAULT_CONTROL ISSUED | 1 | **TF2.** G-1 with CONFIRMS: ISSUED, phase FAULTED, one `COMMAND_EXECUTED`, R1 `accepted`, lease OPEN at the same generation, zero heat/fan. Rewrite T44. | `transition_to(COOLING)`. |
| GF3 / GF4 rule (a) | 1, 4 | **TF3.** Admitted in FAULTED stays FAULTED; ORR admitted and completed gives COOLING. **TF4** (white-box G-4): admission in ORR then forced FAULTED; admission in FAULTED then forced to another phase; admission in PRE_FC then forced FAULTED. No raise and no forced FAULTED. | Admission-only rule; completion-only rule; forcing FAULTED. |
| GF5 retry preserved | 5 | **TF5.** Each outcome {ISSUED, WITHHELD, UNKNOWN} with one arming source, plus each arming source once with ISSUED (linear, not Cartesian). The fence or teardown flag is set during the started write or the arbiter wait. The next terminal tick runs exactly the flagged `set_heat(0)` and then the existing fan write. An ordinary HUMAN heat-zero is refused. | Restoring the edge or ORR; fencing the retry; widening the exemption. |
| GF6 post-ISSUED lifecycle | 6 | **TF6.** The projection never offers DROP. D212 finalises with phase **FAULTED**. Start is admitted only after the record clears. | COOLING; Start while a record is outstanding. |
| GF7 no redrop | 6 | **TF7.** After ISSUED or UNKNOWN, every route makes zero writes and records the join. | Removing the join. |
| GF8 readback classes | 7 | **TF8.** Every §2.5 route row, with frozen strings. CONTRADICTS (including `mcp_phase` not fault) gives UNKNOWN/UNKNOWN with D-14, and Start stays refused, including after a no-write D212. UNAVAILABLE (raise, timeout, cancellation re-raised) keeps ISSUED/SETTLED. Session-mismatch and non-bool rows are white-box. Zero added MCP calls. | A contradiction kept ISSUED; an exception mapped to UNKNOWN; any retry. |
| GF9 resolver | 7 | **TF9.** The resolver is called exactly once on each exit after ISSUED, including supersession before readback and cancellation, always on the captured controller (selector forced to return `None` afterwards). It is a no-op for: no record, another run object, the same session on a new run (ABA), endpoint not ISSUED, generation advanced (UNKNOWN set, no projection), durably closed (silent). An outstanding record refuses the service Start, the HTTP delegate and runner construction, with zero `mcp.stop`. A recovered HUMAN runner receiving an R1 DROP gets the join refusal, zero evaluations, zero writes and no record. | Re-selecting the controller; skipping the `finally`; keying on the session string; projecting after an e-stop. |
| GF10 supersession | 4 | **TF10.** G-3 known-applied leaves IN_FLIGHT and lifecycle blocked. | Reclassifying as ISSUED. |
| GF11 emergency order | 8 | **TF11.** Every e-stop route from ISSUED, WITHHELD and UNKNOWN, closed and open: zero fence reads before the outcome. A raising P2 guard leaves the result unchanged. | A read before dispatch; a propagated raise. |
| GF12 / GF13 C-1′ | 8 | **TF12.** Cooling and live/terminal D212 with the fence closed: a spy records zero DROP-term reads. An injected raise in a DROP-term dependency leaves admission unaffected. **TF13.** A raising DROP term: DROP admission `rejected`; per-run DROP gets its existing reason; SSE omits DROP and keeps streaming. | An unguarded or misplaced read. |
| GF14 to GF17 D-14 | 3, 4, 6 | **TF14.** WITHHELD from freshness loss, a closed fence, teardown unconfirmed, and a drop admitted before the D212 reservation and then discarded: FAULTED, inhibition, event, RD-1 at most once; D-14d Start admissible afterwards. **TF15.** Latch {E_STOP, FAULT, RECOVERY, None (white-box)} → {E_STOP, FAULT, RECOVERY, RECOVERY}. **TF16.** UNKNOWN and D-14a to D-14c. **TF17.** Projections outside FAULTED are unchanged. | Restoring ORR; an unconditional RECOVERY latch; clearing UNKNOWN. |
| GF18 F-IMM refusal | 9 | **TF18.** The synthetic superseded-D212 state: DROP absent; R3 returns the existing `failed` with zero executor calls, zero tick-0 and tick-4 evaluations, zero writes, endpoint NONE, timeline delta 0. Points 2 to 4 each hold with the others removed. Points 3 and 4 emit no join event. E-stop, cooling and D212 keep base behaviour. A write already started completes and is classified. AUTOMATIC matches base. | Removing any point; a join before the closure check; a raw fallback. |
| GF19 typed close result | 9 | **TF19.** Each PROVEN row (four pre-store branches, plus not-committed with an exact OPEN re-read), with no prior sticky uncertainty, clears the marker, and a later DROP follows existing guards. Each UNCERTAIN row and a `complete_run` raise keep the marker: DROP refused, no new reconciliation. UNCERTAIN or a completion-route exception, then a later pre-store PROVEN or rollback of a different attempt, keeps the marker. The bool wrapper and `_result` return base values on every branch. | Clearing on any `False`; clearing on UNCERTAIN; changing wrapper results. |
| GF20 barrier ordering | 10 | **TF20.** Hold the S3 evaluation commit (a store spy blocks `record_safety_evaluation`), then start completion via (i) D212, (ii) COMPLETE export plus `complete_run`, (iii) legacy FAULTED. The marker is set before the barrier await. No completion route is initiated until the held write succeeds. The ordering spy shows the evaluation commit before the first completion statement on every route, including the separate D212 connection. The held drop is refused at point 4 with zero ADMITTED, zero writes and zero join events. A census shows AM-4 hunks add zero post-completion writes; base audits are recorded, not asserted. | Setting the marker after the barrier; initiating before settlement; relying on connection ordering instead of task completion. |
| GF21 registration atomicity | 10 | **TF21.** With the marker set, a new request registers zero tasks and makes zero persistence calls and zero events. An empty set means the barrier performs zero awaits. AUTOMATIC never calls it. | Registering before the closure check; awaiting on an empty set. |
| GF22 cancellation safety | 10 | **TF22.** (a) Cancelling the hook's await while persistence is held: the task is retained, the barrier still waits, then completion proceeds, and the loop exception handler records nothing. (b) Cancelling the runner during the barrier: `CancelledError` propagates, completion is not initiated, the marker stays set, and the retained task finishes and is consumed. (c) Persistence raises, including at COMMIT after the INSERT: task retained, barrier False, no route initiated, D212 takes its existing failure branch, marker kept on re-attempt; hook re-raises, trace `failed`, endpoint NONE, zero dispatch; the done-callback retrieves the exception. (d) White-box retained task cancelled: unsettled, no completion, D212 takes its existing failure branch, marker kept on re-attempt. | Counting a cancelled await or raised task as settled; recheck or dispatch after a persistence raise; removing the task from the set in its done-callback; releasing early. |
| GF23 AUTOMATIC parity | 12 | **TF23.** T52/T52b and #210 are green; zero new awaits or fence reads in AUTOMATIC. | Any HUMAN leak. |
| GE5 | AM-3 | TE5a–d (§2.10) | As in §2.10. |

**Causal controls.** One control is required for each new or changed guard: GF1, GF3/4, GF8, GF9, GF12, GF13, GF14, GF15, GF16, GF18, GF19, GF20, GF21, GF22 and the changed TE5 rows. TF5 witnesses the restore-edge and restore-ORR mutants.
- Stop on the first invalid witness and preserve it.
- Restore by `cp` with hash verification.
- Never rerun the original 42 or unchanged controls.
- Receipts stay bound to their heads.

---

## 4. Class sweep (in `{IMPL_WORKTREE}`; classify every hit)

| ID | Command | Expected after AM-4 |
|---|---|---|
| F-1 | `rg -n 'transition_to\(RoastPhase\.(COOLING\|OPERATOR_RECOVERY_REQUIRED)\)' src/roastpilot_agent/controller.py` | None reachable from FAULTED on a HUMAN drop or projection path |
| F-2 | `rg -n -e 'UNIVERSAL_TARGETS' -e 'TERMINAL_LATCH_PHASES' -e '_TERMINAL_VERDICT_SEVERITY' src/roastpilot_agent/controller.py` | Severity order holds; no HUMAN `can_transition` branch |
| F-3 | `rg -n -e '_pending_fail_safe = None' -e '_pending_fail_safe_is_emergency_stop_retry = False' -e '_latched_verdict = ' src/roastpilot_agent/controller.py` | No new clears; one monotone D-14 write |
| F-4 | `rg -n -e '_project_human_drop_recovery\(' -e '_human_drop_unknown\(' -e '_enter_human_recovery\(' -e 'EndpointDisposition\.WITHHELD' src/roastpilot_agent` | A FAULTED caller that needs ORR means `ESCALATE` |
| F-5 | `rg -n -e '_human_actuation_admitted' -e 'human_recovery_drop_allowed' -e '_human_fault_drop_controller' -e 'closed_reason' -e '_teardown_unconfirmed' -e '_human_recovery_actions' src/roastpilot_agent` | DROP-term hits only behind P2; none in non-DROP or emergency admission |
| F-6 | `rg -n -e 'durably_closed' -e '_human_closure_started' -e 'human_drop_closed' -e 'controller_for_human_fault_drop' src/roastpilot_agent` | Set and clear sites are exactly §2.8 and §2.9 |
| F-7 | `rg -n -e 'resolve_fault_drop_readback' -e '_FaultDropReadback' src/roastpilot_agent` | One creation at ISSUED; one `finally` call; one lifecycle accessor |
| F-8 | `rg -n 'beans_dropped' src/roastpilot_agent/controller.py src/roastpilot_agent/api.py` | The CONTRADICTS predicate appears only in the resolver |
| F-9 | `rg -n -e '_fault_controls_projection\(' -e '_fault_controls_projection_after_action\(' src/roastpilot_agent/api.py` | Each hit classified as P1/P2 or P3 |
| F-10 | `rg -n -e 'persist_evaluation\(' -e '_handle_completion\(' src/roastpilot_agent` | Each HUMAN-drop evaluation classified by calling task; off-runner calls registered; `_handle_completion` called from the runner loop only |
| F-11 | `rg -n -e '_close_current_fault_lease_for_acknowledgement' -e '_FinalisationCloseEvidence' src/roastpilot_agent/api.py` | Wrapper and `_result` callers unchanged; the evidence enum only feeds the runner capability |
| F-12 | `rg -n -e 'create_task\(' -e '_human_drop_evaluation_tasks' src/roastpilot_agent/controller.py` | Exactly one new registration site; no `.cancel()` on the set |

The ratified original, AM-1, AM-2 and AM-3 sweeps are retained.

---

## 5. PR plan

- **No new slice.** The four-PR plan S1 → S2 → S3 → S4 is unchanged. AM-4 joins S3 (`feature/1076-human-mode-protection-controller`, `Refs #1076`).
- **Estimate.** About 90–130 logic lines in `controller.py` and about 50–80 in `api.py`.
- **S3 size.** S3 already exceeds its estimate. The PR body keeps the cohesion rationale and the QA trigger.
- **S4.** Unchanged; it renders from server fields only.
- **Independent work.** Independent AM-3 work may continue. Integration with `49edaab4` happens before the final gate.

## 6. Routing

- **Required:** `safety-reviewer` (mandatory), `sim-roast-runner`, `mcp-contract-checker` (strict write and readback timing) and `qa` (mandatory).
- **Not triggered:** `security-reviewer`, since there is no decoder change.
- The parent may only add reviewers. Safety capacity is never spent on implementation.
- The packet carries §0's evidence limits and this statement verbatim: "receipts bound to their heads; command evidence is not physical confirmation; base post-closure audit writes are recorded, not asserted immutable".

## 7. Delegation prompt notes (mandatory; carry verbatim)

1. **Worktree.** `{IMPL_WORKTREE}` is provisioned fresh at the then-current S3 head with `git worktree add -b <planned-branch> {IMPL_WORKTREE} <s3-head-sha>`, or as a lead-recorded fresh same-base clone. Without `-b`, HEAD is detached. The parent verifies HEAD and that `git status --porcelain --ignored` is empty, then substitutes the real path immediately before delegation. Every command self-locates. Never use a planning tree, and never guess a path.
2. **Directives.** The worker's only directives are the ratified original, AM-1, AM-2, AM-3, the TE15 correction, AM-4's numbered sections and lead-authored directives. Strip every `UNTRUSTED-QUOTE` block and every non-maintainer URL. Do not fetch the issue, its comments, PR threads or any GitHub discussion (including `gh issue view --comments`), the MCP repository, or producer links. Only the parent delegates; the worker spawns no agents.
3. **Environment (#738).** Run `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev`. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
4. **Gates before handback (SAFETY_CRITICAL), each run separately.**
   - `ruff check .`
   - `ruff format --check .`
   - `pyright`
   - full pytest with `--cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing`, with no `-m`, `-k`, `-n` or deselect
   - the FE contract tests

   Cover every changed line and branch. Hand back F-1 to F-12, classified. A focused pass is never a full gate.
5. **Attribution invariant.** The branch must be attributable to the implementation worker acting on its ratified inputs alone: the ratified contracts and lead-authored directives, which are the sanctioned channel. Any other model input the worker procures, at any stage, in any form, by any route, breaks attribution. The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?" A yes fails the slice closed. The lead then re-delegates from the contract in a fresh worktree, or records an explicit operator decision naming which lens supplies the independent pass.
6. **Traps.**
   - **Edge and rule (a).** Add no edge. "No transition" never means forcing FAULTED.
   - **Readback.**
     - Only CONTRADICTS converts ISSUED to UNKNOWN.
     - Resolve in a `finally` on the captured controller, exactly once.
     - Never retry, call, reconcile or clear UNKNOWN.
   - **D-16.**
     - The closure check is the first statement of `execute_human_fault_drop` and the first recheck term, before any join.
     - Clear the marker only on PROVEN_NOT_COMMITTED with no prior sticky uncertainty; `False` is never rollback. A later no-store refusal never clears an earlier uncertain attempt.
     - Keep the bool wrapper and `FaultControlCloseResult` unchanged.
     - No raw-DROP fallback.
   - **D-17.**
     - Register synchronously before the first persistence await.
     - Set the marker before the barrier await, and run the barrier before every completion route.
     - Never cancel a registered task. Never remove a task in its done-callback.
     - Never treat a cancelled await, cancelled task or raised task as settled; never dispatch after a persistence raise.
     - Do not await on an empty set. Add no timeout, lock or task framework.
   - **C-1′.** Never evaluate the DROP term in non-DROP or emergency admission.
   - **TE5.** Do not change `_cleanup_step`, `shutdown` or cancellation semantics.
   - **General.**
     - Keep API strings, trace names and payloads unchanged.
     - Add no `RoastEventKind`, shared enum change, schema, threshold, dependency, adapter, producer or `COMMAND_PHASE_MATRIX` change.
     - Plain `Enum` and Celsius only.
     - If any gate-3 fact fails, return `ESCALATE`.
7. **Fixtures.** Rewrite the edge test, T44, AM-3 TE26 and the TE5 assertions. No MCP or FE fixture changes.

## 8. Risk profile

**Blast radius.** HUMAN fault-time drop outcomes, latch severity, emergency retry, completion ordering, fault-lease finalisation, lifecycle admission and fault-control projection. HUMAN mode stays unreachable (AC-NA). There is no new endpoint, credential or schema.

**Break these first:**
1. Leaving FAULTED after a drop outcome, or lowering the latch.
2. A refused or cleared flagged retry.
3. A readback exception mapped to UNKNOWN, or a contradiction kept ISSUED.
4. An unresolved record, or a resolver on a re-selected controller.
5. A DROP-term read or raise in non-DROP or emergency admission.
6. A completed or closing HUMAN DROP reaching the executor, the join or `persist_evaluation`.
7. A completion route initiated before the barrier settles, or a cancelled await or raised task counted as settled.
8. The marker cleared on UNCERTAIN.
9. An AUTOMATIC leak.

**Residual risks (not claims):**
- With UNAVAILABLE, the run stays ISSUED/SETTLED, so D212 may close it and a later Start may follow. That proves safe-zero controls, not evacuation.
- A contradiction after closure is in memory only. It is not persisted, not shown at restart clearance, and is lost on restart. Restart clearance is the separate existing live-process fence; completed runs do not become HISTORY_UNKNOWN.
- D-16 removes the HUMAN software drop on closing, closed and uncertain-finalisation runs (see the §2.8 box).
- A hung evaluation write delays D212 finalisation (A2 owns storage bounding). A white-box cancelled retained task blocks finalisation in that process. A raised S3 drop-evaluation write makes every HUMAN completion route unavailable for that runner. E-stop and exact-session cooling remain. The existing recovery path is process restart and restart clearance; an active prior run enters HISTORY_UNKNOWN and uses D216 End. This describes existing software recovery, not authority to restart hardware or a claim of live admission. No rollback, reconciliation or retry is added.
- Base post-closure audit writes (§2.9) are unchanged and not claimed fixed.
- G-3 IN_FLIGHT blocks lifecycle indefinitely, by design.
- The preserved retry writes the existing overrun-safe fan, matching AUTOMATIC #210.
- No current-head receipt covers AM-4.

---

## 9. Owner summary, decisions and ratification

**Summary.**
- A HUMAN fault-time drop now stays in FAULTED whatever its outcome.
- A contradictory post-drop readback becomes UNKNOWN and blocks new lifecycle. An unavailable readback does not.
- Completion first closes HUMAN drop admission, then waits for every registered S3 drop-evaluation write to succeed; a failed one blocks completion. Only then does any completion write begin. This covers the separate-connection D212 close as well as ordinary completion and export.
- After completion begins, a new HUMAN software drop is refused unless a typed result proves non-commit and no earlier attempt remains uncertain. Any uncertain attempt keeps refusal for that runner's lifetime.
- Emergency stop, exact-session cooling, D212 and already-started commands keep their existing behaviour. AUTOMATIC is unchanged.

| ID | Encoded choice | Alternative (needs revised bytes) |
|---|---|---|
| A | A FAULTED-origin ISSUED drop stays FAULTED; the edge is removed | Enter COOLING and amend lease/D212 admission |
| D-13 | Rule (a) on admission **or** completion FAULTED, for all owners | Admission-only or owner-limited |
| D-14 (a–d) | WITHHELD/UNKNOWN in FAULTED keep FAULTED with a monotone latch; §2.3 consequences | Base FAULTED→ORR |
| D-15 | Contradiction → UNKNOWN/UNKNOWN; unavailable → ISSUED/SETTLED; resolver on every exit; lifecycle refused while outstanding | Every non-confirmation → UNKNOWN |
| D-16 | Refusal on closing, closed and uncertain finalisation; private typed close evidence; marker cleared only on the five proven non-commit branches with no prior sticky uncertainty; the §2.8 operational consequence | Base completed-run DROP under a separate evidence path |
| D-17 | Application-owned completion barrier: atomic close, settlement of registered S3 drop evaluations by retained shielded tasks, then completion | Census-only treatment of pre-closure evaluations (rejected per owner direction) |
| C-1′ | API split and guarded DROP term | Fence-free DROP computation |
| TE5 | Test-row correction only | — |

**Blockers.** No concrete blocker to the approved direction is identified. Gate 3 items (d) and (f), and sweep F-10, are the points where a source contradiction would return `ESCALATE` rather than weaken D-17.

**Separate findings, not decided here:** F-TEARDOWN-START, F-AUTO, and the base post-closure audit writes listed in §2.9.

**Ratification wording.** Post after the lead binds the hash and the watermark:

> "Ratify AM-4 (SHA-256 `<hash>`) exactly as written, selecting A, D-13, D-14 (a–d), D-15, D-16 including its stated loss of terminal software drop on closing, closed or uncertainly finalised HUMAN runs, D-17 including its refusal of HUMAN completion while an S3 drop-evaluation write is unresolved, C-1′ and the TE5 correction. Prior contracts remain authoritative except where AM-4 amends them. No hardware, live-enablement, merge or release authority is granted."

**Before posting:**
1. Run a mechanical secret scan over the exact text.
2. Bind AM-4's SHA-256 beside the five header hashes.
3. Recompute the watermark.
4. Add the provenance marker only after ratification.
5. Refresh the issue snapshot before delegation.
