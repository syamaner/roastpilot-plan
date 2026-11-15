# A1 contract amendment AM-5 (proposed): HUMAN emergency-stop reachability during finalisation, narrow S3 correction (Agent #1076)

**Status: lead-consolidated owner-review copy, proposed and not ratified.** Independent contract safety review returned PASS with exact lead corrections; those corrections are incorporated below. Raw planner and review outputs remain unchanged. This is not an implementation or gate PASS.

**Status: proposed, not ratified.** This text authorises no implementation, delegation, merge, live enablement or hardware action. No worker may use AM-5 until the owner ratifies these exact bytes.

**Owner direction behind this text.** On 15 November 2026 the owner chose "Approve narrow fix and retain cooling lock (Recommended)" on the concrete `owner-direction.md`. That approves a direction. It is not ratification of a contract.

**Provenance.**
- This is text-only story-planner output. I had no tools, filesystem, MCP or native capture.
- Every `file:line` citation refers to parent-exported committed bytes at Agent `750e8af605fcd387ebfbc0c8f8c599c7a32a464e` ("@750e8af").
- No D219, gate, test-pass, review-pass, hardware, readiness or release claim follows from this text.
- The raw planner identified missing ranges M-1 to M-5. The lead and independent safety reviewer subsequently verified them against complete source at 750e8af; the gate descriptions below remain the facts to recheck on source drift. No missing range is treated as verified by the raw planner.

**What AM-5 leaves unchanged.** AM-5 preserves the AM-4 bytes exactly. It amends only the clauses listed in §2.8. Everything else stays authoritative:

| Document | SHA-256 |
|---|---|
| Original A1 | `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f` |
| AM-1 | `360432547cb36bbe8cd8ce63131e047dc28bb1ac4d32f892f36757236f86a41a` |
| AM-2 | `5cd7ae775efc306d21f4e37452ddd8b11a34ddc5c6f92e03d2d7ac5cba6d3369` |
| AM-3 | `f9057dd9d9b7c99b7f1d6995f5b5d3b8ac9fc3f52e0cb053c0644975a21f0979` |
| AM-3 TE15 correction | `49fac6accf148efb9b41f4c559090d9b6e65cd3d02b3845fa12a7a5a4879df36` |
| AM-4 (ratified, comment 6899582798) | `abafd10971ab252e8751f0c19d76ad9ebfc327f653cd7d7aaa3870485f0e6714` |

Scope: AM-5 adds no slice. It also leaves untouched the closure policy, endpoints, typed close evidence, safety policy, thresholds, storage cancellation and timeouts, schemas, enums, public endpoints, readback claims and hardware authority.

---

## 0. Bindings, evidence and gates

| Binding | Value (as supplied by the parent) |
|---|---|
| Implementation base | Agent `750e8af605fcd387ebfbc0c8f8c599c7a32a464e`, clean export |
| Plan | Planning was bound to clean, pushed `f454c0d0aa1028dc97c52a0fec22b09c1d3f3768`. The subsequent clean, pushed direction record `5fbef0a443d75ef4a8bd104c3fa4ea09987ec640` adds D235 without changing prior contract bytes. Plan main remains `93806f4c1049b86b21c3309a5f3cba3982708b98`. |
| Plan anchors | Plan D230 to D234 (`roastpilot-agent/plan.md:225-229`) governed planning; D235 records the subsequently approved AM-5 direction. D234 is the AM-4 ratification. Active epic is E11-packaging. AM-5 does not touch E11-S3 or #954. |
| Issue | #1076. Author `syamaner` / `OWNER`. Body SHA-256 `48a60e43f3a22234c90757d02d71d2779a929cf8c52c2e0d35657a88519a472b`. |
| Pre-AM-5 comments (all OWNER, freshly verified) | 6796642729 @ 2026-11-11T13:07:07Z; 6833383146 @ 2026-11-12T19:12:47Z; 6875804554 @ 2026-11-14T10:19:06Z; 6894208392 @ 2026-11-15T12:19:18Z; 6894426652 @ 2026-11-15T12:37:47Z; 6899582798 @ 2026-11-15T18:59:09Z |
| Watermark (as supplied) | `cde6284ab633e826520ff8208fbf2b649572bca9631a9543e893ff467a64998c`. Encoding: sorted compact JSON over the body plus ordered `[id, updated_at]` pairs. The lead recomputes it, excluding the AM-5 post. |

**Evidence.** This is synthetic, hardware-free software evidence, bound to `750e8af`. It is not a causal-control pass.

- **Run 3 (`lead-investigation-run3.py/.log`).**
  - Setup: an R1 HUMAN drop holds the single terminal executor worker inside its registered evaluation write, while live D212 waits at the AM-4 barrier after two safe-zero proof reads.
  - Global e-stop: "queued without dispatch". It was confirmed only after the write was released.
  - Per-run e-stop: "direct controller write", result `accepted`.
  - Cooling: `failed` while the write was pending, both before and after the e-stop; `accepted` after settlement.
- **Run 4.** Adds a global e-stop without finalisation. It took the direct route with result `accepted`.
- **Reachability notes (`lead-investigation-reachability.md`).** These are derived from source, except where they say otherwise.
- **Earlier failed harness attempts.** Retained elsewhere and not scored.
- **Real aiosqlite connection stall.** Not exercised. The hold was at Python level.

**Gates before delegation (all fail closed; any contradiction leads to re-planning or `ESCALATE`, never a weaker design):**

