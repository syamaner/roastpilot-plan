# A1 contract amendment AM-3 (proposed, final): application-owned admission fence for HUMAN READ and CONTAINMENT during teardown, respawn and child stop (S3 only), Agent #1076

**Status: PROPOSED, lead-corrected after independent safety design review. Not ratified.** This text replaces every earlier unratified AM-3 draft in full. It authorises no implementation, repair, delegation, merge, automatic-mode change or live enablement. No worker may use AM-3 until the owner ratifies these exact bytes.

**Lead recommendations, not owner selections.** These bytes encode two lead-recommended choices: **D-8 = R** and **D-10 = B-corrected** (§9). Neither is an owner selection yet. Ratifying these exact bytes selects them. Any other choice needs revised bytes and a fresh ratification. This amendment offers no open menu.


**Lead correction provenance (not yet owner authority).** This owner copy incorporates the independent safety design review of 14 November 2026: exact emergency retry preservation; selective actuation guard including teardown-unconfirmed; NON_HEAT/cooling unchanged; fault-control DROP versus cleanup classification; corrected shutdown-reader inventory; TE14/17/22 updates and TE25/26 causal witnesses. Broad D-10 B from the planner draft is superseded throughout. Only ratification of these exact bytes makes these corrections authoritative.

**What stays authoritative.** The documents below remain in force. AM-3 changes them only where §2.9 lists a precise amendment. All their S2 terms stay frozen, including AM-2 §2.5 item 1, the adapter containment preconditions.

| Document | SHA-256 |
|---|---|
| Original A1 contract | `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f` |
| AM-1 | `360432547cb36bbe8cd8ce63131e047dc28bb1ac4d32f892f36757236f86a41a` |
| AM-2 | `5cd7ae775efc306d21f4e37452ddd8b11a34ddc5c6f92e03d2d7ac5cba6d3369` |

**Unchanged by AM-3:**
- the original ratified acceptance criteria;
- the four-PR plan (S1 → S2 → S3 → S4);
- the closed `PendingHumanCall { READ, CONTAINMENT }`.

**Scope.**
- AM-3 applies to S3 only.
- It makes no S2 change and adds no PR slice.
- It adds no `PendingHumanCall` member and does not change the adapter contract.
- It adds no external surface: no wire format, HTTP route, request/response model, SSE payload, persisted schema or `RoastEventKind`.
- S3 application edits to `api.py`, `cli.py`, `controller.py` and the new S3 application module are required and in scope.
- Ratifying AM-3 also ratifies D-5 to D-12 (§9).

**How this text was produced.**
- The initial draft was produced by the text-only story-planner without tools or filesystem access. This owner copy includes the explicitly documented lead corrections following independent safety review; it is not unmodified planner output.
- Every `file:line` citation comes from the parent-supplied exports of commit `6e0eb5f`. The implementer re-verifies each one at the S3 base.
- The protocol citation `controller.py:472` comes from the parent and the adjudication. I did not see it; §0 gate 3 verifies it.
- No D219 confinement, native-capture, hardware, live-admission or release claim follows from this text.

**Precedence.** The issue body's one-slice text (350–500 lines) is superseded by the owner-ratified four-PR plan (original §5; comment 6796642729).

**Current code versus proposal.**
- §2.1 and §2.4 describe **current code** at `6e0eb5f`.
- §2.2, §2.3 and §2.5 to §2.10 are the **proposed S3 design**.
- These do **not** exist at this base: the HUMAN turn (H0–H5), `HumanRunOwnership`, HUMAN tracker wiring, the admission segments and the HUMAN `routine_admission_is_current` terms. They are future S3 wiring defined by the ratified contracts plus AM-3. They are not missing source.

---

## 0. Bindings, gates and evidence (as supplied by the parent)

| Binding | Value |
|---|---|
| Design source (read-only; never the implementation tree) | Agent `6e0eb5f728a90ddd36d341e4f4558168f7789e13`. This is the S2 head, pushed as PR #1084, awaiting Codex's ready-head step and **not merged**. The source is frozen and, per the parent, pristine including ignored files. |
| Plan | `93806f4c1049b86b21c3309a5f3cba3982708b98`, pushed and pristine, per the parent. |
| Plan anchors (cited by section) | `fc-protection-d230.md`: clause 4 ("Local timeout never proves remote settlement"), clause 7 (emergency), the Architecture gate. `fc-protection-stories-d230.md`: the A1 body, the outcome row "Superseded by independent emergency/lifecycle action", AC-8 and AC-11. |
| Registry / epic | E11-packaging / D230 / A1 #1076. AM-3 does not touch E11-S3 or #954. |
| Issue | #1076, author `syamaner` (`OWNER`). Body SHA-256 `48a60e43f3a22234c90757d02d71d2779a929cf8c52c2e0d35657a88519a472b`. |
| Pre-AM-3 comments (all `OWNER`) | `6796642729` @ 2026-11-11T13:07:07Z (body `f5fabbc7…df0aea`); `6833383146` @ 2026-11-12T19:12:47Z (`7ca5c5db…0495d7`); `6875804554` @ 2026-11-14T10:19:06Z (`41ebbe30…427d`). |
| Watermark (as supplied) | `926512d8ce4660f40b79811e1ccdd855cabf277c2b3f3fe668a638809258e5a4`. The lead recomputes it with the canonical encoding defined in comment 6796642729, excluding the AM-3 post. |
| Owner direction | `approved-direction.md` (14 November 2026). The direction is approved; this amendment still needs ratification. |
| Ratification of AM-3 | A new maintainer-authored comment carrying the provenance marker. It binds AM-3's SHA-256 beside the three hashes above and records that D-8 = R and D-10 = B-corrected are selected by ratifying these bytes. No prior bytes change. |

**Evidence.** All of this is parent-supplied and bound to its own head. None of it certifies S3 or AM-3.

| Item | Receipt |
|---|---|
| S2 at `6e0eb5f` | Full native gate PASS, 15830 passed / 14 skipped. Exhaustive witness PASS. Four final reviews PASS. PR #1084 pushed, not merged. This supersedes the "full native gate remains pending" line in `approved-direction.md`. |
| Safety adjudication | PASS for S2. Finding 3 needs an S3 contract correction, which is this amendment. Findings 1, 2 and 4 are ratified residuals enforced in S3. |
| Probe `shutdown-containment-probe.json` | `command_state_returned` while `stop_requested`, `stop_pending` and `session_attached` were all true. `application_guard_exercised: false`. Synthetic owner and session, the real `MCPServerProcess.stop`, zero hardware calls, no real SDK teardown. |
| Earlier receipts (`160156c0`, `d39fde3`, `011c9ec`, `cd92250`, the optional scorer INVALID with 3 unrun, the nine repair receipts) | Unchanged and bound to their heads. Not rescored or relabelled. |

**Gates before any S3 delegation (all fail closed):**
1. The owner ratifies AM-3's exact bytes.
2. S2 has merged. S3 is provisioned off the updated `main`, and every AM-3 citation is re-validated there. Drift that invalidates a citation means re-planning that citation, never implementing against `6e0eb5f`.
3. **Lead verification, not a proof claim.** At the S3 base, the lead runs Q-1, Q-1b, Q-3, Q-4, Q-5, Q-8, Q-9 and Q-10 (§4). Every hit is classified against §2.4, §2.11 and the expected sets. Any hit that is unclassifiable or contradicts them blocks delegation and goes to re-planning or the owner (the §2.4 contingency). Passing this gate is an inventory check. It does not prove the design safe.
4. The issue snapshot and watermark are refreshed and every hash is verified.

---

## 1. Acceptance criteria

**Owner-approved direction (quoted):**
- "add an application-owned admission fence for HUMAN READ and CONTAINMENT. Close admission synchronously before the first await when application teardown, respawn or child-stop begins. New attempts after that point make zero RPCs and open no pending ownership. Specify the appropriate typed refusal for READ separately from containment's known NOT_ATTEMPTED; never invent fresh telemetry or treat refusal as remote settlement. Existing pending-call cancellation and UNKNOWN ownership rules remain in force. Emergency stop and required cleanup remain admitted. Reopening requires a separately valid lifecycle transition; no automatic heat or fan resume."
- "Required acceptance additions: teardown begins before a new READ/CONTAINMENT; zero RPC/no pending scope; cleanup failure before tick-loop cancellation; emergency stop remains usable; already-pending operations retain ownership semantics; respawn/stop paths cannot admit a late operation. Also retain AM-2's proof obligation for pending Start versus reset/recovery/new Start; a new pending-call enum member needs explicit ratification."
- "If an application-only fence cannot cover them, return the concrete gap for an owner decision before extending the adapter contract. AM-2's S2 preconditions remain unchanged."

**Issue sources (OWNER):**
- AC-8: "Unknown drop/containment results cause zero reconnect, child-restart or new-session escape attempts. Emergency remains callable."
- Outcome row: "New owner governs; stale completion cannot release latch or update newer run."