1. The owner ratifies these exact bytes.
2. The lead refreshes the issue body and all comments, recomputes the watermark and verifies every hash above.
3. At the S3 implementation head, the lead verifies production identity with `750e8af` (or re-cites everything below at the new head). M-1 to M-5 are now closed by complete-source review at that head; the following facts remain pre-delegation revalidation obligations:
   - **M-1.** `api.py` from `:5458` to the end of `_dispatch_admitted_live_emergency_stop`. Confirm that it:
     - (a) consumes exactly the e-stop reservation admitted at `:5224` (the already-admitted dispatch) and admits no second one;
     - (b) reaches `RoastController.operator_emergency_stop`, with no storage await before the MCP e-stop write (`controller.py:6753-6758` shows the write precedes persistence);
     - (c) works while `fault_finalization_started` is true. Run 3 shows this behaviourally via `_submit_live_emergency_stop`, `api.py:7818-7876`;
     - (d) produces a return value that maps only to the existing `accepted` / `failed` strings at `:5305-5315`.
   - **M-2.** The bodies of `RoastController.admit_emergency_stop` and `_run_emergency_write`. Confirm that a single call advances `CommandArbiter.admit_emergency_stop` (`controller.py:164-172`) exactly once.
   - **M-3.** `submit_fault_controls_action` (around `api.py:4760-4910`; the architect cites `:4830`). Confirm the existing non-e-stop refusal while `fault_finalization_started` is set. AM-5 changes nothing there; this is for disclosure accuracy only.
   - **M-4.** The bodies of `_run_routine_write` and `_contain_human_heat`. Confirm there is no storage await on the executor worker inside the HUMAN hook other than the registered evaluation (`controller.py:4111-4114`). This re-applies AM-4 F-10. If another storage await exists, the slice returns `ESCALATE`, because the bypass predicate would not cover it.
   - **M-5.** `RoastService.runner` and how its type is declared. Also classify any narrow test runner that reaches `api.py:5240` while finalising.
4. The lead runs baseline sweeps Q5-1 to Q5-8 (§4) and classifies existing hits before delegation. The expected after-AM-5 match set is verified by the worker and independent review after implementation; absence of the new definitions at the baseline is expected, not a failed or passed implementation check.

---

## 1. Acceptance criteria (proposed; inferred from the owner direction and the ratified contracts)

**Sources (quoted).**
- Owner direction: "Use the existing direct live-controller emergency path for the current HUMAN runner when outstanding S3 evaluation persistence would otherwise block the terminal writer. Cover both the finalisation proof interval and the completion barrier, not only the barrier. Require explicit proof that completion persistence has not started or become uncertain; historical, finalised, different-run and AUTOMATIC paths retain existing routing. Synchronous emergency-generation/epoch invalidation must prevent the waiting completion attempt from subsequently starting."
- Owner direction: "The direct route keeps its existing `accepted` result. It must not claim the terminal route's exact-session `confirmed` readback." The owner also approved retaining the cooling refusal, with disclosure.
- Issue AC-8: "Emergency remains callable".
- Issue outcome row: "New owner governs; stale completion cannot release latch or update newer run".

| ID | Criterion |
|---|---|
| AM5-1 | When the global e-stop has selected a live HUMAN runner, finalisation is reserved, and an S3 drop-evaluation write registered on that runner's controller is still outstanding, the request uses the existing direct live-controller route (`api.py:5289-5315`) instead of the terminal executor. This covers both the D212 proof interval (reservation at `:1802`) and the AM-4 barrier (`:2065-2066`). |
| AM5-2 | The bypass applies only when no HUMAN completion-persistence route has been initiated for that runner, or the last initiation ended in proven non-commit and was reopened under AM-4 with no prior uncertainty (§2.3). A transient segment flag cleared in `finally` or on exception never creates authority. |
| AM5-3 | The bypass reads only the `live_runner` already selected at `api.py:5137-5143`: current, same `run_id`, not finalised. Finalised, historical, different-run, absent-runner and AUTOMATIC requests keep their existing routing and result. |
| AM5-4 | The bypass result is the existing `accepted` with its existing reason string. It is never `confirmed`. |
| AM5-5 | Exactly one emergency reservation is consumed per request. There is no second hardware writer and no executor e-stop for a bypassed request, before or after release. Safety evaluation, the shared arbiter, shielding and the existing fail-safe retry are unchanged. |
| AM5-6 | The existing synchronous epoch invalidation and generation advance (`api.py:5223-5224`) still happen before the routing decision. The waiting completion attempt then refuses, through the existing checks at `:2067-2072`, `:1833-1837`, `:1875-1877` and `:1821-1823`. No close, export or `complete_run` follows. |
| AM5-7 | Cooling admission is unchanged. Cooling is refused while the finalisation reservation is held, including while the barrier waits on storage and after a bypass e-stop until the existing supersession path releases the reservation. The projection may still offer START_COOLING meanwhile. Both facts are disclosed, not fixed (§2.6). |
| AM5-8 | A failed direct emergency write uses the existing fail-safe (retry armed, FAULTED, existing result mapping). It adds no fallback write and no double reservation. |
| AM5-9 | No change to the barrier, the marker, the registry semantics, typed close evidence, the D212 reservation, executor queue or worker ownership, evaluation ordering, AUTOMATIC behaviour, enums, schemas, routes, models, SSE, strings, thresholds or timeouts. No new cancellation, reconciliation or hardware action. |

---

## 2. Spec

### 2.1 Facts @750e8af (the implementer re-verifies each)

**Root cause.**
- `FaultControlExecutor.execute` keeps its own routine-admission SQLite write outside the single writer, deliberately (`controller.py:653-658`).
- The S3 hook `execute_human_fault_drop` breaks this. It registers a task and then awaits `asyncio.shield(task)` on the worker (`controller.py:4111-4114`), inside `_execute_one` (`:964-974`), which runs from `_drain` (`:703-739`).
- A priority-0 e-stop (`:683`) can run only after that item returns.

**Global route.**
- `was_finalizing` is read at `api.py:5124`, and `live_runner` is selected at `:5131-5143`.
- On the path that proceeds, there is no await between `:5124` and `:5240`. The only awaits are on the return paths at `:5175-5181` and `:5187-5197`.
- The executor is chosen when `executor is not None and session_id is not None and (live_runner is None or was_finalizing)` (`:5240-5244`).
- Otherwise a live runner takes the direct route (`:5289-5315`), which returns `accepted` / `failed`.
- The executor route returns `confirmed` / `failed` (`:5262-5271`).

**Admission ordering.**
- Lease admission is at `:5214-5218`. The runner's synchronous invalidation and admission are at `:5223-5224`.
- The arbiter clears the close reservation on e-stop admission (`controller.py:164-172`), and `reserve_close` refuses while an e-stop is pending (`:188-197`).

**Per-run route.** This route is already direct during finalisation (`api.py:7600-7603`, `:7818-7876`).

**Completion.**
- The barrier is at `api.py:2061-2072`, with an epoch recheck after it (`:2067-2072`).
- The D212 route is at `:2078-2121` (`close` awaited at `:2085`).
- The COMPLETE and legacy route is at `:2124-2147`.
- The reservation is aborted on refusal or failure at `:2037`, `:2117` and `:1898`. On an exception from `close` (`:2090-2093`) or from export/`complete_run` (`:2144-2147`), the code raises without aborting.

**Registry.**
- Each task is registered synchronously before its await and discarded only after the await succeeds (`controller.py:4111-4115`).
- The barrier waits on a snapshot (`:4033-4041`).
- The marker and sticky uncertainty are at `:4012-4026`.

**Direct-route storage.** On the direct route, storage comes after the MCP write: e-stop evaluation persistence (`controller.py:6758`), `_record_dispatch_command` (`api.py:1629`) and `_flush_events` (`:1652`).

### 2.2 Closed application capability (new; private behaviour, public method names only for pyright strictness)

**Controller accessor** (read-only, synchronous):

```python
def human_drop_evaluation_outstanding(self) -> bool:
    """Whether pending or cancelled S3 evaluation ownership needs direct e-stop routing."""
    return self._human_run is not None and any(
        not task.done() or task.cancelled() for task in self._human_drop_evaluation_tasks
    )
```

- It never mutates the set, never awaits and never cancels.
- It returns False for AUTOMATIC, because the registry exists only for HUMAN (`controller.py:1647-1651`).
- **D-19 (review-corrected refinement).** Pending tasks and retained cancelled tasks qualify. A retained task that succeeded or raised a non-cancellation exception no longer has a storage dependency, so the base executor route remains available. Cancellation is different: `CancelledError` can terminate the worker after an e-stop was queued but before it consumes that item; a cancelled retained task therefore selects the direct route. AM-5 never cancels a task and does not repair the pre-existing worker-cancellation lifecycle itself.

**Runner capability** (read-only, synchronous):

```python
def emergency_stop_must_bypass_terminal_writer(self) -> bool:
    controller = self.controller_for_human_fault_drop()   # None unless HUMAN
    return (
        controller is not None
        and not self._completion_persistence_initiated
        and controller.human_drop_evaluation_outstanding()
    )
```

- The capability must not call `_human_fault_drop_controller`, `human_recovery_drop_allowed`, `_human_actuation_admitted`, the admission fence, `closed_reason` or `_teardown_unconfirmed`. This keeps AM-4 P1/P4 and the TF11 ordering intact.

**Service routing** (the single consumer, at `api.py:5240-5244`):

```python
use_terminal_executor = (
    executor is not None
    and session_id is not None
    and (
        live_runner is None
        or (was_finalizing and not self._live_estop_bypasses_terminal_writer(live_runner))
    )
)
```

- `_live_estop_bypasses_terminal_writer` returns `runner.emergency_stop_must_bypass_terminal_writer() is True` inside `try/except Exception: return False`. Only the exact boolean True grants bypass authority: a missing method, exception or truthy non-boolean (including an unspecced test Mock) falls back to base. It logs a fixed message with no values on exception.
- **Failure direction:** any exception, missing method (narrow test runner) or other doubt keeps the base executor route. The bypass is new authority, so it fails toward base.
- The decision runs in the same synchronous segment, after `:5223-5233` and before any await. It runs only when `was_finalizing` is true, which means zero new reads outside finalisation.
- When true, the request falls through to the unchanged `:5277` check (false, because `live_runner` is set) and then the existing `:5289-5315` direct dispatch.

### 2.3 Completion-persistence state (correction 1: exact states, lifetime, reset)

A runner-private `self._completion_persistence_initiated: bool`, initialised to `False` in `RoastRunner.__init__`. This inert constructor initialisation also occurs for AUTOMATIC, which never reads or mutates the flag after construction.