Every row below is **inferred** from those quotes plus the ratified contracts and the lead recommendations D-8 R and D-10 B-corrected. Each row is a proposal.

| ID | Criterion | Source |
|---|---|---|
| AM3-1 | Every application teardown, respawn and child-stop entry point (§2.3, E1–E6) closes the fence **synchronously, before its first await or task-scheduling boundary**. | Direction |
| AM3-2 | A HUMAN READ or CONTAINMENT admission evaluated after closure makes **zero** RPCs, registers **no** pending scope and creates no adapter coroutine. | Direction; AM-2 §2.7.1 |
| AM3-3 | A refused READ yields the typed `RefusedHumanCall(READ, …)`. It is not an envelope, an exception, `None` telemetry, a read failure or a `ContainmentOutcome`. It changes no read-failure counter, fabricates no verdict, renews no freshness and authorises no actuation (D-6). | Direction; AM-1 H2-3/H2-5 |
| AM3-4 | A refused CONTAINMENT is the known non-dispatch `ContainmentOutcome.NOT_ATTEMPTED`. It never creates, settles or clears UNKNOWN. Consumption follows §2.6. | Direction; original §2.6 |
| AM3-5 | Cleanup failure before tick-loop cancellation cannot reopen admission. A surviving HUMAN tick loop makes zero new READ/CONTAINMENT RPCs and no guarded roast-actuation writes under §2.7. Existing independently admitted emergency retry and NON_HEAT/cooling paths remain subject to their unchanged policies. | Direction; safety corrections |
| AM3-6 | Emergency and required cleanup never consult the new fence. This includes shutdown e-stop and its bounded retry, runner e-stop, `run_emergency_stop`, exact-session fault-control e-stop, and the existing `_EMERGENCY_STOP_RETRY_RULE` path through `_apply_fail_safe` carrying `allow_emergency_stop_transition_for_heat_off=True` for heat zero and its associated fan write. Cleanup includes child stop, markers, lease settlement and store close. The exemption does not include ordinary heat-zero requests. | Direction; original retry invariant |
| AM3-7 | A call already pending at closure keeps AM-2 §2.7 semantics: its scope persists until local termination, and UNKNOWN is published before the scope exits. No local completion, clean stop, refusal, `NOT_ATTEMPTED`, reopen or cache value settles a remote UNKNOWN. | Direction; clause 4; AM-2 |
| AM3-8 | Closure for application teardown is terminal for the process. Closure for device respawn reopens only through §2.5. Reopening admits no call by itself and resumes no heat or fan. | Direction; AC-11 |
| AM3-9 | There is exactly one fence per `RoastService` and its single roaster adapter. Every runner and controller that service constructs shares it: fresh, recovery, detached, or an old tick task still alive. | Direction |
| AM3-10 | Under D-8 R, unexpected child-owner failure leaves READ on its existing evidence/read-failure/FAULT path. `stop_unconfirmed` refuses CONTAINMENT and the guarded HUMAN roast-actuation classes in §2.7, even while the application fence is open. Existing emergency retry and NON_HEAT/cooling policies remain unchanged. | D-8 and safety correction |
| AM3-11 | The AM-2 §2.7 item 7 proof obligation (pending Start versus reset, recovery and new Start) is retained. `PendingHumanCall` stays `{READ, CONTAINMENT}`. | Direction; AM-2 §2.8 |
| AM3-12 | AM-3 adds no hunk to `mcp_client.py` or `human_protection.py`. It changes no AUTOMATIC behaviour, no `COMMAND_PHASE_MATRIX`, no dependency and no HUMAN enablement surface, and adds no external surface. Application edits to `api.py`, `cli.py` and `controller.py` are required and permitted. | Direction; AM-2 AM2-8 |
| AM3-13 | D-10 B-corrected: actual-dispatch checks require an open fence and false `teardown_unconfirmed()` for HUMAN HEAT, FAN, DROP, CONTAINMENT and SESSION_START, except the exact existing emergency heat-off retry. NON_HEAT and independently admitted emergency retain base policy with zero new fence reads. Queued writes and writes driven by late READ completions are covered; already-started operations keep existing classification. | Safety-corrected D-10 |

---

## 2. Spec

### 2.1 Current code at `6e0eb5f` (facts, not proposals)

**CLI teardown.**
- `serve` runs `await server.serve()` inside a `try`. Its `finally` runs `await _finish_live_teardown(service, mcp, store, exit_guard)` (`cli.py:1027-1029`).
- `_finish_live_teardown` (`cli.py:868-891`):
  - creates the `_teardown_live` task (`:875-878`) with no prior await;
  - shields it in a loop that absorbs cancellation (`:880-884`);
  - retrieves the result (`:887`) and arms the exit guard (`:888-889`);
  - re-raises any absorbed cancellation (`:890-891`).
- `create_task` is a scheduling boundary. Other tasks, including a live tick loop, may run before `_teardown_live`'s first statement.
- `_teardown_live` (`cli.py:1034-1133`) runs these steps in order:
  1. `store.active_run`, with its first await at `:1082`;
  2. `safe_shutdown_heat_off` (`:1088-1090`);
  3. `service.shutdown` (`:1095`);
  4. `mcp.stop` (`:1096`);
  5. the stop-unconfirmed marker (`:1100-1104`);
  6. lease settlement (`:1105-1112`);
  7. the clean-epoch marker (`:1118-1132`);
  8. `store.close` (`:1133`).
- `_cleanup_step` catches `Exception` only, logs it and continues (`:1147-1151`).
- `_LiveSignalGuard` forces `os._exit` on a second SIGINT (`cli.py:206-212`). That path is outside any software fence.

**`RoastService.shutdown` (`api.py:6451-6507`).**
- Sets `_shutdown_started = True` synchronously (`:6454`).
- Then awaits, in order:
  - the safety-record initialisation task (`:6459`; only `CancelledError` is suppressed);
  - the stranded retirement task (`:6464`; likewise);
  - the closure-end task (`:6468`). It logs an `Exception` (`:6473`) and re-raises `CancelledError` when the current task is cancelling (`:6469-6472`).
- Only after those does it cancel and await the tick loop (`:6475-6480`) and the detached recovery loop (`:6481-6493`), then settle the rest (`:6494-6507`).
- So an exception escaping `:6459` or `:6464`, or the re-raise at `:6472`, skips loop cancellation. Under the CLI, `_cleanup_step` swallows it and `mcp.stop` runs with the loop alive.
- `_lifespan` calls `service.shutdown()` after `yield` (`api.py:9259-9265`).

- `_shutdown_started` has existing retirement, D212 and projection readers; Q-8 lists the verified complete base inventory. AM-3 preserves them.

**Shutdown heat-off and emergency.**
- `safe_shutdown_heat_off` (`api.py:6314-6407`) returns `NO_RUNNER` or `NOT_ACTIVE` synchronously (`:6354-6358`).
- Otherwise it admits through `_admit_shutdown_emergency_stop` (`:6409-6442`) inside each bounded attempt (`:6364`, `:6387`).
- That admission raises `RuntimeError` if the runner is no longer current (`:6420-6421`). The error is caught at `:6380` (the first attempt, which then goes to the retry) or `:6401` (the retry, which then writes the unconfirmed marker).
- The runner path:
  - `dispatch_shutdown_emergency_stop` (`api.py:1551-1569`) calls `_dispatch` (`:1439-1526`).
  - For `EMERGENCY_STOP`, `_dispatch` skips the routine lease check (`:1457-1462`) and calls `controller.operator_emergency_stop` (`:1478-1480`).
  - `operator_emergency_stop` (`controller.py:5735-5753`) admits and executes the e-stop, and swallows trace-persistence failure.
- `_drain_queue` sorts EMERGENCY_STOP first (`api.py:1416`).

**Respawn.** `_respawn_mcp_for_device_config` (`api.py:2767-2822`):
1. returns if `_mcp is None` (`:2794`);
2. clears the baseline (`:2802`);
3. awaits `self._mcp.stop()` (`:2806`);
4. raises if `stop_unconfirmed` is set (`:2813-2818`);
5. sets the device config (`:2819`);
6. awaits `self._mcp.start()` (`:2820`);
7. records the baseline (`:2821`).

It is reached only from `start_roast` (`:5743`), inside `_start_lock`, after these guards have passed:
- loop task (`:5626-5630`);
- detached loop (`:5631-5644`);
- runner finalised (`:5645-5648`);
- persisted active run (`:5649-5655`);
- `stop_unconfirmed` (`:5656-5661`).

**Start.**
- The HTTP delegate only calls `service.start_roast` (`api.py:8346-8351`).
- `start_roast` (`:5556-5787`) creates the run under the lock (`:5756`) and publishes `active_run_id` and `_starting_run_id` (`:5772-5773`).
- It calls `_begin_live_run` **outside** the lock (`:5774-5776`). That builds the runner (`:5883-5890`) and awaits `runner.start` (`:5894`). The loop task is created only afterwards (`:5895-5896`).
- `_build_runner` (`:5992-6076`):
  - resets the adapter identity synchronously (`:6021-6026`);
  - passes the shared `self._command_arbiter` (`:6050`);
  - publishes `self.runner` (`:6075`).
- Its callers are `_begin_live_run` (`:5883`) and `recover_on_start` (`:6292`).
- `recover_on_start` (`:6217-6312`) runs from the lifespan **before** `yield` (`:9257`).
- A fault no longer auto-finalises (`api.py:1034-1037`).

**Live composition.**
- `build_live_service` starts the child (`live.py:185`) and stops it on failure (`:188`). Both happen before the adapter (`:191`) or the service (`:194`) exists.
- The service holds one `self._mcp` (`api.py:2482`) and one `self._roaster` (`:2486`).

**Command arbiter (`controller.py:114-308`).**
- `run_routine` (`:209-265`) evaluates `admitted()` before waiting and after every wait (`:227-258`). It then sets `_in_flight` (`:259`) and calls `operation()` (`:261`).
- `Condition.__aexit__` only releases the lock, so no other task runs between the final `admitted()` and the start of `operation()`. The S3 implementer verifies this at the base, and TE9b pins it.
- `run_emergency_stop` (`:267-308`) takes its own `admitted` callable and waits for at most the in-flight call.
- `admit_emergency_stop` (`:142-150`) advances the generation synchronously.

**Tracker (`human_protection.py:172-261`).**
- `record_read_failure()` clears the history and returns INVALID (`:238-240`).
- `recheck()` returns UNPROVEN or INVALID while no history or bound exists (`:242-255`).
- An out-of-order admission invalidates the history (`:227`).

**Frozen S2 adapter.**
- `contain_heat_fixed_zero` (`mcp_client.py:1832-1857`):
  - checks transport, discovery, epoch and session (`:1836-1842`);
  - returns `NOT_ATTEMPTED` (`:1843`);
  - has no stop check.
- `_contain_heat_fixed_zero` checks `session is None` (`:3220`) and the post-call epoch (`:3241`).
- `read_human_evidence` is at `:1643-1681`.
- Per the adjudication, neither has a production caller.

### 2.2 Proposed S3: fence type, owner, lifetime and admission segments

**Placement.** The fence lives in the same new S3 **application** module as `HumanRunOwnership`; S3 names that module. It imports only the standard library and domain types. It never imports `api.py`, `cli.py`, `controller.py` or `mcp_client.py`, all of which may import it.

```python
class AdmissionCloseReason(Enum):        # plain Enum, closed
    APPLICATION_TEARDOWN = auto()        # terminal for this process
    DEVICE_RESPAWN = auto()              # reopenable only per §2.5

class HumanCallRefusal(Enum):            # plain Enum, closed
    ADMISSION_CLOSED = auto()            # fence closed (READ or CONTAINMENT)
    CHILD_TEARDOWN_UNCONFIRMED = auto()  # CONTAINMENT only (D-8 R)
    READ_ALREADY_PENDING = auto()        # types AM-2 TD7's existing refusal (READ only)

@dataclass(frozen=True)
class RefusedHumanCall:
    kind: PendingHumanCall               # existing {READ, CONTAINMENT}; no new member
    refusal: HumanCallRefusal

class HumanCallAdmissionFence:
    closed_reason: AdmissionCloseReason | None   # None means open
    def close(self, reason: AdmissionCloseReason) -> None: ...  # sync, idempotent, never raises
    def reopen_after_respawn(self, *, child_started: bool, teardown_unconfirmed: bool,
                             lifecycle_blocked: bool, shutdown_started: bool) -> bool: ...  # sync
```

**`close`.**
- Synchronous, with no await.
- `APPLICATION_TEARDOWN` dominates: a later `DEVICE_RESPAWN` close never downgrades it.
- `close` never raises.

**Owner and lifetime.**
- One instance, built in `RoastService.__init__` beside `api.py:2554`, for the life of the process.
- Only two places mutate it: the service method `close_human_call_admission(reason)` and the §2.5 reopen step. `cli.py` calls the service method.
- Runners and controllers receive only a read-only admission capability.

**Per-adapter sharing.**
- One service has one adapter (`api.py:2486`), so there is one fence per adapter.
- `_build_runner` passes the **same instance** to every controller and runner it builds, on the fresh path (`:5883`) and the recovery path (`:6292`).
- An old live tick task or a detached recovery loop therefore sees a later closure.
- TD7's READ exclusivity is also per adapter, as adjudication finding 2 requires.
- If S3 finds a second adapter on one service, or an adapter replaced on a live service, it returns `ESCALATE`.

**READ admission.** This extends AM-2 §2.7.1. It is one synchronous segment with no await:
1. If the fence is closed, return `RefusedHumanCall(READ, ADMISSION_CLOSED)`.
2. If a READ is pending for this adapter, return `RefusedHumanCall(READ, READ_ALREADY_PENDING)`.
3. Register the pending READ.
4. Create the adapter coroutine.

Under D-8 R, READ is **not** refused on `stop_unconfirmed`.

**CONTAINMENT admission.**
- **Precondition stage.** These checks come first among the original §2.6 preconditions, before `CONSUMED`:
  - the fence is open;
  - `teardown_unconfirmed()` is false. If it is true, the refusal is `RefusedHumanCall(CONTAINMENT, CHILD_TEARDOWN_UNCONFIRMED)`.
- **Dispatch stage.** The fence term reaches the arbiter's `admitted()` through §2.7 (D-10 B-corrected). The `teardown_unconfirmed()` term is also included in CONTAINMENT's `admitted()`. The operation body then repeats both checks synchronously, registers the pending CONTAINMENT and creates the adapter coroutine. All of this runs in the same loop step as the arbiter's final `admitted()`.
- **`teardown_unconfirmed()`** is supplied by the service as `lambda: self._mcp is not None and self._mcp.stop_unconfirmed`. It is read synchronously, and the controller sees only `Callable[[], bool]`.

**Refusal.** A refusal registers nothing, creates no coroutine and makes no RPC.

**Emergency.** No emergency path calls either admission segment. If S3 finds an emergency path that consumes a HUMAN READ or CONTAINMENT, it returns `ESCALATE`.

### 2.3 Proposed S3: close-before-await entry points (closed set at `6e0eb5f`)

| E | Entry | Close point | Reason |
|---|---|---|---|
| E1 | `_finish_live_teardown` (`cli.py:868`) | First statement, **before** `create_task` (`:875`) | APPLICATION_TEARDOWN |
| E2 | `_teardown_live` (`cli.py:1034`) | First statement, before the `:1082` await. Defensive, for direct callers and tests. | APPLICATION_TEARDOWN |
| E3 | `RoastService.safe_shutdown_heat_off` (`api.py:6314`) | First statement, before `:6354`. Defensive. | APPLICATION_TEARDOWN |
| E4 | `RoastService.shutdown` (`api.py:6451`) | Same synchronous block as `:6454`, before `:6455`. This covers `_lifespan` (`:9265`) whichever of E1 or E4 runs first. | APPLICATION_TEARDOWN |
| E5 | `_lifespan` teardown (`api.py:9259-9265`) | Covered by E4: no await comes before `shutdown`'s first statement. | — |
| E6 | `_respawn_mcp_for_device_config` (`api.py:2767`) | At `:2802`: after the `:2794` return, before the `:2806` await | DEVICE_RESPAWN |
| — | `cli.py:1096` `mcp.stop` | Preceded by E1 and E2 | covered |
| — | `api.py:2806` `self._mcp.stop()` | Preceded by E6 | covered |
| — | `live.py:188` failure stop | No adapter or service exists yet (`:191`, `:194`) | classified; no close |
| — | `MCPServerProcess.start` failure reaper (`mcp_client.py:3060-3078`) | Internal to `start`. Reached only from `api.py:2820` (fence already closed by E6) or `live.py:185` (no service yet). | classified; no close |
| — | `acknowledge_hardware_clear` (`api.py:5789-5870`; `mcp_client.py:2769-2796`) | Requires no active run and a detached session (`mcp_client.py:2806`). It never reopens the fence. | classified; no close |

**Teardown begin point (D-11).**
- For the CLI, teardown begins at E1.
- The interval between signal receipt and entry to `finally` comes before heat-off and before any stop request. During it the child is not stopping, so an admission there is an ordinary live-run admission.

**Cleanup failure before loop cancellation.**
- E1 and E2 close the fence before teardown step 1. Under lifespan-only operation, E4 closes it before the first `shutdown` await.
- These failures cannot reopen the fence: a failure at `:6459`, `:6464` or `:6472`, a raising heat-off, or a `RuntimeError` from `_admit_shutdown_emergency_stop` (`:6421`).
- A loop that survives into `mcp.stop` is refused every new READ and CONTAINMENT. Under D-10 B-corrected it is also refused guarded HUMAN roast-actuation writes at dispatch; exact emergency retry and NON_HEAT remain under base policy.