| State | Meaning | Bypass |
|---|---|---|
| `False` | No HUMAN completion-persistence route has been initiated by this runner, or the most recent one ended in proven non-commit that AM-4 reopened | permitted (if the other terms hold) |
| `True` | A route has been initiated and its non-commit is not proven-and-reopened | never |

**Set (HUMAN only), synchronously, at exactly two sites:**
- (S1) immediately before the `try:` at `api.py:2084` that awaits `close(...)`;
- (S2) immediately before the `try:` at `:2124` that initiates `_export_logs` / `complete_run`. Setting it at S2 is idempotent when D212 already committed.

**Reset to `False` at exactly one site:**
- (R1) immediately after `clear_human_completion_after_proven_non_commit()` at `:2097`, and only if `not self._controller.human_drop_closed()` afterwards.
- This ties the reset to AM-4's own reopening: PROVEN_NOT_COMMITTED with no sticky uncertainty and the run not durably closed.
- AM-5 adds no new reading of uncertainty.

**Never reset by** `finally`, any exception, `CancelledError`, UNCERTAIN, COMMITTED, supersession, the barrier, settlement, emergency or reservation release. An attempt refused before S1/S2 neither sets nor clears the flag. Only R1 clears it, and only when PROVEN_NOT_COMMITTED with no prior sticky uncertainty reopens the closure. A later no-store refusal cannot erase earlier uncertainty.

**Other properties.**
- **Lifetime:** per runner instance. A new runner starts at `False`. AUTOMATIC never reads or mutates the flag after construction.
- **Fail-closed read:** the flag is always defined. The read reports `True` (no bypass) for every case that is not proven.
- **Prior proven non-commit:** a later proven non-commit is distinguished only where AM-4 already permits reopening.
- **Not added:** no automatic reconciliation and no rollback inference.

**Reachability note.** With the AM-4 barrier, the registry is empty whenever a route is initiated. New registration is impossible while the marker is set. So "flag `True` with registration outstanding" is reachable only white-box. The flag is the stated proof that the direct route never overlaps durable completion or its uncertainty. That is the window the base executor route was designed for (`api.py:5235-5239`).

### 2.4 Behaviour by interval (global e-stop, live HUMAN runner)

| Interval | `was_finalizing` | Outstanding registration | Flag | Route / result |
|---|---|---|---|---|
| No finalisation | false | any | any | base direct / `accepted` (unchanged; run 4) |
| D212 proof (`:1802` to proof end) | true | yes | false | **direct / `accepted`**; D212 then aborts as superseded (`:1821`, `:1833`, `:1875`) |
| Barrier (`:2066`) | true | yes | false | **direct / `accepted`**; `:2067-2072` refuses completion |
| Finalising, no outstanding write | true | no | any | base executor / `confirmed` or `failed` |
| Completion route in flight or after uncertainty | true | (empty) | true | base executor |
| Retained raised task, new D212 attempt | true | raised, not cancelled | false | base executor (D-19) |
| Retained cancelled task (white-box/shutdown case) | true | cancelled | false | direct / `accepted` (D-19); no worker-lifecycle repair |

**After a bypass:**
- The held R1 drop is refused at its recheck. The barrier case refuses on the marker (`controller.py:4117`). The proof case refuses on `lease_current` or generation (`:4119-4120`). No DROP write follows.
- The marker stays set after supersession (existing). The HUMAN software drop therefore stays unavailable for that runner (AM-4 D-16).

### 2.5 Failed direct emergency

The existing behaviour applies unchanged:
- `_execute_emergency_stop` records `COMMAND_FAILED`, arms `_EMERGENCY_STOP_RETRY_RULE`, faults and latches (`controller.py:5235-5265`).
- A swallowed direct MCP-write failure still returns the existing `accepted` with reason `"emergency_stop accepted for controller priority dispatch"` if subsequent persistence/flush succeeds. This means accepted attempt, not successful physical stop or exact-session readback. An exception from post-write storage/flush can escape the HTTP task; AM-5 preserves that existing behaviour.
- No executor e-stop is enqueued for the same request and there is no fallback.
- The flagged retry runs on a later terminal tick (AM-3 GE25 / AM-4 TF5).

### 2.6 Cooling boundary (owner-retained; disclosure only)

These are existing behaviours, cited for disclosure:
- While `fault_finalization_started` is set, non-e-stop per-run actions raise "fault finalization is closing the current lease" (`api.py:7623-7624`). The global fault-controls route refuses cooling as well (M-3; run 3 `cooling_while_pending: failed`).
- The AM-4 barrier keeps the reservation for as long as a registered write is outstanding. There is no upper bound, and this holds after a bypass e-stop too.
- Existing live release sites include admission/proof failure (`:1805`, `:1898`), supersession (`:2053`/`:2072`), D212 failure (`:2117`) and successful finalisation (`:2207`/`:2211`). Existing terminal-only release paths (`:4920`, `:4968-4970`, `:5091-5092`) require the terminal-history branch at `:4900-4901`; they are not a new recovery route for a stalled live barrier.
- The reservation is **not** released by the branches where an exception escapes `close` (`:2090-2093`) or legacy export/`complete_run` (`:2144-2147`). No automatic restoration of cooling is claimed for that situation. Existing recovery must be separately verified and authorised; this contract grants no restart or hardware action. Q5-5 classifies all release sites.
- The projection can offer START_COOLING while admission refuses it. This is the existing test assertion and the run-3 observation.