### 2.4 Current code: how child-stop requests become visible to the application

At `6e0eb5f`, the supplied source does **not** set `stop_unconfirmed` on every teardown path.

| Path | Session during unwind | `stop_unconfirmed` | What protects a new HUMAN admission |
|---|---|---|---|
| **Healthy application-requested stop.** `stop()` sets the private `_stop_requested` (`mcp_client.py:3124`). The owner wakes at `:2870` and leaves the `async with`, so `aclose` runs. | **Still attached** until the owner's `finally` (`:2905`) or stop's `finally` (`:3173-3177`) | Never set | **The fence only.** There is no public stop-requested accessor. This is the probe case. |
| `aclose` raises during a requested stop | Attached until `:2905` | Set at `:2883-2889`, after the failed unwind and before detach | Fence (already closed) plus the flag |
| Stop overruns its bound | Possibly attached | Set at `:3134-3138` | Fence (already closed) plus the flag |
| Stop's caller is cancelled | Possibly attached | Set at `:3160-3161` | Fence (already closed) plus the flag |
| Owner body raises with no stop request (unexpected exit) | Attached until `:2905` | Set at `:2876-2877`, **before** unwind | CONTAINMENT: the flag (D-8 R). READ: the existing read path. After detach, the frozen session-`None` and epoch checks. |
| Startup failure | Detached at `:2861`; the epoch advances and discovery is cleared (`:2712-2718`) | Not set | Frozen session-`None` (`:3220`) and epoch (`:1839`, `:3241`) checks |
| Startup owner fails to unwind in time | Unknown | Set at `:3069-3070` | Reachable only inside `start`, where the fence is closed by E6 or no service exists yet |

**Application-only coverage, on the supplied source.**
- In the supplied ranges, `_stop_requested` is set only by `stop()` (`:3124`). `start()` re-creates it (`:2968`), and it is cleared at `:2789`, `:3063`, `:3078` and `:3176`.
- `stop()` is called only from application code (`cli.py:1096`, `api.py:2806`, `live.py:188`).
- Each of those callers is preceded by a synchronous close (§2.3), or runs before any adapter exists.
- Owner-internal teardown with no stop request either sets the public flag before unwind or detaches the session, which advances the epoch.

On that evidence, an application-only fence covers every lower-level stop request **without changing frozen S2**, and no decision on adapter scope is needed. This is an inventory conclusion that holds only for the supplied ranges. §0 gate 3 re-checks it, and it is not a blanket safety claim.

**Contingency.** S3 never edits the adapter. If the gate-3 inventory or the S3 base shows either of the following, delegation stops and the owner is asked: "Amend AM-2 §2.5 item 1 to add a public stop-requested precondition to the adapter containment preconditions (and READ), yes or no?"
- an executable `MCPServerProcess.stop` caller, or another setter of `_stop_requested`, that the application cannot precede with a synchronous close;
- an owner-internal teardown that keeps the session attached without setting `stop_unconfirmed` and without a stop request.

### 2.5 Proposed S3: reopening (D-7)

**APPLICATION_TEARDOWN** never reopens in this process.

**DEVICE_RESPAWN** reopens only through one synchronous step immediately after `api.py:2821`, before `_respawn_mcp_for_device_config` returns, and only if all of these hold:
- `child_started` is true (`:2820` returned);
- `self._mcp.stop_unconfirmed is False`;
- the AM-2 §2.7.2 lifecycle predicate is clear;
- `_shutdown_started` is false.

**Nothing else reopens the fence.** That includes a failed stop, the `:2813` raise, a raising start, a hardware-clear acknowledgement (`:5851`), a clean `stop()`, a cache value, a timer, fresh readings and any local completion.

**After a failed respawn.**
- The fence stays closed and `start_roast` raises before creating a run.
- The next live-mode Start re-enters E6, because the baseline is `None` (`:2802`).
- Only a successful respawn in that next Start reopens the fence.

**Reopening has no side effects.** It makes zero MCP calls, opens no scope, resumes no heat or fan and grants no run anything.

### 2.6 Proposed S3: refusal consumption

**READ refused (D-6).** This is evaluated at H2 step 2, before AM-1 H2-5 (a). It applies to both READ-reachable refusals: `ADMISSION_CLOSED` and `READ_ALREADY_PENDING`.

| Effect | Rule |
|---|---|
| RPC, envelope, telemetry | None. |
| `_consecutive_read_failures` | Untouched, inside and outside the terminal latch. |
| Tracker | `record_read_failure()` (`human_protection.py:238-240`), as a continuity break only. `recheck()` becomes non-FRESH, and the next bound read re-baselines. |
| `read_failed` | Not set. No `evaluate_mcp_failure`, no FAULT. |
| Validity, hard limits, human reading | Not evaluated. No verdict is fabricated. |
| Actuation | `_routine_inhibited = True`, set synchronously. No protective-drop admission and no RD-1 containment. The H4 routine, advisor, ceiling and anchor stages are skipped. A refused-READ turn still executes the existing `_retry_pending_fail_safe` path (controller.py:2607); without a pending emergency retry the latched path holds silently. The original §2.4-F freshness term refuses ordinary HEAT, FAN and DROP, but the exact flagged emergency retry remains outside that row, as required by the original unchanged-retry obligations. Under D-10 B-corrected the selective condition also refuses guarded roast-actuation classes; exact emergency retry and NON_HEAT retain base policy. |
| Phase | No transition caused by the refusal. |
| Persistence | No new record kind or schema. A refusal may appear only in existing records or logs, never with raw values. If existing mechanisms cannot express it, `ESCALATE`. |
| Emergency | Unchanged. |

**CONTAINMENT refused.**
- Mapped to `ContainmentOutcome.NOT_ATTEMPTED`, constructed in application code without calling the adapter. The adapter cache is untouched.
- A refusal at the precondition stage does not set `CONSUMED`.
- A refusal at the dispatch stage (an arbiter discard) stays `CONSUMED`, under the original §2.6 rule.
- The command disposition does not change.
- No fallback, no `set_heat`, no e-stop substitution.

**Call pending at closure.**
- AM-2 §2.7.4 and §2.7.5 apply unchanged. Stop or cleanup may terminate the call.
- **CONTAINMENT** is classified per ratified §2.6. Any `UNKNOWN_*`, cancellation or escaping exception publishes UNKNOWN before its scope exits.
- **READ** that completes after closure is genuine evidence and is consumed under the unchanged AM-1/AM-2 rules: counter, tracker, validity, hard limits, and the emergency path for an EMERGENCY_STOP verdict. Its completion releases only its marker. Any guarded roast-actuation write it drives meets the selective §2.7 dispatch term; the exact emergency retry, NON_HEAT and classified fault-control cleanup retain base policy.

### 2.7 Proposed S3: selective dispatch-time shutdown guard (D-10 B-corrected)

The HUMAN branch of the original §2.4-F `routine_admission_is_current` adds an open-fence AND `not teardown_unconfirmed()` condition only for HEAT, FAN, DROP, CONTAINMENT and SESSION_START. This is evaluated at actual dispatch, including after every arbiter wait. AUTOMATIC admission never reads either new condition.

The existing emergency heat-off retry is exempt from these **new** conditions and remains outside the original §2.4-F ordinary HEAT/FAN freshness row, preserving the original unchanged-retry obligations. It remains subject to its existing safety evaluation, arbiter generation and retry bounds. A refused READ does not skip `_retry_pending_fail_safe`. Recognise only the existing `allow_emergency_stop_transition_for_heat_off=True` path: `_apply_fail_safe` identifies `_EMERGENCY_STOP_RETRY_RULE`, `_set_targets` restricts it to heat zero, and both heat and associated overrun-safe fan writes retain that flag (`controller.py:2527-2537`, `:2558-2573`, `:4449-4459`, `:4569-4583`). Do not exempt an ordinary heat-zero write, add a retry, change its limits or change the existing emergency caller set.

NON_HEAT does not evaluate the new fence or teardown-unconfirmed condition. Marks, operator start/stop cooling and live D212 retain their existing safety, lifecycle and generation guards. This preserves base behaviour, not guaranteed dispatch: any existing guard may still refuse them. No split of the closed WriteClass enum and no new per-call cooling policy is authorised.

**Fault-control is a distinct, classified path.** `FaultControlExecutor` uses `arbiter.run_routine(admitted=generation_current)` at `controller.py:919-924`, not the controller's routine predicate. Its START_COOLING, STOP_COOLING, D212 and EMERGENCY_STOP retain exact-session lease policy with zero new fence reads. HUMAN fault-control DROP adds the same open-fence AND not-teardown-unconfirmed condition to the existing HUMAN recovery-drop dispatch recheck required by original §2.4-R. Do not introduce an independent competing predicate or bypass that recheck.

**Dispatch and outcomes.**
- A guarded operation queued before closure is discarded at the next admission recheck. A late READ may still be consumed and evaluated; it cannot admit guarded actuation through the closed fence or teardown-unconfirmed flag.
- Existing independent emergency, its existing heat-off retry, NON_HEAT and classified fault-control cleanup remain available under base policy. They are not classified as bypasses.
- Already-started operations are not cancelled or reclassified by closure. Returned command state is not physical confirmation; unknown remains unknown.
- HEAT, FAN and SESSION_START discard: zero MCP calls, no COMMAND_EXECUTED, no new phase transition. No retry of a discarded Start.
- DROP discard: existing e-stop-generation rule if that generation changed; otherwise WITHHELD, latch retained, existing recovery/physical-intervention projection. RD-1 containment is refused as NOT_ATTEMPTED at precondition and is not consumed. Reopening never redispatches a withheld drop.
- CONTAINMENT discard after consumption retains CONSUMED and returns NOT_ATTEMPTED. Refusal does not create or settle UNKNOWN.

D-6 READ-refusal semantics stay unchanged: counter unchanged, tracker continuity broken, routine inhibited, no fabricated evidence or verdict. DROP-WITHHELD's existing transition is caused by the discarded drop, not by the READ refusal.

**Operator consequence:** normal roast actuation and new-session commands are blocked during shutdown or unexpected child teardown; emergency and existing cooling/cleanup routes preserve their prior admission policies. Cooling and marks are not newly authorised, forced, retried or guaranteed. A withheld protective drop still requires operator intervention. No physical heat-off proof is claimed.

### 2.8 Retained AM-2 obligation: pending Start versus reset, recovery and new Start

AM-2 §2.7 item 7 and adjudication finding 1 apply unchanged. AM-3 adds no `PendingHumanCall` member, and the fence does not discharge this obligation.

**Proof sketch from the supplied source.** S3 must prove this at its base or return `ESCALATE`. It is not claimed here.
- **Where resets happen.** Only at `_build_runner` (`api.py:6026`) and inside `start_session` (`mcp_client.py:1798`). `_build_runner` is reached only from `api.py:5883` and `:6292`.
- **Recovery cannot overlap.** `recover_on_start` runs before `yield` (`:9257`), so it cannot overlap a pending `start_session` begun over HTTP.
- **A second Start is refused** while `runner.start` (`:5894`) is pending:
  - at `:5645-5648`, because the runner was published at `:6075` and is not finalised;
  - at `:5649-5655`, because the `STARTING` row exists.
- **Still to show.** S3 must show that no path finalises the runner while its Start is pending. Two supplied facts support this: no tick runs before `:5895-5896`, and faults do not auto-finalise (`:1034-1037`).

If the proof fails, the owner question is: "Add `START` to the closed `PendingHumanCall`, yes or no?"

### 2.9 Precise proposed amendments (everything else unchanged)

| Item | Proposed amendment |
|---|---|
| Original §2.4 H2 step 2 | The single read goes through the §2.2 READ admission segment. A `RefusedHumanCall(READ, …)` takes the §2.6 branch. |
| Original §2.4-F | Add selective §2.7 condition for HUMAN HEAT/FAN/DROP/CONTAINMENT/SESSION_START, preserving the exact existing emergency heat-off retry. NON_HEAT unchanged. HUMAN recovery-drop recheck in §2.4-R receives the same condition; other fault-control paths retain exact lease policy. |
| Original §2.4 outcome classification | A fence discard of a DROP takes the existing WITHHELD row, unless the e-stop generation changed, in which case the e-stop row applies. That row's RD-1 containment step is refused `NOT_ATTEMPTED`. |
| Original §2.6 preconditions | Add first: "fence open, and `teardown_unconfirmed()` false", evaluated before `CONSUMED`. Repeat both in the dispatch `admitted()` (the fence term via §2.7) and in the operation body (§2.2). |
| Original §2.7 | Add: "The process-level `HumanCallAdmissionFence` (AM-3) is closed by E1–E6 before their first await or scheduling boundary. It never blocks emergency or cleanup. While it holds APPLICATION_TEARDOWN, construction of a HUMAN-authority runner is refused before `_build_runner`'s reset (D-9). AUTOMATIC Start is unchanged." |
| AM-1 §2.5 item 2 (H2-3 table) | Add row "Refused (not admitted)": counter untouched inside and outside the latch; tracker `record_read_failure()`; `read_failed=False`; routing per AM-3 §2.6. |
| AM-1 §2.5 item 4 (H2-5) | A refused READ returns before step (a). |
| AM-2 §2.7.1 | The fence check, and for CONTAINMENT the `teardown_unconfirmed` check, precede registration in the same synchronous segment. A refusal opens no scope. The TD7 refusal is typed `READ_ALREADY_PENDING`, and its exclusivity is per adapter. |
| AM-2 §2.7.5 | Unchanged, plus: "application stop entry points close the fence first." |
| AM-2 §2.8 closed invariants | Add: (9) an admission after closure makes zero RPCs and opens no scope; (10) teardown closure is terminal, and respawn reopens only per AM-3 §2.5; (11) no refusal, discard, local completion, clean stop or reopen settles UNKNOWN; (12) guarded HUMAN roast-actuation classes cannot dispatch while the fence is closed or child teardown is unconfirmed; exact emergency retry and existing NON_HEAT/fault-control cleanup retain base policy (§2.7). |
| AM-2 TD6 | Extended by TE13, TE14 and TE22–TE24. |

### 2.10 Architecture gate and dependency direction

| Layer | Contents | AM-3 effect |
|---|---|---|
| Domain (`human_protection.py`) | `ContainmentOutcome`, tracker, envelope | No AM-3 hunk |
| Application (new S3 ownership module; `RoastService` in `api.py`; controller; runner) | Fence, refusal types, admission segments, close sites, reopen step, refusal consumption, the D-9 predicate, the §2.7 HUMAN admission term | All new AM-3 code |
| Composition (`cli.py`) | E1 and E2 call `service.close_human_call_admission(APPLICATION_TEARDOWN)` | Only these calls |
| Infrastructure (`mcp_client.py`) | — | No AM-3 hunk. Transport and adapter stay unaware of the fence. |

**Dependency direction.**
- `cli` → service → fence.
- The controller and runner receive an injected fence capability and the `teardown_unconfirmed` callable, and depend on domain types.
- The fence module imports no infrastructure, SDK, store, API or UI types.
- The application reads only the public `stop_unconfirmed` property.

**Closed sets.** `AdmissionCloseReason`, `HumanCallRefusal` and `PendingHumanCall` are closed. Adding a member is a contract change.

**No external surface.** No HTTP route, request/response model, SSE payload, persisted column or `RoastEventKind`.

### 2.11 Lead verification duties for unsupplied inventory (§0 gate 3; not proof)

1. Occurrences of `_shutdown_started` beyond `api.py:2554` and `:6454` (Q-8).
2. `MCPServerProcess.stop` callers and `_stop_requested` setters beyond the supplied ranges (Q-1, Q-1b).
3. The `controller.py:472` protocol citation (Q-3).
4. Verify the HUMAN controller predicate and its guarded-class callers against Q-10. Classify FaultControlExecutor separately: its emergency path at :744 and routine generation-current path at :919 are not controller-predicate bypasses. Only HUMAN fault-control DROP receives the new condition through the original §2.4-R recovery-drop dispatch recheck. Fault-control cooling, D212 and emergency retain base lease policy. Verify CONTAINMENT admission separately and preserve the exact emergency retry (Q-10, Q-5).
5. Emergency-path bodies beyond the supplied `_dispatch` (`api.py:1439-1526`) and `operator_emergency_stop` (`controller.py:5735-5753`) (Q-5).

Any contradiction with §2.1, §2.4 or §2.7 blocks delegation.

---

## 3. Test list (S3; all hardware-free)

**Harness.** Fakes, an injected clock, and a synthetic owner and session over the real `MCPServerProcess.stop`, lifted from the probe to application level. No E12 story is needed.

**Files.** `tests/test_human_admission_fence.py`, `tests/test_runner_human_turn.py`, `tests/test_controller_human_mode.py`.

Each mutation must make the named test fail.