AM-5 does not restore cooling and does not release the reservation early. Releasing it early would permit overlapping finalisers. It also does not claim that the e-stop's physical cooling effect has been verified.

### 2.7 Closed hunk set (extends AM-4 §2.12; nothing else permitted)

**`controller.py`:**
- C1: `human_drop_evaluation_outstanding()` (§2.2).

**`api.py`:**
- A1: initialise `_completion_persistence_initiated`.
- A2: the two set sites S1 and S2 (HUMAN only).
- A3: the reset site R1.
- A4: `RoastRunner.emergency_stop_must_bypass_terminal_writer()`.
- A5: the private service helper `_live_estop_bypasses_terminal_writer` and the single condition change at `:5240-5244`.

**Untouched:** the barrier, the marker, `settle_human_drop_evaluations`, registration, typed close evidence, `_dispatch_acknowledge_fault`, the gate, the arbiter, the executor, `_dispatch_admitted_live_emergency_stop`, the cooling admission and projection, strings, and AUTOMATIC paths.

### 2.8 Explicit amendments (AM-4 bytes preserved; these rows govern)

| Clause | Amendment |
|---|---|
| AM-4 §2.9 "What is not changed", bullet 1 | Replaced: "The barrier never cancels, waits on, admits or reroutes an e-stop, and never touches executor cooling admission or the arbiter. It does extend the existing finalisation reservation, and with it the existing cooling refusal, for as long as a registered evaluation write is outstanding, including after a superseding e-stop. AM-5 adds one read-only routing input (outstanding registration and completion-persistence state) to global e-stop route selection." |
| AM-4 §2.9 "Disclosed effect" | Appended: the cooling consequence in AM-5 §2.6, including the post-exception case where the reservation is retained. |
| AM-4 §2.8 UNCERTAIN bullet and the header's owner-direction phrase "exact-session cooling remain[s] available" | Clarified: "available" means the cooling admission policy is unchanged. It does not mean callable while a finalisation reservation is held (AM-5 §2.6). The quoted direction text is unchanged. |
| AM-4 §2.12 | Extended by AM-5 §2.7 only. |
| AM-4 P4 / AM-3 TE14 / invariant 12 | Clarified: the AM-5 registry and flag read is not a fence or DROP-term read. It cannot refuse, delay or alter an e-stop's admission, reservation, evaluation or retry. It selects only between two existing dispatch routes, and on doubt it selects base. |
| AM-4 §8 residual risks | Extended by AM-5 §8. |
| Existing test `test_fault_acknowledgement_superseded_during_evaluation_barrier` | Expectation changes from `confirmed` to `accepted`, because its directly called hook leaves an outstanding registration (§3 TG14). |

---

## 3. Test list and causal controls (hardware-free; `tests/test_runner_human_turn.py`)

**Harness.** Use `_faulted_run` and `_ExactFaultRunner`.

**Deterministic observation (correction 4).**
- Wrap `actuator.emergency_stop` so it sets `direct_written`.
- Wrap `executor._queue.put_nowait` so it sets `estop_enqueued` for EMERGENCY_STOP items, as in run 3.
- Create explicit asyncio Tasks for `direct_written.wait()` and `estop_enqueued.wait()`; Python 3.11 does not accept bare coroutines in `asyncio.wait`. Wait for FIRST_COMPLETED and capture the observed route without asserting yet.
- In `finally`, release every hold, settle or explicitly cancel all owned request/observer tasks, and await lease-persistence and executor shutdown cleanup. Only after clean teardown assert the recorded intended outcome. A timeout, unhandled exception or cleanup failure makes the witness INVALID. For GG8 capture an exception as observation data rather than letting it escape; cleanup must not depend on dispatch having occurred.

**Timeout policy.** An outer `wait_for` is only a harness guard. If it expires, the witness is **INVALID**, never a mutation pass. Error or timeout is never a witness.

| Guard | AM5 | Test | Mutation → the unique failing assertion |
|---|---|---|---|
| GG1 routing condition | 1, 6 | **TG1** (barrier). R1 DROP through `service.submit_operator_action`; worker busy; registration outstanding; D212 queued; tick to the barrier. Global e-stop: `direct_written` fires first; `estop_enqueued` is not set; `port.fault_writes == []`. After release: tick returns False; zero close, export and `complete_run` (spies); drop `failed`; lease generation advanced; marker set; exactly one `emergency_stop` in total; zero executor e-stop writes; result `accepted`. | Reverting the condition makes `estop_enqueued` fire first, failing "direct route observed". |
| GG1b proof interval | 1, 6 | **TG2.** Also hold `read_fault_acknowledgement_state` during the D212 proof. The global e-stop is direct before either release. After release: D212 records `superseded_by_emergency_stop`; zero close; no D212 stop write; reservation released. | Keying the bypass on the barrier (marker) instead of the reservation fails "direct route observed". |
| GG2 registration term | 1, 3 | **TG3.** Finalisation reserved (proof interval and barrier variants) with no outstanding write: executor route, `confirmed`, one executor e-stop write. | Dropping the registration term gives `accepted`, failing "`confirmed`". |
| GG3 not-done term (D-19) | 1 | **TG4.** Retained raised evaluation (registry size 1, done), then a D212 attempt with the proof read held. The global e-stop takes the executor route, `confirmed`. | "Non-empty" instead of "not done" gives `accepted`. |
| GG3b cancelled task | 1 | **TG4b.** White-box retained cancelled evaluation while finalising: direct `accepted`, one controller attempt, no executor e-stop enqueue. Explicitly cancel/settle the old stranded drop waiter during cleanup; never wait indefinitely for its base unresolved future. | Removing the cancelled-task term produces the observed executor-enqueue route instead of direct dispatch. |
| GG4 persistence flag | 2 | **TG5** (white-box). Hold `close()` after entry; inject one pending task into the registry; global e-stop: executor route, `confirmed`. Then complete the injected task and release `close`. | Dropping the flag term gives `accepted`. |
| GG5 flag lifetime | 2 | **TG6 rows, each a white-box read of the flag:** (a) PROVEN_NOT_COMMITTED with no prior uncertainty clears it, and the capability is True given a held registration; (b) UNCERTAIN then PROVEN keeps it `True`; (c) `close` raises, giving `True`; (d) legacy `complete_run` raises, giving `True`; (e) the runner is cancelled during `close`, giving `True`; (f) COMMITTED keeps `True`. | Clearing in `finally` or on exception fails (c), (d) or (e). Clearing on PROVEN regardless of uncertainty fails (b). Never clearing fails (a). Clearing on COMMITTED fails (f). |
| GG6 authority | 3 | **TG7.** AUTOMATIC with finalisation reserved: base executor `confirmed`. A spy on `human_drop_evaluation_outstanding` records zero calls, and the flag is neither read nor mutated after construction. | Bypassing the HUMAN check gives spy count > 0. |
| GG7 runner selection | 3 | **TG8.** A finalised runner with an exact lease (TF18 shape), a different-run request and the no-runner case: the capability spy is never called, and the base results and strings are returned. | Reading `self.runner` instead of `live_runner` gives spy count > 0. |
| GG8 fallback on exception | 1, 5 | **TG9.** The capability raises during the barrier: no exception escapes; `estop_enqueued` fires (the expected base); after release, `confirmed`, and arbiter `emergency_stop_active` is False. | Removing the `except` makes `submit` raise, failing "no exception and `confirmed`". |
| GG8b closed boolean | 1, 3 | **TG9b.** Missing capability, truthy non-boolean and unspecced Mock return values never grant bypass; preserve base executor result and reservation cleanup. | Using truthiness instead of `is True` produces direct `accepted` for a truthy non-boolean instead of the expected executor result. |
| GG9 failed direct e-stop (correction 7) | 5, 8 | **TG10.** Bypass while `actuator.emergency_stop` raises. With post-write storage/flush succeeding, assert literal `accepted` and reason `"emergency_stop accepted for controller priority dispatch"`, and compare with the per-run route under the same injected failure. Separately pin propagation of a post-write storage exception without duplicate dispatch. Exactly one `emergency_stop` attempt. Zero executor e-stop enqueues or writes, before and after release. `emergency_stop_active` False afterwards. `_pending_fail_safe_is_emergency_stop_retry` True. The next tick after release issues exactly `set_heat(0)` then the overrun-safe fan, with no second e-stop. | Adding an executor fallback gives an EMERGENCY_STOP fault write. A double admission leaves `emergency_stop_active` True. |
| GG10 HTTP cancellation | 5 | **TG11.** Cancel the waiter during the bypass. The shielded dispatch writes once, the callback consumes it, and cleanup completes. | Unshielding gives zero writes. |
| GG11 cooling retained | 7 | **TG12.** During the barrier, both before and after the bypass e-stop with storage still held: global START_COOLING returns `failed`, and per-run raises "fault finalization is closing the current lease". The projection still lists START_COOLING (disclosed mismatch pinned). After release and supersession, START_COOLING returns `accepted`. | Releasing the reservation on e-stop makes the "refused after e-stop while pending" assertion fail. |
| GG12 no read outside finalisation | 3, 9 | **TG13.** Run-4 shape and the per-run route during the barrier: the capability spy records zero calls and the results are unchanged. | Evaluating unconditionally gives spy count > 0. |
| — rewrite | 4 | **TG14.** `test_fault_acknowledgement_superseded_during_evaluation_barrier`: expect `accepted`, exactly one controller e-stop, zero executor e-stop writes. Keep the START_COOLING projection pin, add the admission-refusal assertion, and keep the completion-refusal assertions. | — |
| Retained | — | TF11, TF18, TF20, TF22 and TF23 retain their obligations. TG14 changes both legacy and D212 parameters of the direct-hook supersession test to `accepted`, one controller e-stop and zero executor writes; preserve its no-completion spies. Other expectations remain unchanged. TF18 is the reachable base witness that the flag-set, registry-empty case stays on the executor. | — |

**Causal controls.**
- One control each for GG1, GG1b, GG2, GG3, GG3b, GG4, each GG5 row, GG6, GG7, GG8, GG8b, GG9, GG10 and GG11, plus GG12. All use explicit intended assertions after cleanup; no timeout/error counts as a mutation pass.
- Stop on the first invalid witness and preserve it.
- Restore by `cp` with hash verification.
- Never rerun the original 42 or unchanged controls.
- Receipts stay bound to their heads.

---

## 4. Class sweep (in `{IMPL_WORKTREE}`; classify every hit)