| Guard | AM3 | Test | Removing or inverting the guard must fail |
|---|---|---|---|
| GE1 E1 closes before `create_task` | 1, 2 | **TE1.** A HUMAN tick scheduled to run between `create_task` (`cli.py:875`) and `_teardown_live`'s first step attempts READ and CONTAINMENT. Expect zero `get_roast_state`, zero `_contain_heat_fixed_zero` and no pending scope. | Moving the close into `_teardown_live` only. |
| GE2 E2 closes before first await | 1, 2 | **TE2.** Direct `_teardown_live` with `store.active_run` (`:1082`) blocked. Attempts during the block and at each later step make zero RPCs. | Closing after `:1082`. |
| GE3 E3 closes at entry | 1 | **TE3.** Direct `safe_shutdown_heat_off` closes the fence before `:6365`. The e-stop is still admitted. | Removing E3. |
| GE4 E4 closes at entry (lifespan) | 1, 2 | **TE4.** Non-CLI `_lifespan` teardown: the fence is closed when the `:6459` await begins. | Closing after any `shutdown` await. |
| GE5 cleanup failure before loop cancellation | 5 | **TE5.** Parametrised over: `:6459` raises; `:6464` raises; `:6472` re-raises; heat-off raises; `:6421` raises; combinations. `_cleanup_step` swallows, the loop stays alive, and `mcp.stop` is pending with the session attached and the flag false. Ticks make zero READ or CONTAINMENT RPCs and zero guarded HEAT/FAN/DROP/CONTAINMENT/SESSION_START dispatches other than the exact flagged emergency retry. That retry and NON_HEAT match base policy with zero new fence reads. The fence is still closed after teardown. The e-stop is admitted wherever the base admits it. | Removing all close sites reproduces the probe's `command_state_returned`. Reopening on a swallowed failure. Fencing the exact flagged emergency retry. |
| GE6 healthy stop needs the fence | 10 | **TE6.** Healthy requested stop (§2.4 row 1): during `aclose` the session is attached and the flag is false. With E6 closed, the result is `NOT_ATTEMPTED` with zero calls. | Relying on `stop_unconfirmed` alone. |
| GE7 E6 closes before stop | 1, 2 | **TE7.** Respawn with `stop()` pending, the probe interleaving through the application: zero calls. | Closing after `:2806`. |
| GE8 failed respawn stays closed | 8 | **TE8.** In turn: the `:2813` raise, `start()` raising, and a hardware clear. The fence stays closed after each. The next successful respawn reopens it. | Reopening in a `finally`, or on clear. |
| GE9 reopen criteria and dispatch atomicity | 8, 2 | **TE9a.** Each reopen predicate false on its own prevents reopening. All true: reopened, with zero MCP calls, zero heat or fan, zero scopes. After APPLICATION_TEARDOWN, reopening returns false. **TE9b.** A CONTAINMENT admitted at preconditions waits in the arbiter. The fence closes. The arbiter discards it (`:244-258`) with zero transport calls, `CONSUMED` retained and the disposition unchanged. A spy shows no other task runs between the final `admitted()` and registration. | Dropping any reopen predicate. Downgrading the teardown reason. Checking only at preconditions. |
| GE10 refusal opens nothing | 2 | **TE10.** The fence is checked before registration. A refusal leaves no marker, calls no adapter method and produces no "never awaited" warning. | Registering before the check. |
| GE11 typed READ refusal | 3 | **TE11.** For `ADMISSION_CLOSED` and `READ_ALREADY_PENDING`, outside and inside the latch, with no pending emergency retry: counter unchanged; `record_read_failure` called; `read_failed` false; no `evaluate_mcp_failure`; no RECOVERY or FAULT evaluation; no transition; `_routine_inhibited` true; zero heat, fan, drop or containment; the latched path holds; the next bound read is UNPROVEN; the type is not `ContainmentOutcome`. READ never receives `CHILD_TEARDOWN_UNCONFIRMED`. | Mapping the refusal to an exception (counter +1, FAULT); to an envelope or `None` telemetry (counter reset, RECOVERY); or to `NOT_ATTEMPTED`. Skipping the tracker break. |
| GE12 containment refusal is known non-dispatch | 4 | **TE12.** Each refusal yields `NOT_ATTEMPTED`. A precondition refusal does not consume the attempt. The cache is unchanged. SETTLED stays SETTLED. Zero `set_heat` and zero e-stop substitution. | Mapping to `UNKNOWN_*`. Consuming on a precondition refusal. |
| GE13 pending at closure | 7 | **TE13.** A CONTAINMENT is pending when E1, E2 or E6 closes. The stop proceeds. Cancellation, timeout, malformed and COMMAND_STATE_RETURNED outcomes are each classified per §2.6, with UNKNOWN published before the scope exits. A pending READ completes and is consumed normally, and only its marker is released. | Releasing the scope before UNKNOWN is published. Cancelling pending calls at closure. |
| GE14 emergency and cleanup preserved | 6 | **TE14.** Closed fence: shutdown e-stop/bounded retry, runner e-stop, exact-session fault-control e-stop, existing terminal emergency heat-off retry, child stop and required cleanup keep base calls and bounds with zero new fence reads. | Adding either new condition to any preserved path. |
| GE15 no local settlement | 7 | **TE15.** A prior UNKNOWN, then a refused attempt, then a B discard, then a clean `stop()` with the flag false, then a successful respawn and reopen. Ownership is still UNKNOWN, Start is still refused, and zero reconnect, respawn or Start is initiated automatically. | Clearing UNKNOWN on any of these steps. |
| GE16 one fence per adapter | 9 | **TE16.** Fresh, recovery and replacement runners hold the identical fence object. An old live tick task and a detached loop both observe a later closure. TD7 refuses across runners. | A per-runner fence, or per-runner exclusivity. |
| GE17 unexpected owner exit | 10, 13 | **TE17.** Set stop_unconfirmed before unwind with application fence open. READ makes its ordinary RPC and retains failure/FAULT flow after detach; CONTAINMENT is refused; HEAT/FAN/DROP/SESSION_START are discarded. START_COOLING and emergency follow base policy. An above-hard-limit READ reaches EMERGENCY_STOP despite teardown_unconfirmed; a protective DROP discard follows the existing WITHHELD projection, with RD-1 NOT_ATTEMPTED and not consumed. | Drop each guarded-class condition; incorrectly gate READ/NON_HEAT/emergency. Each mutation has its designated assertion. |
| GE18 D-9 HUMAN runner refused after teardown | 8 | **TE18.** Under APPLICATION_TEARDOWN, HUMAN runner construction is refused before reset: zero resets, zero `start_roast_session`. AUTOMATIC Start behaves as at base. | Omitting the predicate (HUMAN row). Applying it to AUTOMATIC (parity row). |
| GE19 AM-2 Start versus reset | 11 | **TE19.** `start_roast_session` held pending, then an e-stop or fault, then a new `start_roast`. The new Start is refused, with zero resets and zero publish into a newer generation. `PendingHumanCall` is exactly `{READ, CONTAINMENT}`. | Removing the relied-on guard. If the test cannot pass, `ESCALATE`. |
| GE20 AUTOMATIC parity and surface freeze | 12 | **TE20.** T52/T52b extended: AUTOMATIC dispatch, teardown and respawn give the same executor calls, events and rows as base. The AUTOMATIC `routine_admission_is_current` never reads the fence. Diff check: no AM-3 hunk in `mcp_client.py` or `human_protection.py`; no route, model, schema, SSE or `RoastEventKind` change. | Any HUMAN leak into AUTOMATIC. Any external-surface change. |
| GE21 plain closed enums | 12 | **TE21.** T15 extended to `AdmissionCloseReason` and `HumanCallRefusal`: plain `Enum`, exact member sets. | `StrEnum`, or an extra member. |
| GE22 selective queued-write fence | 13 | **TE22.** Queue HUMAN HEAT/FAN/SESSION_START and DROP behind an in-flight call; close before release under both NOT_ACTIVE and shutdown-admission-failure variants. Guarded writes make zero RPC; DROP becomes WITHHELD. Queued start/stop cooling, marks and live D212 match base with zero new fence reads. AUTOMATIC matches base. | Remove guarded condition; apply it to NON_HEAT; apply it outside HUMAN. |
| GE23 B: pending READ completes after closure | 13, 7 | **TE23.** A READ admitted before E1 is held; E1 closes; the READ returns bound evidence. **(a)** FRESH, BT ≥196 °C, charged PRE_FC: the evidence is consumed (counter reset per AM-1, tracker observe); the endpoint is ADMITTED; dispatch is discarded, leading to WITHHELD and zero `drop_beans`; RD-1 is `NOT_ATTEMPTED` and not consumed, with zero transport calls; existing projection. **(b)** Below threshold: zero `set_heat`/`set_fan`. **(c)** Above the hard limit: the EMERGENCY_STOP path dispatches without consulting the fence. | Removing the §2.7 term (`drop_beans` or `set_heat` gets called). Treating the late READ as refused (a/c fail). Gating emergency on the fence (c fails). |
| GE24 B: in-flight at closure unaffected | 13, 7 | **TE24.** A HUMAN drop, and separately a HEAT write, whose `operation()` has started when E1 closes. They are not cancelled. A drop result is classified per the existing table (ISSUED, or UNKNOWN on raise/timeout/`None`). The fence never reclassifies it. | Cancelling or reclassifying in-flight operations at closure. |

| GE25 exact emergency retry exemption | 6, 13 | **TE25.** Fence closed, loop alive, parameterise existing retry arming sources: shutdown e-stop failure, cancellation, latched escalation and fault-control re-arm. Use each existing caller/flag path without adding an arming source. Next terminal tick attempts exactly set_heat(0) then its existing overrun-safe fan target under base policy, with zero new fence reads. Ordinary HUMAN heat-zero request is discarded. | Put the new condition before exemption; widen exemption to any heat-zero request. |
| GE26 fault-control path classification | 6, 13 | **TE26.** Closed fence: fault-control cooling, D212 and e-stop match base exact-session lease policy with zero new fence reads. Fault-control HUMAN DROP invokes no write_fault_control and follows the existing WITHHELD disposition/projection under §2.9; RD-1 is NOT_ATTEMPTED and not consumed. Repeat DROP with only teardown_unconfirmed true. | Omit HUMAN recovery-drop condition; apply it to cleanup/emergency; leak into AUTOMATIC. |

**Causal controls.**
- One control per guard, GE1–GE26.
- Stop on the first invalid witness and preserve it.
- Restore by `cp`, with hash verification.
- Never rerun the original 42 or unchanged controls.
- Prior receipts stay bound to their own heads.

---

## 4. Class sweep (run in `{IMPL_WORKTREE}`, and by the lead under §0 gate 3)

Expected sets come only from the supplied ranges at `6e0eb5f`. Record and classify every other hit.

| ID | Class | Command | Expected / after |
|---|---|---|---|
| Q-1 | Child-stop callers | `rg -n -e '\.stop\(\)' -e 'mcp\.stop\b' src/roastpilot_agent` | Executable: `api.py:2806` (E6), `cli.py:1096` (E1/E2), `live.py:188` (no adapter). Unrelated: `api.py:1350` (scheduler). Prose: `cli.py:1048`, `:1049`, `:1141`, and `api.py` comments. After: unchanged. Any other executable `MCPServerProcess.stop` caller without a preceding synchronous close triggers the §2.4 contingency. |
| Q-1b | Stop-request setters | `rg -n '_stop_requested' src/roastpilot_agent/mcp_client.py` | `.set()` at `:3124` only. Re-created at `:2968`. Cleared at `:2789`, `:3063`, `:3078`, `:3176`. Read at `:2841`, `:2944`, `:3116`. Any other setter triggers the §2.4 contingency. |
| Q-2 | Fence mutation | `rg -n -e 'close_human_call_admission' -e 'reopen_after_respawn' -e 'HumanCallAdmissionFence\(' src/roastpilot_agent` | After: one construction (service `__init__`); closes at E1, E2, E3, E4 and E6; one reopen after `api.py:2821`; the definitions. |
| Q-3 | HUMAN adapter call sites | `rg -n -e 'read_human_evidence\(' -e '\bcontain_heat_fixed_zero\(' src/roastpilot_agent` | Base: definitions at `mcp_client.py:1643` and `:1832`; protocol at `controller.py:472` (verify). After: exactly one production call site each, inside its admission segment. |
| Q-4 | `stop_unconfirmed` readers | `rg -n 'stop_unconfirmed' src/roastpilot_agent/api.py src/roastpilot_agent/cli.py` | Executable: `api.py:2813`, `:5656`, the parameter at `:6529`; `cli.py:1097`, `1100`, `1103`, `1123`. The rest are docstrings or the `record_child_stop_unconfirmed` name. After: plus the single `teardown_unconfirmed` predicate and the reopen step. |
| Q-5 | Emergency paths do not touch the fence | `rg -n -e 'admit_emergency_stop' -e 'run_emergency_stop' -e '_admit_shutdown_emergency_stop' -e 'operator_emergency_stop' -e 'write_fault_control' src/roastpilot_agent` | Classify each hit, including `api.py:1478`, `:1566`, `:6364`, `:6387`, `:6409`; `controller.py:142`, `:267`, `:5735`; `mcp_client.py:1589`. Zero fence, HUMAN-admission or `routine_admission_is_current` references inside the emergency bodies. |
| Q-6 | Frozen S2 | The AM-2 R-1 regex (27 base hits at `cd92250`; re-count at the base), plus `git diff <S2-merge> -- src/roastpilot_agent/mcp_client.py src/roastpilot_agent/human_protection.py` | No AM-3-attributable hunk. |
| Q-7 | Closed enums | `rg -n -e 'class PendingHumanCall' -e 'class HumanCallRefusal' -e 'class AdmissionCloseReason' -e 'StrEnum' src/roastpilot_agent` | Three plain `Enum` definitions with the §2.2 and AM-2 members. |
| Q-8 | `_shutdown_started` | `rg -n _shutdown_started src/roastpilot_agent` | Base api.py: initialisation2554; reads2987,3023,3056,3084,3304,3368,3431,3438,3637,3688,3810,3831,4025,4047,4049,4066,4204; set6454. Preserve all existing retirement/D212/projection bindings. After: additional reopen read. |
| Q-9 | `_build_runner` and resets | `rg -n -e '_build_runner\(' -e 'reset_session_identity_for_new_run\(' src/roastpilot_agent` | Supplied: `api.py:5883`, `:5992` (definition), `:6026`, `:6292`; `mcp_client.py:1432` (definition), `:1798`. Every operative site sits behind the AM-2 and D-9 predicates. |
| Q-10 | HUMAN routine and fault-control dispatch | `rg -n -e routine_admission_is_current -e "_run_routine_write\(" -e "execute_fault_acknowledgement_stop\(" -e allow_emergency_stop_transition_for_heat_off src/roastpilot_agent` | Classify controller calls2493,2558,2567,3577,5001,5336,5599,5652,5709,5771,5814; definitions as definitions. Fault-control744/919 is distinct, not a bypass. After: selective HUMAN condition and existing HUMAN recovery-drop recheck; exact retry/NON_HEAT/other fault-control paths have zero new fence reads. Verify every sibling and the exact emergency flag caller set. |

Also retained: the ratified S-1 to S-9 sweeps, the original lifecycle sweep, the AM-1 §4 sweeps, and AM-2 R-1 to R-6. The S3 PR body lists the classified Q-1 to Q-10 output.

---

## 5. PR plan

- **No new slice.** AM-3 joins S3 (`feature/1076-human-mode-protection-controller`, `Refs #1076`). S3 stays one cohesive actuation-ownership unit, serial after S2 merges.
- **The four-PR plan is unchanged.** S4 is unaffected.
- **AM-3 estimate: about 55–95 logic lines.**

  | Part | Approximate lines |
  |---|---|
  | Fence and types | 25 |
  | Close sites and reopen | 15 |
  | Admission segments | 20 |
  | Refusal branch | 15 |
  | D-9 predicate | 5 |
  | D-10 B-corrected term | 5 |

- **S3 total:** the ratified 550–700, plus AM-2's 30–60, plus AM-3's. Re-estimate at kickoff.
- **PR body rationale:** the fence must ship with the latch, the dispatch fence and the lifecycle gate. Separated, it would leave a gate that admits late calls during stop.
- `cli.py` enters the S3 path set.

---

## 6. Routing

| Slice | Required before opening (the parent may only add reviewers) |
|---|---|
| S3 with AM-3 | `safety-reviewer`; `sim-roast-runner`; `mcp-contract-checker` (stop and child-lifecycle interaction); `qa` (expected to be mandatory, since the S3 test diff is likely over 600 lines); `security-reviewer` only if the diff touches the decoder (AM-3 itself does not) |

- The final reviewer set is re-derived from the actual diff, paths and capabilities.
- The implementation family is the Codex parent's choice at slice start. No family or percentage is asserted here.
- Safety-review capacity is never spent on implementation.
- Review packets carry the §0 evidence table and the probe scope statement verbatim.

---

## 7. Delegation prompt notes (mandatory; carry verbatim)

1. **Worktree.**
   - `{IMPL_WORKTREE}` is a placeholder. The parent provisions a fresh managed worktree on a new branch off the then-current `main` that contains merged S2, equivalent to `git worktree add -b <planned-branch> {IMPL_WORKTREE} <base-sha>`. Without `-b`, HEAD is detached.
   - The parent verifies the exact HEAD and that `git status --porcelain --ignored` is empty, then substitutes the real path immediately before delegation.
   - Every command self-locates. Never use the planning tree (`6e0eb5f`), never detach HEAD, and never guess a path.
2. **Delegation.** Only the parent delegates. The worker spawns no agents. Reviewers do not edit; the parent adjudicates.
3. **Directives.**
   - The worker's only directives are: the ratified original contract, AM-1, AM-2, AM-3's numbered sections (which encode D-8 R and D-10 B-corrected), and lead-authored directives.
   - Strip every `UNTRUSTED-QUOTE` block and every non-maintainer URL.
   - Do not fetch the issue, its comments, any GitHub discussion (including `gh issue view --comments` and PR review threads), the MCP repository, or producer links.