| ID | Command | Expected after AM-5 |
|---|---|---|
| Q5-1 | `rg -n -e 'was_finalizing' -e 'emergency_stop_must_bypass_terminal_writer' -e '_live_estop_bypasses_terminal_writer' -e 'human_drop_evaluation_outstanding' -e '_completion_persistence_initiated' src/roastpilot_agent` | `was_finalizing`: `:5124` plus the one condition. One definition and one consumer each for the capability and the helper. One accessor definition and one caller. For the flag: one init, two sets (S1, S2), one reset (R1). |
| Q5-2 | `rg -n -e '_execute_terminal_emergency_stop' -e '_dispatch_admitted_live_emergency_stop' -e 'dispatch_emergency_stop_during_fault_finalization' -e 'dispatch_priority_emergency_stop' -e 'dispatch_shutdown_emergency_stop' src/roastpilot_agent` | No new call sites. |
| Q5-3 | `rg -n -e 'admit_emergency_stop\(' -e 'cancel_emergency_stop_admission' -e 'run_emergency_stop' src/roastpilot_agent` | No new call sites (one reservation per request). |
| Q5-4 | `rg -n -e 'persist_evaluation\(' -e 'await self\._snapshots' src/roastpilot_agent/controller.py` | Every executor-worker storage await in the HUMAN hook is the registered task (M-4); otherwise `ESCALATE`. |
| Q5-5 | `rg -n -e 'abort_fault_finalization' -e 'release_terminal_lease_close' -e 'release_fault_acknowledgement_close' -e 'release_close\(' -e 'fault_finalization_started = ' src/roastpilot_agent` | No new release sites; the existing set is classified for §2.6. |
| Q5-6 | AM-4 F-5 rerun | No DROP-term or fence read inside the capability or the routing condition. |
| Q5-7 | `rg -n -e 'emergency_stop accepted for controller priority dispatch' -e 'terminal emergency stop has fresh exact-session proof' -e 'software e-stop attempt was not confirmed' src/roastpilot_agent/api.py` | Strings unchanged; no new sites. |
| Q5-8 | `rg -n -e 'await close\(' -e '_export_logs\(' -e 'complete_run\(' src/roastpilot_agent/api.py` | Every HUMAN initiation inside `_handle_completion` is preceded by S1 or S2. Other `complete_run` callers (recovery, D216) are classified as outside this runner. |

The ratified original, AM-1, AM-2, AM-3 and AM-4 sweeps are retained.

---

## 5. PR plan

- **No new slice.** The four-PR plan S1 → S2 → S3 → S4 is unchanged. AM-5 joins S3 on `feature/1076-human-mode-protection-controller`, `Refs #1076`. No new slice is objectively required: this is about 25–40 logic lines in `api.py` and 5–8 in `controller.py`.
- S3 already exceeds its estimate, so the PR body keeps the cohesion rationale. Splitting the routing correction from the AM-4 barrier would leave a merged state in which the global e-stop can queue behind storage.
- The test diff is likely large, and `qa` is mandatory.
- Integration with current Agent `main` happens before the final gate.

## 6. Routing

- **Required pre-open (correction 5: all prior lenses retained):**
  - `safety-reviewer` (mandatory floor, high effort);
  - `sim-roast-runner`;
  - `mcp-contract-checker` (concurrent proof read with a direct e-stop write, and e-stop and readback ordering);
  - `qa` (mandatory).
- `security-reviewer` is not triggered (no external input or decoder change). The parent may add it, never remove a lens.
- The implementation family is the Codex parent's choice at slice start. No capacity figure is asserted. Safety-review capacity is never spent on implementation.
- Packets carry §0's evidence limits and this statement verbatim: "receipts bound to their heads; command evidence is not physical confirmation; `accepted` is not exact-session confirmation".

## 7. Delegation prompt notes (mandatory; carry verbatim)

1. **Worktree.** `{IMPL_WORKTREE}` is a placeholder. The parent provisions it fresh at the then-current S3 head:
   `git worktree add -b <planned-branch> {IMPL_WORKTREE} <s3-head-sha>`.
   As already permitted by AM-4, a lead-recorded fresh same-base clone with an explicit planned branch is an equivalent provisioning fallback. Without `-b` in the worktree command, HEAD is detached and the handback lands on no branch. The parent verifies HEAD and that `git status --porcelain --ignored` is empty, then substitutes the real path immediately before delegation. Every command self-locates. Never use a planning tree, never detach HEAD, never guess a path.