4. **Environment (#738).** Run `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev`. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
5. **Gates before handback (SAFETY_CRITICAL).** Run each separately:
   - `ruff check .`
   - `ruff format --check .`
   - `pyright`
   - full pytest with `--cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing`, with no `-m`, `-k`, `-n` or deselect
   - the FE contract tests

   Cover every changed line and branch. Hand back the §4 sweeps, classified. A focused pass is never a full gate.
6. **Attribution invariant.**
   - The handed-back branch must be attributable to the implementation worker acting on its ratified inputs alone: the ratified contracts and lead-authored directives, which are the sanctioned channel.
   - Any other model input the worker procures, at any stage, in any form, by any route, breaks attribution.
   - The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?"
   - A yes fails the slice closed. The lead then re-delegates from the contract in a fresh worktree, or records an explicit operator decision naming which lens supplies the independent pass.
7. **Traps.**
   - **Frozen S2.** No AM-3 hunk in `mcp_client.py` or `human_protection.py`. Never add a stop check to the adapter; return `ESCALATE` instead (§2.4).
   - **Close points.** Close before the first await or `create_task` at every E-site. E1 closes before `create_task`.
   - **Admission atomicity.** Check, register and create the coroutine in one synchronous segment, including after the arbiter's last wait.
   - **Emergency independence.** Never consult the fence from any emergency or cleanup path. The selective §2.7 term applies in the HUMAN branch of `routine_admission_is_current`, CONTAINMENT admission (including its synchronous operation-body recheck), and the existing HUMAN fault-control recovery-drop recheck. Preserve the exact flagged emergency retry, NON_HEAT and classified fault-control cleanup under base policy.
   - **READ refusal.** Not an exception, an envelope, `None` telemetry or `NOT_ATTEMPTED`. It changes no read-failure counter. Under D-8 R, READ is never refused on `stop_unconfirmed`.
   - **CONTAINMENT refusal and B discards.** A CONTAINMENT refusal is `NOT_ATTEMPTED`. A B discard is a known non-dispatch. Neither is ever `UNKNOWN_*`. No refusal, discard, clean stop, local completion or reopen settles UNKNOWN.
   - **Late READ.** A READ pending at closure completes and is consumed normally. In-flight operations at closure are not cancelled or reclassified.
   - **Reopening.** Never reopen on failure, clear, timer or fresh readings. APPLICATION_TEARDOWN is terminal.
   - **Closed enum.** No new `PendingHumanCall` member. The pending-Start obligation is proven or escalated (§2.8).
   - **No external surface.** No HTTP route, model, SSE payload, schema or `RoastEventKind`. Application edits to `api.py`, `cli.py` and `controller.py` are expected. AUTOMATIC behaviour is unchanged.
   - **General.** Plain `Enum` and Celsius only. No new threshold, timeout or dependency; the `coffee-roaster-mcp==0.2.4` pin stays. No HUMAN enablement surface. Do not touch `cold_characterisation/*` or `COMMAND_PHASE_MATRIX`. Do not fix F-AUTO.
   - **Base drift.** If any §2.1, §2.4 or §2.7 fact contradicts the base, stop and return `ESCALATE`.
8. **Fixtures.** Lift the probe interleaving (synthetic owner and session over the real `MCPServerProcess.stop`) into application-level tests. No MCP or FE fixture changes.

---

## 8. Risk profile

**Blast radius.**
- AM-3 governs HUMAN read, containment and selectively guarded roast-actuation admission during process teardown and between-roast respawn, preserving the exact emergency retry and existing NON_HEAT/cooling policy.
- The hardware consequence is indirect: a containment, heat, fan or drop write to a child that is being torn down.
- Data sensitivity is low. There is no new principal, credential, endpoint or schema.
- HUMAN mode stays unreachable (AC-NA).

**Break these first:**
1. A tick running in the `create_task` gap.
2. An await before the close at E1, E2, E4 or E6.
3. An admission that straddles an await.
4. A cleanup failure at `api.py:6459`, `:6464`, `:6472` or `:6421` that leaves a live loop able to reach the adapter.
5. A queued HUMAN write, or a write driven by a late READ, dispatching after closure.
6. A refusal mapped to an exception or an envelope, or a READ refusal mapped to `NOT_ATTEMPTED`.
7. A refusal, discard or clean stop clearing UNKNOWN.
8. A reopen after a failed respawn or a hardware clear.
9. The fence reaching an emergency path.
10. A per-runner copy of the fence or of TD7.
11. An unenumerated `stop()` caller or `_stop_requested` setter.
12. An unclassified guarded HUMAN actuation path that omits the §2.7 condition; fault-control cleanup and exact emergency retry are intentional exclusions.
13. An AUTOMATIC leak through D-9 or §2.7.

**Residual risks (not claims):**
- While the fence is closed and a HUMAN loop is live, a READ refused by the fence produces no hard-limit verdict. Heat-off depends on the shutdown e-stop, which may be UNCONFIRMED or, at `:6421`, never admitted.
- An admission made before closure, if already in flight, may dispatch into a closing stream. It is classified honestly (UNKNOWN or command state), never settled.
- During teardown, guarded roast actuation is refused, while emergency retry and NON_HEAT/fault-control cleanup retain base policy. A protective drop may be withheld and require physical intervention. Existing cooling commands can still fail or be refused by their own guards; no automatic cooling or physical-success guarantee is introduced.
- Under D-8 R a READ may return data while an unexpectedly exiting child remains attached. The additional teardown-unconfirmed condition blocks guarded roast actuation; READ retains existing hard-limit and failure handling. Preserved emergency/cooling may still fail against a dying child; command completion is not physical proof.
- AUTOMATIC Start during teardown is unchanged (F-TEARDOWN-START, §9).
- The probe exercised no real SDK teardown and no application guard.
- The pending-Start proof is only a sketch (§2.8).
- F-AUTO is unresolved; its issue status was not supplied.
- The S2 receipts at `6e0eb5f` do not cover S3.
- The §2.11 inventory is lead-verified, not proven.

---

## 9. Owner decisions ratified with AM-3 (closed table)

Each row takes effect only if the owner ratifies these exact bytes. "Lead recommendation" marks a proposal, not an owner selection.

| ID | Decision encoded in these bytes | Status | Alternative not encoded (would need revised bytes) |
|---|---|---|---|
| D-5 | Application-only fence. No adapter change and no amendment to AM-2 §2.5 item 1, on the §2.4 evidence. | Proposed | An adapter stop-requested precondition. Asked only if the §2.4 contingency fires. |
| D-6 | READ refusal semantics (§2.6): no counter change, tracker continuity break, routine inhibited, no phase transition. Accepted consequence: a run refused with `READ_ALREADY_PENDING` outside teardown stays inhibited without a recovery projection; emergency and end remain available. This case is reachable only across runner replacement with an old live tick task. | Proposed | Mapping to read failure (fabricates FAULT), to RECOVERY (implies an evaluated reading, triggers RD-1), or an added OPERATOR_RECOVERY_REQUIRED transition. |
| D-7 | Reopening (§2.5): teardown is terminal; respawn reopens only on success with every predicate holding. | Proposed | — |
| D-8 | **R, corrected:** READ remains available after unexpected child-owner failure to preserve existing evidence/hard-limit and read-failure/FAULT handling. `stop_unconfirmed` blocks CONTAINMENT and guarded roast-actuation classes under §2.7. Explicit application teardown still refuses new READ. | Proposed; selected only if ratified | C would refuse READ and require separately defined lost-child failure handling. |
| D-9 | HUMAN runner construction under APPLICATION_TEARDOWN is refused before reset. AUTOMATIC Start is unchanged. | Proposed | — |
| D-10 | **B-corrected:** selective open-fence AND not-teardown-unconfirmed condition for HUMAN HEAT/FAN/DROP/CONTAINMENT/SESSION_START. Exact existing emergency heat-off retry is exempt from new conditions. NON_HEAT/cooling and fault-control cleanup retain base policy. HUMAN recovery DROP uses its existing recheck. No enum split or new cooling policy. | Proposed safety correction; selected only if ratified | Broad B is rejected because it blocks emergency retry/cooling and misclassifies fault-control. A leaves queued/late-read actuation inadequately fenced. |
| D-11 | Teardown begins at `_finish_live_teardown` entry (E1), not at signal receipt. | Proposed | — |
| D-12 | New closed types `AdmissionCloseReason`, `HumanCallRefusal` (including the typing of AM-2 TD7 as `READ_ALREADY_PENDING`) and `RefusedHumanCall`. No `PendingHumanCall` member is added. | Proposed | — |

**F-TEARDOWN-START (proposed separate issue; the owner decides whether to open it).** In the supplied source, AUTOMATIC `start_roast` has no `_shutdown_started` check. AM-3 does not change this.

**What approval covers.** Approval covers this software contract only. It does not authorise implementation before the §0 gates, hardware, live operation, merge or release, and it waives no review.

**Before posting:**
1. Run a mechanical secret scan over the exact text.
2. Bind AM-3's SHA-256 beside the original, AM-1 and AM-2 hashes.
3. Recompute the watermark (§0).
4. State in the ratification record that D-8 = R and D-10 = B-corrected are selected by ratifying these bytes.
5. Add the provenance marker only after owner ratification.