2. **Directives.** The worker's only directives are the ratified original, AM-1, AM-2, AM-3, the TE15 correction, AM-4, AM-5's numbered sections and lead-authored directives. Strip every `UNTRUSTED-QUOTE` block and every non-maintainer URL. Do not fetch the issue, its comments, PR threads or any GitHub discussion (including `gh issue view --comments`), the MCP repository or producer links. Only the parent delegates; the worker spawns no agents.
3. **Environment (#738).** Run `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev`. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
4. **Gates before handback (SAFETY_CRITICAL), each run separately:**
   - `ruff check .`
   - `ruff format --check .`
   - `pyright`
   - full pytest with `--cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing`, with no `-m`, `-k`, `-n` or deselect
   - the FE contract tests

   Cover every changed line and branch. Hand back Q5-1 to Q5-8, classified. A focused pass is never a full gate.
5. **Attribution invariant.**
   - The branch must be attributable to the implementation worker acting on its ratified inputs alone: the ratified contracts and lead-authored directives, which are the sanctioned channel.
   - Any other model input the worker procures, at any stage, in any form, by any route, breaks attribution.
   - The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?"
   - A yes fails the slice closed. The lead then re-delegates from the contract in a fresh worktree, or records an explicit operator decision naming which lens supplies the independent pass.
6. **Traps.**
   - Change only the one condition at `api.py:5240-5244`. Do not move `:5214-5233`, add an await before routing, or touch the executor, its queue or `_drain`.
   - The bypass reads only `live_runner`. Never read `self.runner` or a historical runner, and never use it for AUTOMATIC.
   - Bypass ⇒ the existing `accepted`; never `confirmed`. No new strings.
   - No second writer, no fallback after a failed direct e-stop, no extra `admit_emergency_stop`, no cancellation, no timeout.
   - Set the flag only at S1 and S2. Reset it only at R1. Never reset it in `finally` or on an exception.
   - The capability is synchronous and makes no DROP-term or fence read. An exception, missing method or any non-boolean result falls back to base; only `is True` grants bypass.
   - Do not release the reservation, restore cooling, change the cooling projection or touch the barrier, marker, registry semantics or typed close evidence.
   - Plain `Enum` and Celsius only. No enum, schema, route or `RoastEventKind`.
   - If any §0 gate fact fails, return `ESCALATE`.
7. **Fixtures.** Rewrite `test_fault_acknowledgement_superseded_during_evaluation_barrier` (TG14). There are no MCP or FE fixture changes.

## 8. Risk profile

**Blast radius.** Global e-stop route selection for a live HUMAN runner during fault finalisation. The hardware consequence is how quickly an e-stop is dispatched. Data sensitivity is low. There is no new principal, credential, endpoint or schema. HUMAN mode stays unreachable (AC-NA).

**Break these first:**
1. A bypass while completion persistence is in flight or uncertain, including any path that clears the flag.
2. A bypass for a finalised, historical, different-run or AUTOMATIC runner.
3. A double reservation, or an executor e-stop after a bypassed or failed direct one.
4. `accepted` reported as `confirmed`.
5. Completion starting after a bypass e-stop.
6. An await introduced before routing.
7. A capability exception stranding an admitted reservation.
8. A DROP-term or fence read in the e-stop path.
9. Any early reservation release or change to cooling admission.

**Residual risks (not claims):**
- In this window the global e-stop reports `accepted` without an exact-session readback.
- On the direct route the MCP write precedes storage, but the HTTP result, e-stop evaluation persistence, command record and event flush still await the main connection. With a real stalled connection the response may wait. That case is not exercised; the run-3 hold was at Python level.
- Cooling is refused, with no upper bound, while a registered write is outstanding (including after the e-stop). The escaping-exception branches do not release the reservation; no restoration or process-recovery guarantee is claimed here. The projection may still offer START_COOLING. A stranded drum may need physical intervention.
- During the proof interval, a direct e-stop write may overlap a D212 safe-zero read. This is existing per-run behaviour, referred to `mcp-contract-checker`.
- A cancelled hook with a still-running task, and a retained cancelled task, can yield a conservative superset bypass (`accepted` while the worker may be free). The underlying worker cancellation/future lifecycle is an existing separate concern. The existing terminal path's runner-local admission counter also merits separate investigation; AM-5's direct path consumes its own one admission and does not change that baseline path.
- After supersession the marker stays set, so the HUMAN software drop is unavailable for that runner.
- No current-head receipt covers AM-5. The E-stop's physical effect is not verified.

---

## 9. Owner decisions encoded and ratification

| ID | Encoded choice | Alternative (needs revised bytes) |
|---|---|---|
| D-18 | A′: global e-stop uses the existing direct route for the selected live HUMAN runner while finalising with an outstanding registered S3 write | B (move evaluation before the queue), which is broader |
| D-19 | Pending or cancelled registered tasks qualify; completed success or non-cancellation failure stays on base routing | Any registered task, or the rejected pending-only predicate |
| D-20 | A monotone completion-persistence flag, reset only on AM-4 proven-non-commit reopening | A transient segment flag (rejected) |
| D-21 | Only an exact boolean True grants bypass; missing method, exception or non-boolean result preserves base routing | Propagate or grant authority by truthiness (rejected) |
| D-22 | Cooling refusal retained and disclosed (§2.6); AM-4 cooling wording corrected (§2.8) | Separate cooling availability during a stalled finalisation (new safety design) |

**Blockers.** None to the approved direction. M-1 to M-5 are verification gates, not open decisions.

**Ratification wording.** To be posted after the lead binds the hash and the watermark:

> "Ratify AM-5 (SHA-256 `<hash>`) exactly as written, selecting D-18 to D-22, including the retained cooling refusal while finalisation waits on storage (also after an emergency stop), the disclosed projection mismatch, and `accepted` rather than `confirmed` for the bypassed global emergency stop. AM-4 bytes and all prior contracts remain authoritative except where AM-5 §2.8 amends them. No hardware, live-enablement, merge or release authority is granted."

**Before posting:**
1. Run a mechanical secret scan over the exact text.
2. Bind AM-5's SHA-256 beside the six header hashes.
3. Recompute the watermark (six prior comments, excluding the AM-5 post).
4. Add the provenance marker `<!-- story-planner-contract: planner-generated; ratified-by: <maintainer login> -->` only after ratification, and verify that the posting author is `OWNER` and matches `ratified-by`.
5. Record the canonical posted-body hash.
6. Refresh the issue snapshot before delegation.