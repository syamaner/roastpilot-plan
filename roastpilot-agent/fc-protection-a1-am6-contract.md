# A1 contract amendment AM-6 (proposed): exact-session priority emergency dispatch for qualifying HUMAN finalisation, on both the global and per-run routes (Agent #1076)

**Status: proposed with lead corrections, not ratified.** This text authorises no implementation, delegation, merge, deployment, hardware action or live admission. No worker may use AM-6 until the owner ratifies these exact bytes.

**Authority.**
- **Owner direction (16 November 2026, lead-recorded in `owner-approved-direction.md`; Plan D236 restates it):** "Approve the exact-session priority emergency correction for both global and per-run HUMAN finalisation, retaining the cooling lock. Proceed with the corrected contract and keep coordinating with the roast agent."
- That is a direction, not ratification of this contract.
- It **supersedes the architecture recommendation of a global-only correction** (`architect-advice-not-authority.md` §6.2). The architect's text, including its pseudocode, is context only. This document's §2 governs, including every generation, token and cancellation detail the architect omitted.

**Provenance.**
- This is text-only story-planner output. I had no tools, no filesystem, no MCP and no added directories.
- Every citation is a `file:line` in a parent-exported excerpt bound to Agent `da3a9a58d321bba07d9625c15b0eb6b6ca63af70` (cited as "@da3a9a5"). Exports without line numbers (`sdk-*.py`) are cited by function.
- This run took place outside native capture. No D219 confinement is claimed, and no gate, test, review, hardware, readiness or release claim follows from it.

**Documents that stay authoritative** except where §2.10 explicitly amends them:

| Document | SHA-256 |
|---|---|
| Original A1 | `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f` |
| AM-1 | `360432547cb36bbe8cd8ce63131e047dc28bb1ac4d32f892f36757236f86a41a` |
| AM-2 | `5cd7ae775efc306d21f4e37452ddd8b11a34ddc5c6f92e03d2d7ac5cba6d3369` |
| AM-3 | `f9057dd9d9b7c99b7f1d6995f5b5d3b8ac9fc3f52e0cb053c0644975a21f0979` |
| AM-3 TE15 correction | `49fac6accf148efb9b41f4c559090d9b6e65cd3d02b3845fa12a7a5a4879df36` |
| AM-4 | `abafd10971ab252e8751f0c19d76ad9ebfc327f653cd7d7aaa3870485f0e6714` |
| AM-5 (ratified, OWNER comment 6901567572) | `9bcad75d3a9722ab7b89f2d25507a8ba3a775d39d9d24696d3657284b3aed314` |

**Scope.**
- AM-6 adds no slice. It joins S3.
- It changes only the dispatch target and result semantics for the narrow set of requests that already qualify under AM-5 (D-18 to D-21). It extends that same qualification to the per-run route.
- It does **not**:
  - broaden producer admission or change the producer API;
  - change the ordinary adapter `emergency_stop`, the `CommandExecutor` protocol, `FaultControlExecutor.execute`, `_queue`, `_drain` or `_worker`;
  - change cooling admission or projection, AUTOMATIC behaviour, or historical, finalised or different-run routing;
  - add a schema, model or API field, route, SSE shape, `RoastEventKind`, enum member, threshold or timeout;
  - authorise fixes for other unbound stopped-fault callers. Those stay named readiness prerequisites (§8, RP-1 to RP-8).

---

## 0. Bindings, evidence and gates

| Binding | Value (as supplied by the parent) |
|---|---|
| Implementation base (read-only planning tree) | Agent `da3a9a58d321bba07d9625c15b0eb6b6ca63af70`, reported clean including ignored files (`binding.json`) |
| Plan | `d0dce0746e358b5ccaae463b27a783a5bc511592`, reported clean and pushed (`binding.json`). Plan main remains `93806f4c1049b86b21c3309a5f3cba3982708b98`. The plan branch is not Plan main. |
| Plan anchors | Plan D230 to D235 governed the earlier amendments. D236 (`plan-d236.md`) records the AM-6 direction. The active epic is E11-packaging. AM-6 does not touch E11-S3 or #954. |
| Issue | #1076. Author `syamaner`, `OWNER`. Body SHA-256 `48a60e43f3a22234c90757d02d71d2779a929cf8c52c2e0d35657a88519a472b`. |
| Pre-AM-6 comments (all `OWNER`, verified by the parent) | 6796642729 @ 2026-11-11T13:07:07Z; 6833383146 @ 2026-11-12T19:12:47Z; 6875804554 @ 2026-11-14T10:19:06Z; 6894208392 @ 2026-11-15T12:19:18Z; 6894426652 @ 2026-11-15T12:37:47Z; 6899582798 @ 2026-11-15T18:59:09Z; 6901567572 @ 2026-11-15T21:22:25Z |
| Watermark (as supplied) | `50913d98ee371ac5d358f9aa4da5f442701de3f829dee255b5c9b9bbd66676e4`. The lead recomputes it with the comment-6796642729 encoding, excluding the AM-6 post. |
| Environment (`environment-binding.json`) | Python 3.11.14; coffee-roaster-mcp 0.2.4; mcp 1.30.0; pydantic 2.13.5; aiosqlite 0.22.1; pytest 9.2.0; pyright 1.1.410; ruff 0.17.5 |

**A-0. Plan SHA ancestry resolved by the lead.** `plan-context.md` ends with "Plan branch SHA 2c8fd2b0af1307515571425add16b0a81dce54eb", while `binding.json` binds `d0dce07`. I treat `d0dce07` as bound, because that is the invocation binding and it contains D236. The lead verified `git merge-base --is-ancestor 2c8fd2b d0dce07` exits 0. The older context is historical; D236 is bound at d0dce07.

**Evidence (bound to its own head; none of it certifies AM-6).**

| Item | Receipt and its limit |
|---|---|
| Full native gate @da3a9a5 | Exit 0: 16,548 passed, 14 skipped, 2 warnings (parent-supplied). This covers AM-5 code only, and AM-6 invalidates it as evidence for the repaired head. |
| Focused AM-5 tests @da3a9a5 | 44 passed, 80 deselected. The QA review notes the receipt carries no embedded head SHA or command. |
| FE contract | 314 passed (parent-supplied). |
| Producer probe (`producer-probe-result.json`) | Installed 0.2.4 over real stdio with the MOCK driver, no recording, single calls. On a stopped fault session, an unbound `emergency_stop` raised `MCPToolError "No active roast session exists."`; the exact-session call returned `driver_called: true`, `driver_error: null`. This is diagnostic command-admission evidence only. It is not physical confirmation and was not run through the agent stack. It used the tolerant client emergency method, not strict FaultControlCommandResult validation; RS1 must establish that validation through the actual executor path. |
| Source reviews (MCP, QA, safety, simulation) | Four reviews completed. MCP F1 is confirmed and blocks delivery. No final PASS exists. |
| Causal controls for AM-5 GG rows; Q5-2 to Q5-7 receipts | Not supplied. They remain outstanding and must not be relabelled. |

**Producer and SDK facts that settle the MCP checker's open questions** (from the supplied source):
- **Unbound calls need an active session.** An unbound `emergency_stop` calls `_require_active_session` (`producer-server-source.txt:1238-1239`, `:1415-1420`). That fails when the latest session is inactive (`producer-session-source.txt:2261-2266`), before `run_driver_emergency_stop` (`:1248`).
- **Bound calls work on a stopped fault.** A bound call passes `_require_guarded_fault_recovery_session(allow_in_flight=True)` (`server:1240-1246`, `:1437-1463`; `session:1255-1268`). It requires the session to be latest, inactive and in phase `fault`.
- **Unverified containment is a failure.** A bound call without verified containment raises (`server:1252-1260`).
- **FastMCP runs a synchronous tool body on the server's event loop.** The non-async branch of `FuncMetadata.call_fn_with_arg_validation` calls `fn(...)` directly (`sdk-func_metadata.py`). Requests are started with `tg.start_soon` (`sdk-server.py`, `Server.run`). So while one synchronous producer tool runs, no other request is serviced, and a producer proof read and an e-stop are serialised server-side.
- **Exceptions become error results.** A tool exception becomes `ToolError` (`sdk-base.py`, `Tool.run`) and then an `isError` result (`sdk-server.py`, `call_tool` handler `_make_error_result`). The agent maps that to `MCPToolError`.

**Gates before delegation (all fail closed; any contradiction means `ESCALATE` or re-planning, never a weaker design):**

1. Independent `safety-reviewer` and `mcp-contract-checker` review these exact bytes (D236), and the lead folds in or dispositions their findings.
2. The owner ratifies the exact bytes.
3. The lead refreshes the issue body and every comment, recomputes the watermark and verifies every hash. A-0 is resolved.
4. At the then-current S3 head (`da3a9a5` or a successor), the lead verifies V-1 to V-9. These bodies or facts were not in the packet:
   - **V-1.** `RoastController.admit_emergency_stop` advances the shared arbiter exactly once. (AM-5 M-2 checked this at `750e8af`; re-verify it here.)
   - **V-2.** `RoastRunner.confirm_external_emergency_stop` and `rearm_emergency_stop_fail_safe` behave as the wrapper at `api.py:5390-5394` assumes. They release the gate on confirmation and keep `_EMERGENCY_STOP_RETRY_RULE` armed on failure.
   - **V-3.** `RoastRunner.invalidate_fault_acknowledgement_for_emergency_stop` and the gate's invalidation do not clear `fault_finalization_started`. AM-5 TG12 relies on the reservation persisting after an e-stop.
   - **V-4.** The store-backed `FaultControlTraceSink.record_fault_control_command` and `record_fault_control_evaluation`: identify the actual store write each one reaches. This is the injection point for TG10-C; parent verification confirms record_safety_evaluation and record_command respectively.
   - **V-5.** The executor and the controller receive the same `CommandArbiter` instance. The MCP review cites `api.py:2805`, `:2810` and `:6384`.
   - **V-6.** Service teardown ownership of `_emergency_stop_dispatch_tasks`: parent source verification finds no in-repository canceller or shutdown await of this set. If that changes, ESCALATE. AM-6 changes none of this.
   - **V-7.** A hardware-free composition seam exists that builds a HUMAN-authority `RoastService` and runner over the real `RoasterControlAdapter` and a real 0.2.4 mock child, without adding any config, API or CLI enablement surface. If it does not, return `ESCALATE`; never add an enablement surface.
   - **V-8.** The shape of the `_ExactFaultRunner` fixture (around `tests/test_runner_human_turn.py:1250-1290`), for adding the opt-in rejection in §3.
   - **V-9.** `_execute_terminal_emergency_stop` has no caller other than `api.py:5273`.
5. The lead runs the baseline sweeps Q6-1 to Q6-10 (§4) and classifies every hit.

---

## 1. Acceptance criteria

**Sources.**
- **Issue body (OWNER):**
  - AC-8: "Emergency remains callable; remote service/physical success are separate claims."
  - AC-11: "never present emergency admission or RPC completion as physical evacuation proof."
  - Outcome row: "New owner governs; stale completion cannot release latch or update newer run."
- **Ratified AM-5:** AM5-1 to AM5-9 and D-18 to D-22.
- **The owner direction above, and the lead-recorded boundary in `owner-approved-direction.md` items 1 to 5.**

Every row below is inferred from those sources. Each is a proposal.

| ID | Criterion |
|---|---|
| AM6-1 | **Qualification is unchanged from AM-5 and applies to both routes.** A request qualifies only when all of these hold: the selected runner is the current, unfinalised, same-run live runner; `fault_finalization_started` was true at request entry; `controller_for_human_fault_drop()` is a HUMAN controller; the runner's completion-persistence flag is false (D-20); `human_drop_evaluation_outstanding()` is true (D-19, pending or cancelled); and the capability returned exactly `True` (D-21). The global route (`api.py:5138`) and the per-run live route (`api.py:7845`) evaluate the same capability, in the same synchronous segment as their admission, and only when finalisation was reserved. |
| AM6-2 | A qualifying request is dispatched only through the existing exact-session emergency logic of `FaultControlExecutor`, via a new priority entry point. It never goes through the controller's unbound `emergency_stop`, the executor queue or the worker. |
| AM6-3 | **Exact identity is captured synchronously, with no pre-read.** The session sent is the one in the lease admitted synchronously for this request, captured before the first await. The attempt is not preceded by any MCP read, and there is no unbound fallback. |
| AM6-4 | **One token.** Each request admits exactly one shared-arbiter emergency reservation, through the existing admission. On every entered dispatch path it is consumed or released exactly once, subject to the disclosed pre-first-step event-loop teardown limitation in §2.7. The priority entry point never admits. The runner-local pre-admission ledger entry for a qualifying request is consumed synchronously at routing (D-25). |
| AM6-5 | **One safety evaluation and one writer.** There is exactly one `evaluate_emergency_stop` (the executor's), exactly one exact-session MCP e-stop write and zero unbound e-stop writes per qualifying request. Writes stay serialised through the shared arbiter: the request waits for at most the call already in flight. |
| AM6-6 | **Result semantics (D-24).** Global: `confirmed` only after the guarded exact-session command result and a fresh exact-session readback showing heat 0 (`mcp_client.py:1598-1605`, `controller.py:1049-1061`); otherwise `failed`. Per-run: `accepted` with reason "terminal emergency stop has fresh exact-session proof" only on that same confirmation; otherwise `failed`. Neither result is physical confirmation. |
| AM6-7 | **Failure.** A refused, raised, superseded, unverified or unconfirmed attempt gives `failed`, and the live runner's emergency fail-safe is re-armed. There is no second write, no unbound fallback and no automatic retry of a stale request. |
| AM6-8 | **Cancellation and cleanup.** The dispatch is a service-owned shielded task. HTTP cancellation never cancels it. Cancellation after entry into the arbiter wait but before token consumption releases the token, and any unconsumed result is retrieved by a done-callback (D-26). |
| AM6-9 | **Supersession is retained (AM5-6).** Synchronous epoch invalidation and generation advance happen before routing. The waiting D212 or completion attempt then refuses through its existing checks, with no close, export or `complete_run`. |
| AM6-10 | **Cooling lock retained (AM5-7, D-22), unchanged and disclosed.** |
| AM6-11 | **Non-qualifying requests keep their existing routing and results:** AUTOMATIC, historical, finalised, different-run, non-finalising, no outstanding registration, completion persistence initiated or uncertain, and capability doubt. On the per-run route, capability doubt keeps the pre-existing unbound direct route. That is named readiness prerequisite RP-6, not a new fallback (D-28). |
| AM6-12 | **A qualifying request with no executor or no admitted session fails closed** (D-27): release the token, re-arm, return `failed`, and make no unbound attempt. Public paths cannot reach this state (§2.3, A-1), so it is tested white-box only. |
| AM6-13 | **Tests.** Hardware-free tests exercise both routes in both the D212 proof interval and the persistence barrier: a fake that rejects unbound e-stops on inactive sessions (opt-in), real-stdio service-route tests against the installed 0.2.4 mock producer including cooling-on proof, the corrected TG2 and TG10 oracles, and a real store-write failure. |
| AM6-14 | **Scope (AM-6 §0).** The permitted hunks are §2.11 only. |

---

## 2. Spec

### 2.1 Facts @da3a9a5 (the implementer re-verifies each)

**The unbound direct path that AM-5 selected.**
1. Global bypass dispatch (`api.py:5316-5323`).
2. `_dispatch_admitted_live_emergency_stop` (`:5501`).
3. `dispatch_priority_emergency_stop` (`:1658`), then `_dispatch` (`:1592`).
4. `operator_emergency_stop` (`controller.py:6762`), then `_execute_emergency_stop`, then `self._executor.emergency_stop(reason=...)` (`:5238-5240`).
5. The adapter call `self._client.emergency_stop(reason)` (`mcp_client.py:1919`) sends only `{"reason": ...}` (`:638-641`).

**The direct path reports `accepted` even when the producer refused.**
- The controller swallows the exception and arms a retry (`controller.py:5260-5271`).
- `dispatch_priority_emergency_stop` returns `True` unconditionally (`api.py:1662-1663`).
- The service then maps that to `accepted` (`:5332-5341`).

**The exact-session e-stop exists.** The executor's EMERGENCY_STOP branch (`controller.py:754-839`):
1. Evaluates safety for FAULTED, and on a non-EMERGENCY_STOP verdict releases the token (`:759`).
2. Runs `write_fault_control(EMERGENCY_STOP, expected_session_id=...)` under `arbiter.run_emergency_stop(admitted=generation_current)` (`:775-782`). There is no pre-read (`:771-772`).
3. Rechecks the generation, reads back the exact session, applies `_readback_confirms`, and schedules its audit as a task.

When given `emergency_generation`, `execute` does not re-admit (`:639-644`). It does always queue (`:684`), and the worker drains in priority order (`:703-739`).

**Why the queue is blocked.** The held HUMAN drop blocks the worker inside `_execute_one` (`:964-974`), at `await asyncio.shield(task)` (`:4120`). That is before `_run_routine_write` (`:4184`), so it does not hold the arbiter.

**Arbiter.**
- `run_emergency_stop` waits only for `_in_flight` (`:304-305`).
- If `admitted()` is false it releases the token and raises (`:306-316`).
- If cancelled before acquiring, it releases the token (`:323-327`).
- Once acquired, it consumes the token (`:318-322`).

**Global route.**
- `was_finalizing` is read at entry (`api.py:5148`).
- Identity is captured synchronously at `:5226-5237`: the prior lease session for the same run, otherwise `self._roaster.latest_fault_session_id` for a live runner. This is not an MCP read.
- Lease admission at `:5238`; runner invalidation and admission at `:5247-5249`; persistence scheduled at `:5257`.
- AM-5 routing at `:5264-5270`, then the terminal wrapper at `:5272-5298` or the direct route at `:5316-5342`.
- The wrapper `_execute_terminal_emergency_stop` (`:5356-5395`) confirms the live runner on success and re-arms on failure or cancellation.

**Per-run route.**
- `submit_operator_action` sends a live, unfinalised runner to `_submit_live_emergency_stop` (`api.py:7627-7630`), including during finalisation.
- That function admits the lease with `use_latest_session` true by default (`:7851`, `:5425-5426`), invalidates and admits the runner (`:7862-7864`), schedules persistence (`:7865`), and always dispatches unbound through `_dispatch_admitted_live_emergency_stop` (`:7866-7883`). The result is `accepted` or `failed` with the "controller priority dispatch" reason (`:7889-7903`).
- The existing mapping for a finalised runner turns a terminal `confirmed` into a per-run `accepted` that carries the terminal reason (`:7634-7649`). `OperatorActionResult.result` has no `confirmed` member.

**Runner ledger.**
- `admit_emergency_stop` increments `_admitted_emergency_stops` (`api.py:1685-1688`).
- Only `_dispatch` decrements it (`:1589-1591`).
- The base global terminal route with a live runner never reaches `_dispatch`, so the ledger stays over-counted. This is the observation the safety review bounded.

**Readiness facts.**
- `TickScheduler.run` (`scheduler.py:1308-1319`) has no exception handling. A tick exception that escapes stops the loop.

### 2.2 Executor priority entry point (`controller.py`)

1. **Extraction, no behaviour change.** Move `controller.py:755-839` into a private method, adding `action = OperatorAction.EMERGENCY_STOP` as its first statement so the extracted body retains its fixed action binding. This is the only new statement inside that body:

   ```python
   async def _execute_exact_emergency_stop(
       self,
       session_id: str,
       generation_current: Callable[[], bool],
       run_id: str | None,
   ) -> FaultControlState | None: ...
   ```

   `_execute_one`'s EMERGENCY_STOP branch becomes exactly `return await self._execute_exact_emergency_stop(session_id, generation_current, run_id)`. The `generation` parameter of `_execute_one` is already unused on this branch and stays so. Trace payloads, ordering, the no-pre-read rule, readback and exception propagation are byte-for-byte the same in behaviour.

2. **New public method** (public only so pyright strict accepts the cross-object call):

   ```python
   async def execute_priority_emergency_stop(
       self,
       session_id: str,
       *,
       run_id: str | None,
       is_current_generation: Callable[[], bool],
   ) -> FaultControlState | None:
       """Run one already-admitted exact-session e-stop without the queue or worker.

       The caller must already hold exactly one shared-arbiter emergency
       reservation. This method never admits, never queues and never retries.
       """
       return await self._execute_exact_emergency_stop(session_id, is_current_generation, run_id)
   ```

   - Neither this method nor the private helper accepts an action parameter; the action is always OperatorAction.EMERGENCY_STOP. The method makes no `admit_emergency_stop` call, no `_queue` access, no `_worker` access and no `self._sequence` change.
   - Token release on a non-EMERGENCY_STOP verdict, on a stale `admitted()` and on cancellation before acquisition all come from the extracted body and from `run_emergency_stop`, unchanged.

3. `execute`, `_drain`, the queue tuple, `settle_audit_tasks` and `settle_for_shutdown` are unchanged.

   **Disclosed consequence.** `settle_for_shutdown` (`:1200-1220`) waits for the worker only. A priority call in flight is owned by the service dispatch task (§2.7), not by the worker. This matches the existing direct live dispatch task's ownership class. Gate V-6 records what teardown does with that class; AM-6 does not change it.

### 2.3 Qualification (both routes; unchanged predicate)

`qualifies` is computed once per request, synchronously, after that request's own admission (§2.4 step 2, §2.5 step 4) and before any await. It is evaluated only when `was_finalizing` (captured at request entry) is true and a live runner was selected:

```text
qualifies = was_finalizing and live_runner is not None
            and self._live_estop_bypasses_terminal_writer(live_runner)   # D-21 helper, unchanged
```

**Exclusions.** The capability (`api.py:1413-1420`) and the helper (`:5130-5136`) are unchanged. AUTOMATIC returns False after the authority check alone. A finalised, historical, different-run or absent runner is never selected (AM-5 GG7).

**A-1 (no exact identity while qualifying cannot be reached from public paths).**
- Qualification needs an outstanding registration. Registration exists only inside `execute_human_fault_drop` (`controller.py:4117-4119`), which is reached only from the executor (`:964-974`) for a drop dispatched with the lease session. So an executor exists, and the run's lease carried a session at registration.
- D212 aborts synchronously if `latest_fault_session_id` is `None` (`api.py:1824-1827`).
- AM-2/AM-3 lifecycle ownership blocks reset or Start while HUMAN ownership is unresolved.

So `executor is None` or "no admitted session" while qualifying is white-box only. Tests must not require it through public paths. D-27 defines the fail-closed result anyway.

**A-2 (the two routes source identity differently; both are "captured at admission").** Global uses the prior same-run lease session, with the roaster's latest as fallback (`:5226-5237`). Per-run uses the roaster's latest (`:5425-5426`). In a qualifying window both equal the registered drop's lease session, because nothing can change the adapter identity under unresolved HUMAN ownership. AM-6 adds **no cross-check read**. Each route sends exactly the session embedded in the lease it admitted, and tests assert both equal the fixture session. If the session diverges, the producer's exact-identity guard refuses (`server:1450-1451`), the result is `failed` and the runner is re-armed. That never becomes unbound.

### 2.4 Global route (`_submit_fault_controls_emergency_stop`)

1. **Unchanged:** `api.py:5147-5257`, including `was_finalizing` at `:5148`, identity at `:5226-5237`, admission at `:5238-5252` and persistence at `:5257`.
2. **Replace** the AM-5 condition at `:5264-5270` with this, inside the same synchronous segment:

   ```text
   qualifies = (was_finalizing and live_runner is not None
                and self._live_estop_bypasses_terminal_writer(live_runner))
   if qualifies:
       live_runner.consume_admitted_emergency_stop_for_exact_dispatch()   # D-25, synchronous
       if executor is None or session_id is None:                        # D-27, white-box only
           await self._command_arbiter.cancel_emergency_stop_admission()
           live_runner.rearm_emergency_stop_fail_safe()
           return FaultControlsActionResult(EMERGENCY_STOP, "failed",
                  "software e-stop attempt was not confirmed", <existing projection call>)
   if executor is not None and session_id is not None and (live_runner is None or was_finalizing):
       <existing :5272-5298, passing priority=qualifies to _execute_terminal_emergency_stop>
   <existing :5299-5342 unchanged>
   ```

   - The terminal condition is restored to its pre-AM-5 shape.
   - A qualifying request with an executor and a session always enters the terminal branch with `priority=True`. It can never reach `:5316`.
   - A non-qualifying finalising request keeps the queued exact-session executor, with `confirmed`/`failed`.
   - A non-finalising live request keeps the direct route.

3. **Wrapper.** `_execute_terminal_emergency_stop` gains one keyword, `priority: bool = False`. In its `try`, call `executor.execute_priority_emergency_stop(session_id, run_id=self._fault_lease_cache.run_id, is_current_generation=<the existing predicate>)` when `priority` is set, otherwise the existing `executor.execute(...)`. The existing predicate is `self._fault_lease_cache.generation == admitted_generation`. Readback confirmation, confirm, re-arm and cancellation handling (`:5381-5395`) are unchanged.

### 2.5 Per-run live route (`_submit_live_emergency_stop`)

1. **First statement:** `was_finalizing = self._fault_acknowledgement_gate.fault_finalization_started`. No await precedes it on the request path (`api.py:7609-7630`).
2. `admitted = self._admit_fault_control_lease(run_id)` and runner selection are unchanged (`:7851-7858`).
3. In the matching-runner branch, these are unchanged: invalidation, admission, `emergency_generation` and persistence scheduling (`:7862-7865`).
4. Still synchronous: `qualifies = was_finalizing and self._live_estop_bypasses_terminal_writer(runner)`.
5. **If `qualifies`:**
   - `runner.consume_admitted_emergency_stop_for_exact_dispatch()`.
   - Set `session_id = admitted.mcp_session_id` and `executor = self._fault_control_executor`.
   - If either is `None` (D-27): `await self._command_arbiter.cancel_emergency_stop_admission()`, then `runner.rearm_emergency_stop_fail_safe()`, then `confirmed = False`.
   - Otherwise:
     - `dispatch = asyncio.create_task(self._execute_terminal_emergency_stop(executor=executor, session_id=session_id, admitted_generation=admitted.generation, emergency_generation=emergency_generation, live_runner=runner, priority=True))`;
     - `self._track_emergency_stop_dispatch(dispatch)`;
     - `confirmed = await asyncio.shield(dispatch)`;
     - on `CancelledError`: `dispatch.add_done_callback(self._log_cancelled_terminal_estop_dispatch)`, then `raise`.
   - Then set `result = "accepted" if confirmed else "failed"` and `reason = "terminal emergency stop has fresh exact-session proof" if confirmed else "software e-stop attempt was not confirmed"`. Record the operator action as at `:7895-7900` and return `queued=False`.
6. **Otherwise:** the existing `:7866-7903` is unchanged.

There are no new strings. Both reasons already exist at `:5293-5295`, and the per-run mapping copies the finalised-runner precedent at `:7634-7649`.

### 2.6 Token admission and consumption (formal)

| Event (qualifying request) | Shared-arbiter pending | Runner ledger | Owner |
|---|---|---|---|
| Admission: global `:5248`, per-run `:7863` | +1, generation +1 (V-1) | +1 | service, synchronous |
| Routing: `consume_admitted_emergency_stop_for_exact_dispatch` | 0 | −1, floor 0 | service, synchronous, before any task |
| D-27 fail-closed | −1 (`cancel_emergency_stop_admission`) | — | service |
| Executor verdict not EMERGENCY_STOP | −1 (`controller.py:759`) | — | priority helper |
| `admitted()` false after the in-flight wait (stale generation) | −1 (`:311-316`) | — | arbiter |
| Cancelled before acquisition | −1 (`:323-327`) | — | arbiter |
| Acquired | −1, consumed (`:318-322`) | — | arbiter |

**Invariants.**
- **T1.** Every admission whose dispatch reaches its first step is matched by exactly one of the four −1 events. No entered path decrements twice. Cancellation before the first step is the retained event-loop teardown limitation in §2.7, not a proven release path.
- **T2.** The priority entry point never calls `admit_emergency_stop`.
- **T3.** No qualifying request reaches `_dispatch`, so the ledger entry is consumed at routing, exactly once.
- **T4.** After a newer admission, an older request's `admitted()` is false. It releases its own token, gets no write, and is not retried.

The base global finalising route that does not qualify still leaves the ledger over-counted. That is pre-existing, retained as RP-8, and neither fixed nor worsened.

### 2.7 Cancellation and cleanup ownership

- **Dispatch task.** Created only after every synchronous admission and routing step. It is tracked in `_emergency_stop_dispatch_tasks` (`api.py:5401-5404`) and awaited through `asyncio.shield`.
- **HTTP waiter cancelled.** The task keeps running. `_log_cancelled_terminal_estop_dispatch` (`:5344-5354`) consumes its result. The write happens at most once. The wrapper still confirms or re-arms.
- **Dispatch task itself cancelled after entry** (white-box cancellation, V-6):
  - before acquisition, `run_emergency_stop` releases the token;
  - during the write, the in-flight flag is cleared in `finally` (`:330-335`);
  - in both cases the wrapper re-arms the runner and re-raises (`:5384-5387`). No write is assumed.
- **Pre-first-step cancellation limitation.** No in-repository path cancels `_emergency_stop_dispatch_tasks`; V-6 confirms only declaration, readiness checks and track/discard references. Event-loop teardown can cancel a task before its first step, in which case neither token cleanup nor wrapper re-arm executes. This is retained existing behavior, not repaired or reported as covered by TH9. If a new canceller is discovered, stop for contract review.
- **Audit.** The priority helper's trace tasks are retained in `_audit_tasks` and settled by the existing `settle_audit_tasks`. Audit failure never changes the actuator outcome (`controller.py:1115-1119`, `:1142-1143`).
- **Lease persistence.** Owned by the existing `_fault_lease_persistence_tasks`. Unchanged.
- **Nothing in AM-6 cancels** the executor worker, a registered S3 evaluation, the D212 task or the finalisation reservation.

### 2.8 Results: which AM-5 `accepted` outcomes are replaced

| Request | AM-5 result | AM-6 result |
|---|---|---|
| Global, qualifying, write and readback confirm (barrier pending; proof pending; cancelled registration) | `accepted` / "controller priority dispatch" | `confirmed` / "terminal emergency stop has fresh exact-session proof" |
| Global, qualifying, exact write raised, refused, unverified, stale, or readback non-confirming or raised | `accepted` (direct failure swallowed) | `failed` / "software e-stop attempt was not confirmed", runner re-armed |
| Global, qualifying, HTTP cancelled | `CancelledError` to the caller; direct write once | `CancelledError` to the caller; exact write once; result consumed by callback |
| Per-run, qualifying, confirmed | `accepted` / "controller priority dispatch" | `accepted` / "terminal emergency stop has fresh exact-session proof" (now means exact-session confirmation) |
| Per-run, qualifying, not confirmed | `accepted` (direct failure swallowed) | `failed` / "software e-stop attempt was not confirmed" |
| Global or per-run, D-27 (white-box) | — | `failed`, token released, re-armed |
| Global, finalising, not qualifying (empty or raised registry, flag set, doubt) | `confirmed`/`failed` via the queue | unchanged |
| Global, not finalising, live runner | `accepted` direct | unchanged (RP-2) |
| Per-run, not finalising | `accepted` direct | unchanged (RP-1) |
| Per-run, finalising, not qualifying, or capability doubt | `accepted` direct | unchanged (RP-1, RP-6) |
| AUTOMATIC, historical, finalised, different-run, no runner | as at base | unchanged |

`confirmed`, and the per-run `accepted` that now carries the confirmation reason, are both **software command and readback evidence**. Neither proves physical heat removal, drum stop or evacuation.

### 2.9 Cooling lock (AM5-7, D-22 retained)

These are unchanged: cooling refused while the finalisation reservation is held, including after a qualifying e-stop and while storage is held; the projection still offering START_COOLING; no release of the reservation on the escaping-exception branches (`api.py:2102-2105`, `:2160-2163`); and no automatic restoration.

New disclosure: because `TickScheduler.run` has no exception handling (`scheduler.py:1316`), an exception that escapes `_handle_completion` stops the runner loop. In that case there is no next tick, no automatic retry tick and no automatic recovery. Physical intervention may be needed.

### 2.10 Amendment precedence

**Precedence rule.** Later ratified amendments govern only the clauses they list explicitly. Everything else stays in force in the order Original, AM-1, AM-2, AM-3 (with TE15), AM-4, AM-5. AM-6 governs only the rows below. Prior bytes are not modified.

| Clause | AM-6 replacement |
|---|---|
| AM5-1 (target) | Qualifying global **and per-run** requests use the priority exact-session executor entry point (§2.2 to §2.5). The direct live-controller route is no longer used for qualifying requests. |
| AM5-3 | Extended to per-run. Same runner-selection exclusions. |
| AM5-4 | Replaced by AM6-6 and §2.8. |
| AM5-5 | "Exactly one emergency reservation is admitted and consumed or released exactly once (§2.6). No executor *queue* enqueue, no worker involvement, no second hardware writer, no unbound write." |
| AM5-8 | Replaced by AM6-7. Failure is handled by the terminal wrapper's re-arm, with no fallback. |
| AM5-9 | The executor gains one method plus a private extraction. Queue, `_drain`, worker and `execute` are untouched. Otherwise unchanged. |
| AM-5 §2.1 "Per-run route … already direct during finalisation" | Annotated: the direct per-run route is refused by producer 0.2.4 on a stopped fault (§0). For qualifying requests it is replaced by §2.5. |
| AM-5 §2.2 service routing pseudocode and the "falls through … to :5289-5315 direct dispatch" text | Replaced by §2.4. The helper and capability are unchanged. |
| AM-5 §2.4 table rows "direct / `accepted`" | Replaced by "priority exact-session / `confirmed` or `failed`" (global). The retained-cancelled row is replaced the same way. |
| AM-5 §2.5 | Replaced by AM6-7 and §2.7. |
| AM-5 §2.7 hunk set | Extended by §2.11. A5's single condition is replaced, and a per-run consumer is added. |
| AM-5 §2.8 TG14 row | Expect `confirmed`, one exact-session write and zero controller unbound e-stops (§3). |
| AM-5 §3 oracles TG1, TG2, TG4b, TG9 (note only), TG10, TG11, TG13, TG14 and the `flush_raises` row | Replaced per §3. |
| AM-5 §7 trap "Bypass ⇒ the existing `accepted`; never `confirmed`" and "Change only the one condition" | Replaced by §7 item 6. |
| AM-5 §8 residuals "reports `accepted` without an exact-session readback" and "the HTTP result … await the main connection" | Withdrawn only in part. The exact-session write and readback precede storage awaits and the executor audit is asynchronous. The HTTP response still awaits the main connection: the global post-action lease projection read, or per-run record_operator_action. A real stalled connection can delay the response after dispatch. Python-level test holds do not prove otherwise. |
| AM-5 D-18 (target) | Superseded by D-23 for the target only. Its qualification predicate is retained. |
| AM-5 ratification wording "`accepted` rather than `confirmed` for the bypassed global emergency stop" | Superseded by D-24. |
| AM-5 Q5-2, Q5-3, Q5-7 expectations | Replaced by Q6-4, Q6-2 and Q6-9. |
| AM-4 §2.9 bullet 1 as amended by AM-5 ("selects only between two existing dispatch routes") | "AM-5 and AM-6 add one read-only routing input, used by both the global and per-run e-stop routes during finalisation, which selects the queued or priority entry of the existing exact-session executor. It cannot refuse, delay or alter an e-stop's admission, reservation or evaluation." |
| AM-4 P4 / AM-3 TE14 / invariant 12 | Clarified: the per-run capability read is not a fence or DROP-term read. It occurs only after admission and only during finalisation. |
| AM-5 GG12 / TG13 | "No capability read outside finalisation" now holds for both routes. Per-run reads it exactly once during finalisation. |

**Retained unchanged:** D-19, D-20, D-21, D-22; AM5-2, AM5-6, AM5-7; GG3, GG4, GG5(a)–(f), GG6, GG7, GG8, GG8b; and TF11, TF18, TF20, TF22, TF23 together with every AM-4 obligation.

### 2.11 Permitted hunks (closed set; extends AM-4 §2.12 and AM-5 §2.7)

**`controller.py`**
- H1: the `_execute_exact_emergency_stop` extraction, with a one-line delegation from `_execute_one`.
- H2: `execute_priority_emergency_stop`.

**`api.py`**
- H3: `RoastRunner.consume_admitted_emergency_stop_for_exact_dispatch()`, which synchronously decrements `_admitted_emergency_stops` if it is above 0.
- H4: the global routing change (§2.4).
- H5: the `priority` keyword in `_execute_terminal_emergency_stop`.
- H6: the per-run `was_finalizing` capture and the qualifying branch (§2.5).

**Tests:** as listed in §3.

**Nothing else.** Specifically: no change to `mcp_client.py`, the adapter's `emergency_stop`, the `CommandExecutor` protocol, `human_protection.py`, `human_run_ownership.py`, `safety.py`, `store.py`, models, `conftest.py` fakes, strings, the cooling path or the D212 or completion code.

### 2.12 Architecture gate

**Layers.**
- **Application (service and runner):** owns qualification, routing, token ledger consumption, result mapping and the dispatch task.
- **Executor (application-level command owner):** owns the safety evaluation, arbiter use, exact write, readback and audit scheduling.
- **Infrastructure (adapter):** unchanged.
- **Domain:** unchanged.

**Dependency direction** is unchanged. The service calls the executor's public method; nothing calls back from the executor into the service.

**Closed invariants.**
- **I-A.** Any qualifying request reaches MCP only as an exact-session e-stop.
- **I-B.** One admission, one consumption or release (§2.6).
- **I-C.** The priority entry point never admits, queues or retries.
- **I-D.** No qualifying path has an unbound fallback.
- **I-E.** Queue and worker semantics are unchanged.
- **I-F.** AUTOMATIC makes zero HUMAN capability, registry or flag reads.

**Extension seams.** Any other caller of `execute_priority_emergency_stop`, or any use of it outside the qualifying predicate (RP-1 to RP-7), needs its own ratified contract.

---

## 3. Test list and causal controls (hardware-free)

**Files.**
- `tests/test_runner_human_turn.py` (the fake-port service routes; rewrite rows of `test_am5_estop_route_during_owned_human_evaluation`).
- `tests/test_fault_control_executor_priority.py` (new; executor unit).
- `tests/test_runner_human_turn_real_mcp.py` (new; `slow` + `serial`; real stdio against installed 0.2.4 MOCK, recording and FC disabled).

**Fake fidelity (D-29).** `_ExactFaultRunner` gains an opt-in `reject_unbound_inactive_emergency: bool = False` (V-8). When it is True and the modelled latest session is inactive, `emergency_stop` raises an exception that mirrors the producer refusal, and records no successful stop. Every AM-6 window row enables it.
- Rows that keep the default (TF9, TF10, TF11, TG4 base-direct, and others) model a producer state the real producer rejects. That is disclosed as a test-fidelity limitation (RP-1, RP-2), not fixed here.
- `conftest.py` is unchanged.

**Observation discipline (inherited from AM-5 and tightened).**
- **Spies:**
  - `port.write_fault_control` sets `exact_written` for EMERGENCY_STOP and records `expected_session_id`;
  - `actuator.emergency_stop` sets `unbound_attempted`;
  - `executor._queue.put_nowait` sets `estop_enqueued`;
  - a counting wrapper on the shared arbiter's `admit_emergency_stop`;
  - `port.read_fault_control_state` records call order.
- **Before release:** wait on explicit Tasks with FIRST_COMPLETED and capture which route was taken. The route signal must occur while the registered evaluation task is still `not done()`, and in proof rows while the proof read is still held.
- **In `finally`:** release every hold; settle or cancel the owned tasks; settle lease persistence and executor shutdown; then assert.
- **Validity:** a timeout, an unexpected exception or a cleanup failure makes the witness **INVALID**, never a pass.

### 3.1 Rows

| Guard | AM6 | Test | Mutation that must fail it (the designated assertion) |
|---|---|---|---|
| GH1 priority entry never admits | 3, 4 | **TH1** (executor unit) and every window row: the admission counter is exactly 1 per request; after completion `arbiter.emergency_stop_active is False`. | Adding `admit_emergency_stop` to H2 gives a count of 2 and leaves `emergency_stop_active` True. |
| GH2 never queues, never uses the worker | 2 | **TH2:** in the barrier and proof variants, `exact_written` fires before release while the registration is pending; `estop_enqueued` is never set; the `executor._worker` object identity is unchanged. | Routing qualifying requests through `execute(...)` makes `estop_enqueued` fire first and no write occurs before release. |
| GH3 extraction parity | 12 | **TH3:** queued-route e-stops (AUTOMATIC terminal `test_am5_automatic_finalisation…`, historical `test_am5_historical…`, TG3, TG4 raised) give identical results, trace dicts and call order to base. A differential run through both entries on identical fakes gives equal traces AND each is checked against frozen base expected trace/order values from da3a9a5. Comparing two paths that share the changed helper alone cannot detect a common mutation. | A designated mutation changing the fixed expected trace/order or readback outcome must fail the frozen-base oracle; mere equality between the two changed paths is insufficient. |
| GH4 identity captured at admission; no pre-read | 3 | **TH4:** the written `expected_session_id` equals the admitted lease session on both routes. White-box: change the roaster's latest identity after admission and before the task runs; the write still carries the admitted session. The read-order spy shows zero `read_fault_control_state` calls before the write. | Reading identity in the task, or inserting a pre-read, fails the read-order or session assertion. |
| GH5 no unbound fallback | 5, 7 | **TH5:** in every qualifying row `unbound_attempted` is never set. If the exact write raises (`stop_raises`), the result is `failed` with exactly one exact attempt and zero unbound attempts. | Falling back to `_dispatch_admitted_live_emergency_stop` sets `unbound_attempted`. |
| GH6 global routing (replaces TG1, TG2 and TG4b oracles) | 1, 2, 6 | **TG1′** barrier pending; **TG2′** proof pending; **TG4b′** cancelled registration. Each gives the priority route, `confirmed`, `fault_writes == [EMERGENCY_STOP]`, zero controller unbound e-stops. After release: the held drop is `failed`; tick returns False; zero close, export or `complete_run`; lease generation +1; marker per AM-5. | Reverting to the AM-5 direct route fails "priority route observed" and `confirmed` (with rejecting fake). Reverting to the queued base fails "write before release". |
| GH6b TG2 cooling-on proof (corrects the vacuous oracle) | 9 | **TG2-c1:** `actuator.cooling = True`, hold at the first proof read (`api.py:1834`). Expect the existing failure reason `superseded_by_emergency_stop` (`:1843-1847`) and zero `stop_cooling_for_fault_acknowledgement` calls. **TG2-c2:** hold at the immediately-before-stop read (`:1851`). After release, the D212 stop is discarded at the arbiter (close reservation cleared, `controller.py:170`); zero stop-cooling calls; the failure reason pinned is whatever `:1873-1878` produces (expected `stop_unconfirmed`). Both rows also keep the GH6 oracles. | Removing the epoch recheck fails c1 because the reason changes away from `superseded_by_emergency_stop` and one extra proof read occurs; the unchanged arbiter still prevents a cooling-stop write. c2 is behavioral proof of the unchanged, multiply fenced arbiter. A single-fence mutant is masked and must not be claimed as causal proof; no production arbiter guard is changed by AM-6. Inherited arbiter guard evidence remains required, not rescored. |
| GH7 per-run routing (new) | 1, 2, 6 | **TP1** barrier and **TP2** proof, using the per-run route via `submit_operator_action(run_id, EMERGENCY_STOP)`: priority route; result `accepted` with reason "terminal emergency stop has fresh exact-session proof"; `queued=False`; the operator-action audit row `accepted`; zero unbound attempts; the GH6 after-release oracles. **TP3** per-run not finalising: the base direct route with "controller priority dispatch" reason (default fake), and zero capability reads. **TP4** per-run, finalising, empty or raised registry: base direct (RP-1, disclosed). | Omitting H6 makes TP1 and TP2 observe an unbound attempt. Calling the capability outside finalisation fails TP3's zero-read assertion. |
| GH8 result mapping and failure (replaces TG10) | 6, 7 | **TG10-A** (global and per-run): the exact write raises. Result `failed` with the failure reason; `_pending_fail_safe_is_emergency_stop_retry` True; exactly one exact attempt; no executor enqueue; the next tick gives exactly the inherited `set_heat(0)` then overrun-safe fan; phase FAULTED. **TG10-B:** the readback raises, or reports heat ≠ 0, giving `failed` and a re-arm. **TG10-C** (real store-write failure): make the actual store write reached by the priority command audit (V-4) raise. The result stays `confirmed` (or per-run `accepted` with the confirmation reason), the failure is logged, there is no retry and no re-arm. The AM-5 `flush_raises` row is retired because `_flush_events` is not on the priority path. **TG10-D** (actual `record_command`): per-run, finalising, capability doubt (D-28, default fake) with `store.record_command` raising inside `_record_dispatch_command`. The exception propagates from `submit_operator_action` (pre-existing behaviour); exactly one controller e-stop; no executor write; no retry armed (the write succeeded); phase FAULTED. | Mapping failure to `confirmed` or `accepted` fails A and B. An added second write or fallback fails A. Re-arming on audit failure fails C. Swallowing the exception in D changes pre-existing behaviour and fails D. |
| GH9 cancellation (replaces TG11) | 8 | **TG11′:** hold `write_fault_control` and cancel the HTTP waiter. `CancelledError` reaches the caller; the write occurs exactly once; `_log_cancelled_terminal_estop_dispatch` consumes the result; the runner is confirmed. **TH9** (white-box): hold a routine call in flight on the shared arbiter, observe that the dispatch task has entered `run_emergency_stop` and is waiting, then cancel before acquisition. Cancellation before this observation makes the witness INVALID. Pending is released (`emergency_stop_active` False); zero writes; the runner is re-armed. | Unshielding gives zero writes in TG11′. Removing the arbiter's cancellation release leaves `emergency_stop_active` True in TH9. |
| GH10 shared arbiter | 5 | **TH10:** with a routine MCP call held in flight on the shared arbiter, the priority write starts only after it returns and before any later-admitted routine write; the routine generation advance discards queued routine work. | A private arbiter, or bypassing `run_emergency_stop`, starts the write while the call is in flight. |
| GH11 ledger consumption (D-25) | 4 | **TH11** (white-box): after a qualifying request on either route `runner._admitted_emergency_stops` equals its pre-request value; after a non-qualifying global finalising request it is +1 (RP-8 pinned unchanged). | Omitting H3 leaves +1 on the qualifying rows. Applying H3 to non-qualifying routes fails the RP-8 pin. |
| GH12 stale request not retried | 7 | **TH12:** admit request A with the write held behind an in-flight call, then admit request B. A releases its token (`RuntimeError` path, result `failed`); B writes once. Total exact writes: 1. Separately pin the inherited retry state if A writes and is superseded before confirmation: its re-arm can remain after B confirms (RP-3/RP-7); AM-6 does not clear it. | Retrying A, or reusing B's generation for A, gives 2 writes. |
| GH13 D-27 fail-closed | 12 | **TH13** (white-box only; A-1): a qualifying request with `executor = None` or a `None` admitted session gives `failed`, token released, re-armed, zero writes of any kind. | Falling through to the direct route makes `unbound_attempted` fire. |
| GH14 qualification parity (replaces TG13; extends TG7, TG8, TG9, TG9b) | 1, 11 | **TG13′:** zero capability reads outside finalisation on both routes; exactly one read per per-run request during finalisation. **TG7′:** AUTOMATIC per-run during finalisation makes zero registry or flag reads, and H3 is never called. TG8 and TG9 are unchanged. **TG9b′:** missing, truthy and Mock capabilities give base routing on both routes (global queued `confirmed`; per-run base direct). | An unconditional capability read fails the TG13′ count. Truthiness fails TG9b′. |
| GH15 TG14 rewrite | 6 | `test_fault_acknowledgement_superseded_during_evaluation_barrier`, both parameters: `confirmed`, one exact write, zero controller unbound e-stops, zero executor enqueues; completion-refusal and cooling-admission assertions kept. Move the mid-flight assertions out of `try` per QA. | — |
| GH16 cooling lock retained (TG12 unchanged except result) | 10 | TG12 cooling samples are identical; the stop result is now `confirmed`. Additionally assert `reservation_after_stop is True` directly (QA). | Releasing the reservation on e-stop fails. |

**Per-run completion/cancellation rows.**
- **TP5:** after a confirmed qualifying priority stop, make the actual `record_operator_action` raise. The exception propagates as in existing per-run semantics; exactly one exact write and zero unbound writes, runner confirmed, retry flag False. The HTTP operation can fail after software confirmation; it must never be described as proof of non-actuation. Swallowing the exception or arming a retry solely for this audit error fails the row.
- **TP6:** cancel the per-run HTTP waiter after the priority write has entered and is held. Release it during cleanup; the service-owned write completes once, terminal done-callback consumes the result, runner confirmed, no operator-action row from the cancelled waiter. Unshielding fails this row: the held write is cancelled, the wrapper re-arms instead of confirming (`api.py:5384-5387`), and no exact write completes. Callback choice cannot be observed from behaviour: the two callbacks differ only in log text, and the wrapper converts every `Exception` to `confirmed = False`. TP6 therefore pins the choice with a spy on the dispatch task's `add_done_callback` that asserts the terminal callback is the one registered. This is a bounded white-box pin, not a behavioural causal control.

**Low-severity QA folds (test scope only).**
- TG9 asserts the fixed warning text via `caplog`.
- TG4 asserts `not task.cancelled()` and the exception type.
- The sequential cleanup in `finally` must not skip executor shutdown. Restructure it so each step runs, and classify any failure as INVALID.
- The global cooling refusal reason is asserted literally.

**Inherited TG rows that stay valid unchanged:**
- TG3: barrier or proof with an empty registry gives the queued route, `confirmed`.
- TG4: raised registry, D-19, gives queued `confirmed`.
- TG5: the flag gives queued `confirmed`.
- TG6 rows (a) to (f).
- TG8.
- TF11, TF9 (no finalisation, so unaffected).
- `test_am5_completion_initiation_survives_runner_cancellation`.
- `test_am5_automatic_…` and `test_am5_historical_…`.

### 3.2 Real-stdio service routes (mandatory; `slow` + `serial`)

These run against the installed `coffee-roaster-mcp==0.2.4` mock driver over real stdio, through the real `RoasterControlAdapter`, a HUMAN service built through the V-7 seam, and a temporary real `RoastStore`.

**Holds.** Agent-side only: a spy on `record_safety_evaluation` holds the S3 evaluation, and a wrapper on `read_fault_acknowledgement_state` holds the proof. The producer itself is never stubbed.

**Observation points.** For RS1–RS4 and RS6, a pass-through wrapper on `RoasterMCPClient._execute_fault_control` records the actual strictly validated result without stubbing producer or validation. `write_fault_control` itself returns None and is not a result observation point. RS5 uses a pass-through wrapper on `RoasterMCPClient.emergency_stop` to record and re-raise the real MCPToolError, and exact-session get_roast_state before/after to compare fault-event counts.

**Producer state setup.** Reach a stopped fault with beans added and cooling on, through producer tools only. The e-stop's default safety payload leaves cooling on, which gives the cooling-on proof precondition naturally.

| Row | Route and interval | Expected |
|---|---|---|
| RS1 | Global, barrier | `confirmed`; the pass-through strict-client observation shows the producer event `kind == "fault"`, `driver_safety_method_called is True` and `driver_error is None`; readback heat 0; completion refused. |
| RS2 | Per-run, barrier | `accepted` with the confirmation reason, otherwise as RS1. |
| RS3 | Global, D212 proof, cooling on (hold at the first proof read) | `confirmed`; D212 records `superseded_by_emergency_stop`; zero D212 stop-cooling tool calls. |
| RS4 | Per-run, D212 proof, cooling on | As RS3, with the per-run result mapping. |
| RS5 | Negative control: route a qualifying request through the AM-5 direct path (test-only, monkeypatched routing) | The pass-through client wrapper records `MCPToolError` "No active roast session exists."; exact-session fault-event count stays unchanged. The existing AM-5 controller swallows refusal and the service returns `accepted` / controller-priority reason. These observations, not an exception escaping the service, distinguish the negative control. |
| RS6 | Global, barrier, with the V-4 audit store write raising | Still `confirmed`; logged; no retry. |

**What these tests prove, and what they do not.** They are software command-admission and readback evidence against a mock driver. They are not hardware proof, not physical cooling or evacuation evidence, and not a qualification. Record the resolved `mcp`, `pydantic` and producer versions in the test output. Do not rely on scheduler-callback races.

### 3.3 Causal controls

- **One control per new or changed production guard (plus explicit test-oracle controls):** GH1 to GH14 and GH6b-c1; GH6b-c2 remains unchanged-arbiter behavioral coverage as explained above; each TG10 sub-row and TP5/TP6 (the TP6 callback pin is bounded structural evidence, not causal); RS5 counts as the producer-backed control for GH5 and GH6.
- **Not rerun:** the original 42 controls and unchanged GG controls. The nine S2 repair receipts and every AM-4 and AM-5 receipt stay bound to their own heads.
- **Procedure:** stop on the first invalid witness and preserve it; restore by `cp` with hash verification.
- **Per-row honesty (safety-review note):** each GG and GH control states the faulty condition it substitutes. A mutation masked by short-circuiting (such as the TG8 `self.runner` substitution) is designed as an observable variant and is labelled bounded. It is not claimed as proof against indistinguishable substitutions.
- **AM-5 controls still outstanding** (GG1 to GG12, GG3b, GG8b) are re-specified against the AM-6 oracles. Where an AM-5 oracle was replaced, its control is executed only against the replacement.

---

## 4. Class sweep (in `{IMPL_WORKTREE}`; classify every hit; the base set is the exported excerpts @da3a9a5)

| ID | Command | Base (known exported hits; classify all others) | After AM-6 |
|---|---|---|---|
| Q6-1 | `rg -n -e 'execute_priority_emergency_stop' -e '_execute_exact_emergency_stop' -e 'consume_admitted_emergency_stop_for_exact_dispatch' src/roastpilot_agent` | 0 | One definition each. The helper is called from `_execute_one` and the priority method. The priority method is called only from `_execute_terminal_emergency_stop`. The ledger consumer has exactly 2 call sites (§2.4, §2.5). |
| Q6-2 | `rg -n 'admit_emergency_stop\(' src/roastpilot_agent` | `controller.py:164` (def), `:641`, `:6761`, `:5235`; `api.py:1657`, `:1680`, `:1687`, `:1685` (def), `:5248`, `:5252`, `:7863` | No new call site. |
| Q6-3 | `rg -n 'write_fault_control\(' src/roastpilot_agent` | `controller.py:554` (protocol), `:779` (e-stop), `:958` (routine); `mcp_client.py:1589` (def) | The e-stop site moves into the helper, still exactly one. |
| Q6-4 | `rg -n -e '_execute_terminal_emergency_stop\(' -e '_dispatch_admitted_live_emergency_stop\(' src/roastpilot_agent/api.py` | terminal: `:5273`, `:5356` (def); direct: `:5317`, `:7867`, `:5477` (def) | terminal +1 (per-run); direct unchanged (non-qualifying). |
| Q6-5 | `rg -n '_live_estop_bypasses_terminal_writer' src/roastpilot_agent` | `:5131` (def), `:5269` | def + global + per-run (3). |
| Q6-6 | `rg -n -e '_queue\.put_nowait' -e '_worker = ' src/roastpilot_agent/controller.py` | `:684`, `:700` (plus init `:623`) | Unchanged. |
| Q6-7 | `rg -n -e '_executor\.emergency_stop\(' -e 'self\._client\.emergency_stop\(' src/roastpilot_agent` | `controller.py:5239`; `mcp_client.py:1919` | Unchanged. Each caller chain is classified to RP-1 to RP-7. No qualifying path reaches them. |
| Q6-8 | `rg -n -e 'operator_emergency_stop\(' -e 'dispatch_priority_emergency_stop\(' -e 'dispatch_shutdown_emergency_stop\(' -e '_maybe_escalate_while_latched' -e 'rearm_emergency_stop_fail_safe' src/roastpilot_agent` | Classify. | No new caller. Every hit is mapped to an RP row or to "not on a stopped-fault path". |
| Q6-9 | `rg -n -e 'emergency_stop accepted for controller priority dispatch' -e 'terminal emergency stop has fresh exact-session proof' -e 'software e-stop attempt was not confirmed' src/roastpilot_agent/api.py` | Classify. | No new strings. Exactly two new reuse sites (per-run H6); D-27 reuses the failure string. |
| Q6-10 | `rg -n -e 'was_finalizing' -e 'fault_finalization_started' src/roastpilot_agent/api.py` | Global `:5148`, `:5269`; others classified | Plus one per-run capture. No new writes. |

The ratified AM-5 sweeps Q5-1, Q5-4, Q5-5, Q5-6 and Q5-8 are retained. Q5-2, Q5-3 and Q5-7 are replaced by Q6-4, Q6-2 and Q6-9.

---

## 5. PR plan

- **No new slice.** AM-6 joins S3 on `feature/1076-human-mode-protection-controller` (`Refs #1076`). The four-PR plan S1 → S2 → S3 → S4 is unchanged.
- **Estimate:** `controller.py` about 15 to 25 logic lines (the extraction is roughly net-neutral, plus the method); `api.py` about 35 to 60 (global routing about 10, per-run about 25, wrapper about 5, ledger method about 5). Re-estimate at handback.
- **Cohesion rationale for the PR body.** The correction must ship with AM-5's routing. Merging AM-5 alone leaves a qualifying e-stop that the producer refuses while it reports `accepted`.
- **Separation.** The real-stdio harness and any producer-state fixture go in a dedicated commit.
- **qa is mandatory:** the S3 test diff exceeds 600 lines.
- **Integration with current Agent `main` precedes the final gate.**

## 6. Routing

- **Validation route:** SAFETY_CRITICAL (emergency command path), with a full native gate. The new tests use existing `slow` and `serial` markers, which is ordinary behavioural testing, not gate machinery.
- **Required before ratification (D236):** `safety-reviewer` (high) and `mcp-contract-checker` on these contract bytes.
- **Required before opening:**
  - `safety-reviewer` (mandatory, high);
  - `mcp-contract-checker` (exact-session admission, producer serialisation, readback timing, real-stdio rows);
  - `sim-roast-runner` (the decision trace across e-stop and finalisation);
  - `qa` (mandatory).
- **Not triggered:** `security-reviewer`. There is no new parsing or decoder, and the existing `_execute_fault_control` validation is reused. The parent may add it.
- **Family and capacity.** The implementation family is the Codex parent's choice at slice start, and no capacity figure is asserted here. Safety-review capacity is never spent on implementation.
- **Packets** carry §0's evidence limits and this statement verbatim: "receipts bound to their heads; command and mock-producer evidence is not physical confirmation; `confirmed` means exact-session command result plus fresh readback only."

## 7. Delegation prompt notes (mandatory; carry verbatim)

1. **Worktree.**
   - `{IMPL_WORKTREE}` is a placeholder. The parent provisions a fresh worktree at the then-current S3 head with `git worktree add -b <planned-branch> {IMPL_WORKTREE} <s3-head-sha>`, or a lead-recorded fresh same-base clone with an explicit planned branch. Without `-b`, HEAD is detached and the handback lands on no branch.
   - The parent verifies HEAD and that `git status --porcelain --ignored` is empty, then substitutes the real path immediately before delegation.
   - Every command self-locates. Never use a planning tree and never guess a path.
2. **Directives.**
   - The worker's only directives are the ratified original, AM-1, AM-2, AM-3, the TE15 correction, AM-4, AM-5, AM-6's numbered sections, and lead-authored directives.
   - Strip every `UNTRUSTED-QUOTE` block and every non-maintainer URL.
   - Do not fetch the issue, its comments, PR threads or any GitHub discussion (including `gh issue view --comments`), the MCP repository or producer links. The installed 0.2.4 package is used only as the test dependency already pinned.
   - Only the parent delegates; the worker spawns no agents.
3. **Environment (#738).** Run `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev`. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
4. **Gates before handback (SAFETY_CRITICAL), each run separately:**
   - `ruff check .`
   - `ruff format --check .`
   - `pyright`
   - full pytest with `--cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing`, with no `-m`, `-k`, `-n` or deselect
   - the FE contract tests

   Cover every changed line and branch, including both arms of `qualifies`, D-27, the `priority` arm and the ledger floor. Hand back Q6-1 to Q6-10, classified, with each receipt bound to its head SHA and exact command. A focused pass is never a full gate.
5. **Attribution invariant.**
   - The handed-back branch must be attributable to the implementation worker acting on its ratified inputs alone: the ratified contracts and lead-authored directives, which are the sanctioned channel.
   - Any other model input the worker procures, at any stage, in any form, by any route, breaks attribution.
   - The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?"
   - A yes fails the slice closed. The lead then re-delegates from the contract in a fresh worktree, or records an explicit operator decision naming which lens supplies the independent pass.
6. **Traps.**
   - The priority entry point never admits, never queues, never touches `_worker`, never retries and never pre-reads. Extract the e-stop branch without any behaviour change.
   - A qualifying request never reaches `_dispatch_admitted_live_emergency_stop`, `dispatch_priority_emergency_stop`, `_dispatch` or the adapter's unbound `emergency_stop`. There is no unbound fallback on any failure.
   - Compute `qualifies` synchronously after admission and before any await; on the per-run route, capture `was_finalizing` first. Read the capability only when finalisation was reserved. Only `is True` grants it.
   - Send exactly the session in the lease admitted for this request. Add no cross-check read.
   - Consume the runner ledger only for qualifying requests. Do not change the non-qualifying global terminal route's ledger behaviour (RP-8).
   - Result mapping:
     - global: `confirmed`/`failed`;
     - per-run: `accepted` with the existing confirmation reason, or `failed`.
     - No new strings, enums, routes, schema or `RoastEventKind`.
   - Use `_log_cancelled_terminal_estop_dispatch` for the per-run priority task's HTTP cancellation.
   - Do not change cooling admission or projection, the barrier, the marker, the registry, typed close evidence, D212, `execute`, `_drain`, the adapter, the `CommandExecutor` protocol, `conftest.py`, the `coffee-roaster-mcp==0.2.4` pin, `COMMAND_PHASE_MATRIX` or `cold_characterisation/*`.
   - Do not fix RP-1 to RP-8.
   - Plain `Enum` and Celsius only.
   - The fake's unbound rejection is opt-in and confined to `_ExactFaultRunner`.
   - Causal controls: a timeout or error is INVALID; stop on the first invalid witness; restore by `cp` with hash verification; do not rerun unchanged controls.
   - If any V-1 to V-9 fact fails, or §2.1 contradicts the base, return `ESCALATE`.
7. **Fixtures.**
   - Rewrite TG1, TG2, TG4b, TG10, TG11, TG13 and TG14 per §3, and add the TP, TH and RS rows.
   - Retire the AM-5 `flush_raises` row.
   - There are no MCP contract or FE fixture changes.

## 8. Risk profile and readiness limitations

**Blast radius.** The software emergency-stop dispatch target and the reported result for HUMAN runs during fault finalisation, on both operator e-stop routes. The hardware consequence is whether a software e-stop command is admitted by the producer at all in this window. Data sensitivity is low. There is no new principal, credential, endpoint or schema. HUMAN mode stays unreachable (AC-NA).

**Break these first:**
1. A qualifying request reaching any unbound path, on either route or on any failure.
2. A second admission, a double release, or a token leak (`emergency_stop_active` stuck True).
3. The priority call enqueued or waiting on the blocked worker.
4. An identity re-read in the task, or a pre-read.
5. A capability read outside finalisation, or under AUTOMATIC.
6. `confirmed` (or the per-run confirmation reason) without exact-session command evidence plus readback.
7. A stale request retried.
8. Completion starting after a qualifying e-stop.
9. Any early release of the cooling reservation.

**Named readiness prerequisites (unbound stopped-fault callers).** These are pre-existing and need explicit safety disposition before any live admission. AM-6 does **not** authorise fixing them.
- **RP-1:** the per-run live route outside qualification (not finalising; finalising with an empty or raised registry; flag set) against a stopped-fault session.
- **RP-2:** the global direct route for a live runner when not finalising, against a stopped fault.
- **RP-3:** the `_EMERGENCY_STOP_RETRY_RULE` retry (`set_heat(0)` then fan) is unbound and is refused by the producer on a stopped fault (MCP review F1.5).
- **RP-4:** controller escalation `_maybe_escalate_while_latched`, which reaches `_execute_emergency_stop` unbound.
- **RP-5:** the shutdown e-stop, via `dispatch_shutdown_emergency_stop`, then `_dispatch`, unbound.
- **RP-6:** per-run capability doubt (D-28), which keeps the base unbound route.
- **RP-7:** after a failed priority attempt, the re-armed retry is RP-3 again.
- **RP-8:** the runner-local `_admitted_emergency_stops` over-count after the non-qualifying global terminal route (no reachable consequence shown).

Also disclosed: the opt-in fake leaves older tests modelling producer acceptance of unbound stopped-fault e-stops.

**Residual risks and limitations (not claims).**
- The full gate (16,548 passed, 14 skipped) is bound to AM-5 code at `da3a9a5`. No receipt covers AM-6. The producer mismatch stays a delivery blocker until AM-6 is implemented, gated and reviewed.
- The real-stdio rows are mock-driver software evidence. They are not physical heat removal, drum, chute or cooling evidence. No hardware session is authorised.
- The producer serialises synchronous tools on its event loop (§0). A producer tool that blocks synchronously delays e-stop servicing. This is the original residual and is not fixed.
- After a successful call, SDK `call_tool` may issue a `tools/list` request inside the agent timeout. A timeout there reports failure after the producer already applied the stop (MCP review minor). That gives `failed` plus a re-arm, which is fail-closed reporting but command-inaccurate.
- The HTTP response can still wait for storage after the priority write and readback: global post-action projection or per-run operator-action persistence. A per-run persistence exception can produce an HTTP error after software confirmation; it is not proof of non-actuation. The Python-level holds do not model a blocked SQLite connection.
- The cooling lock is retained, with no upper bound on its duration while storage is held. An exception escaping finalisation stops the tick loop (`scheduler.py:1316`), with no automatic recovery. A stranded drum may need physical intervention.
- Teardown ownership of priority dispatch tasks follows the existing dispatch-task class (V-6). The executor's `settle_for_shutdown` does not cover them.
- AM-5's causal controls and Q5 receipts remain outstanding.

---

## 9. Owner decisions encoded and ratification

| ID | Encoded choice | Alternative (needs revised bytes) |
|---|---|---|
| D-23 | Qualifying global **and per-run** finalisation e-stops use a priority exact-session entry on the existing executor, bypassing the blocked queue and keeping the shared arbiter. This supersedes D-18's target and the architect's global-only recommendation. | Global-only, which leaves per-run refused by the producer. Thread a session into the controller's direct path, which is wider and still leaves its retry unbound. |
| D-24 | Global `confirmed`/`failed`. Per-run `accepted` with the existing confirmation reason, or `failed`. The AM-5 `accepted`/"controller priority dispatch" result no longer exists for qualifying requests. | Keep `accepted` (untruthful under refusal). Add a per-run `confirmed` literal (an API change). |
| D-25 | One arbiter token, admitted once and consumed or released exactly once; the priority entry never admits; the runner ledger entry is consumed synchronously for qualifying requests only. RP-8 is unchanged elsewhere. | Leave the qualifying ledger over-counted, or fix the ledger on all routes (scope widening). |
| D-26 | Service-owned shielded dispatch task. HTTP cancellation never cancels it. Arbiter release for cancellation after dispatch entry and before acquisition. Wrapper re-arm only after entry. Pre-first-step cancellation releases nothing and makes no write; no production path cancels this task set, as verified by V-6. Existing audit and lease-persistence ownership. | — |
| D-27 | A qualifying request without an executor or admitted session fails closed (release, re-arm, `failed`), with no unbound attempt. Public paths cannot reach it (A-1). | Fall back to the unbound route (rejected: refused by the producer and a duplicate-path risk). |
| D-28 | Capability doubt keeps each route's base: global queued exact; per-run base direct (disclosed as RP-6). | Route per-run doubt to the queued exact executor (a routing change for non-qualifying requests). |
| D-29 | The fake's unbound-inactive rejection, exact-write failure, readback exception and nonzero-heat readback knobs are opt-in and scoped to `_ExactFaultRunner` in its test file. Real-stdio service-route tests are mandatory in both intervals, with cooling-on proof and a real store failure. Mock evidence is never hardware proof. | Default-on rejection, which would need re-baselining TF9, TF10 and TF11 (wider test churn). |
| D-30 | RP-1 to RP-8 are named readiness prerequisites. No fix authority is granted, and live admission requires their separate safety disposition. | Fold any of them into AM-6 (each needs its own ratified scope). |

**Blockers.** None to the approved direction. A-0 (Plan SHA) and V-1 to V-9 are verification gates. V-7 (a hardware-free HUMAN composition over the real mock child, with no enablement surface) is the point where a source contradiction would return `ESCALATE` instead of weakening AM6-13.

**Ratification wording** (to post after the lead binds the hash and the watermark):

> "Ratify AM-6 (SHA-256 `<hash>`) exactly as written, selecting D-23 to D-30: exact-session priority emergency dispatch for qualifying HUMAN finalisation on both global and per-run routes, `confirmed`/`failed` (global) and confirmation-reason `accepted`/`failed` (per-run) software result semantics, the stated token, cancellation and fail-closed rules, the retained cooling lock, and RP-1 to RP-8 as named readiness prerequisites without fix authority. AM-5 and all prior contracts remain authoritative except where AM-6 §2.10 amends them. No hardware, live-enablement, deployment, merge or release authority is granted."

**Before posting:**
1. Run a mechanical secret scan over the exact text.
2. Bind AM-6's SHA-256 beside the seven header hashes.
3. Resolve A-0.
4. Recompute the watermark over the seven prior comments, excluding the AM-6 post.
5. Obtain the D236 independent safety and MCP contract reviews and disposition their findings.
6. After ratification only, add `<!-- story-planner-contract: planner-generated; ratified-by: <maintainer login> -->`, and verify that the posting author is `OWNER` and matches `ratified-by`.
7. Record the canonical posted-body hash.
8. Refresh the issue snapshot before delegation.


## Lead verification appendix — bound at da3a9a5

# Parent verification of AM-6 draft source gates

Bound source da3a9a58d321bba07d9625c15b0eb6b6ca63af70, clean including ignored files. Read-only checks; no implementation or new test evidence.

- A-0 resolved: git merge-base --is-ancestor exits 0 for 2c8fd2b -> d0dce0746e358b5ccaae463b27a783a5bc511592. Older plan-context is historical, not conflicting authority.
- V-1: controller.py:2595-2600 advances shared arbiter exactly once; api.py:1685-1688 adds exactly one local ledger entry.
- V-2: api.py:1690-1692 and 1704-1706 forward to controller methods. controller.py:2602-2615 releases transition gate only when arbiter emergency activity ends. :5416-5430 arms the typed emergency retry and releases the gate only if safe. This is retry intent, not producer acceptance.
- V-3: api.py:982-984 increments only emergency_request_epoch. :1721-1730 calls it and clears confirmed cooling-stop evidence, but does not clear finalisation reservation.
- V-4: store.py:2703-2712 forwards evaluation to record_safety_evaluation; :2714-2736 forwards command to record_command. TG10-C (not TG10-A as draft V-4 says) is actual asynchronous audit failure injection.
- V-5: api.py:2805 creates one arbiter; :2810 passes it to terminal executor; :6384 passes the same instance into the controller.
- V-6: all _emergency_stop_dispatch_tasks uses are declaration :2744, readiness/retirement checks :4108 and :4365, and track/discard :5403-5404. Shutdown :6804 onward does not explicitly await or cancel this set. Executor settle_for_shutdown covers queued worker, not this set. Do not claim teardown waits/cancels all priority tasks. This is an explicit lifecycle limitation needing review, not a newly granted repair.
- V-7: composition seam exists in source: RoastService.__init__ api.py:2624-2641 accepts roaster, mcp and authority; :6386-6397 binds HUMAN adapter evidence and admission. tests/test_milestone1_real_mcp.py:172-195 constructs real mock MCP/adapter/service; HUMAN authority is supplied only to this existing constructor in synthetic tests. No production enablement surface is necessary. Required new HUMAN real-stdio scenarios have not run and remain implementation acceptance tests; this source check does not claim their outcome.
- V-8: _ExactFaultRunner at tests/test_runner_human_turn.py:1249-1313 subclasses _RunnerRoaster; readback is inactive fault; write_fault_control records exact requests. Its inherited emergency_stop needs an opt-in override for refusal fidelity. No conftest change is needed.
- V-9: the only base _execute_terminal_emergency_stop call is api.py:5273; definition :5356. Q6-4 confirms.

Baseline sweep receipt lists every exact source hit and enclosing function. Draft base examples are incomplete: Q6-2 includes controller admission/escalation, shutdown and queue methods omitted in its table; Q6-7 includes controller._escalate_to_emergency_stop at5528 as well as _execute_emergency_stop at5239. Final contract must reference complete receipt instead of claiming the partial list is exhaustive. Q6-8 is a mixed def/call/reference inventory: definitions and wrappers do not each imply new hardware calls. New rearm references required by D-27 mean its proposed "No new caller" postcondition needs bounded qualification.

The original planner result and reviews remain preserved separately. These lead corrections are part of the exact bytes to be ratified. AM-6 has not been implemented.


### Complete baseline Q6 inventory (lead-verified)

These exact hits supersede incomplete example lists in section 4; refreshed implementation-head sweeps remain mandatory.

- Q6-1: no hits

- Q6-2: src/roastpilot_agent/api.py:953 (admit_emergency_stop, definition); src/roastpilot_agent/api.py:1657 (dispatch_priority_emergency_stop, existing reference); src/roastpilot_agent/api.py:1680 (dispatch_shutdown_emergency_stop, existing reference); src/roastpilot_agent/api.py:1685 (admit_emergency_stop, definition); src/roastpilot_agent/api.py:1687 (admit_emergency_stop, existing reference); src/roastpilot_agent/api.py:5248 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5252 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:6791 (_admit_shutdown_emergency_stop, existing reference); src/roastpilot_agent/api.py:7863 (_submit_live_emergency_stop, existing reference); src/roastpilot_agent/controller.py:164 (admit_emergency_stop, definition); src/roastpilot_agent/controller.py:641 (execute, existing reference); src/roastpilot_agent/controller.py:2595 (admit_emergency_stop, definition); src/roastpilot_agent/controller.py:2600 (admit_emergency_stop, existing reference); src/roastpilot_agent/controller.py:5235 (_execute_emergency_stop, existing reference); src/roastpilot_agent/controller.py:5526 (_escalate_to_emergency_stop, existing reference); src/roastpilot_agent/controller.py:6761 (operator_emergency_stop, existing reference)

- Q6-3: src/roastpilot_agent/mcp_client.py:1589 (write_fault_control, definition); src/roastpilot_agent/controller.py:554 (write_fault_control, definition); src/roastpilot_agent/controller.py:779 (dispatch_estop, existing reference); src/roastpilot_agent/controller.py:958 (write, existing reference)

- Q6-4: src/roastpilot_agent/api.py:5273 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5317 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5356 (_execute_terminal_emergency_stop, definition); src/roastpilot_agent/api.py:5477 (_dispatch_admitted_live_emergency_stop, definition); src/roastpilot_agent/api.py:7867 (_submit_live_emergency_stop, existing reference)

- Q6-5: src/roastpilot_agent/api.py:5131 (_live_estop_bypasses_terminal_writer, definition); src/roastpilot_agent/api.py:5269 (_submit_fault_controls_emergency_stop, existing reference)

- Q6-6: src/roastpilot_agent/controller.py:684 (execute, existing reference); src/roastpilot_agent/controller.py:700 (execute, existing reference)

- Q6-7: src/roastpilot_agent/mcp_client.py:1919 (emergency_stop, existing reference); src/roastpilot_agent/controller.py:5239 (_execute_emergency_stop, existing reference); src/roastpilot_agent/controller.py:5528 (_escalate_to_emergency_stop, existing reference)

- Q6-8: src/roastpilot_agent/api.py:1291 (shutdown_heat_off, existing reference); src/roastpilot_agent/api.py:1315 (retry_shutdown_heat_off, existing reference); src/roastpilot_agent/api.py:1592 (_dispatch, existing reference); src/roastpilot_agent/api.py:1642 (dispatch_priority_emergency_stop, definition); src/roastpilot_agent/api.py:1665 (dispatch_shutdown_emergency_stop, definition); src/roastpilot_agent/api.py:1690 (rearm_emergency_stop_fail_safe, definition); src/roastpilot_agent/api.py:1692 (rearm_emergency_stop_fail_safe, existing reference); src/roastpilot_agent/api.py:1719 (dispatch_emergency_stop_during_fault_finalization, existing reference); src/roastpilot_agent/api.py:5386 (_execute_terminal_emergency_stop, existing reference); src/roastpilot_agent/api.py:5394 (_execute_terminal_emergency_stop, existing reference); src/roastpilot_agent/api.py:5501 (_dispatch_admitted_live_emergency_stop, existing reference); src/roastpilot_agent/controller.py:3046 (tick, existing reference); src/roastpilot_agent/controller.py:5416 (rearm_emergency_stop_fail_safe, definition); src/roastpilot_agent/controller.py:5448 (_maybe_escalate_while_latched, definition); src/roastpilot_agent/controller.py:5514 (_escalate_to_emergency_stop, existing reference); src/roastpilot_agent/controller.py:6533 (note_fault_acknowledged, existing reference); src/roastpilot_agent/controller.py:6749 (operator_emergency_stop, definition)

- Q6-9: src/roastpilot_agent/api.py:5293 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5295 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5336 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5338 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:7891 (_submit_live_emergency_stop, existing reference); src/roastpilot_agent/api.py:7893 (_submit_live_emergency_stop, existing reference)

- Q6-10: src/roastpilot_agent/api.py:781 (<class/module>, existing reference); src/roastpilot_agent/api.py:949 (__init__, existing reference); src/roastpilot_agent/api.py:955 (admit_emergency_stop, existing reference); src/roastpilot_agent/api.py:964 (begin_fault_finalization, existing reference); src/roastpilot_agent/api.py:975 (begin_terminal_lease_close, existing reference); src/roastpilot_agent/api.py:977 (begin_terminal_lease_close, existing reference); src/roastpilot_agent/api.py:993 (abort_fault_finalization, existing reference); src/roastpilot_agent/api.py:999 (release_terminal_lease_close, existing reference); src/roastpilot_agent/api.py:1010 (finalization_is_current, existing reference); src/roastpilot_agent/api.py:1717 (dispatch_emergency_stop_during_fault_finalization, existing reference); src/roastpilot_agent/api.py:4110 (_retirement_conditions_hold, existing reference); src/roastpilot_agent/api.py:4349 (_retirement_snapshot_transient_marker, existing reference); src/roastpilot_agent/api.py:4381 (_retirement_snapshot_transients_hold, existing reference); src/roastpilot_agent/api.py:4846 (submit_fault_controls_action, existing reference); src/roastpilot_agent/api.py:5148 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5269 (_submit_fault_controls_emergency_stop, existing reference); src/roastpilot_agent/api.py:5696 (_classify_fault_lease_close, existing reference); src/roastpilot_agent/api.py:5919 (start_roast, existing reference); src/roastpilot_agent/api.py:5927 (start_roast, existing reference); src/roastpilot_agent/api.py:7650 (submit_operator_action, existing reference)

Q6-8 postcondition (replaces §4 'No new caller' for `rearm_emergency_stop_fail_safe` only): hardware-dispatch callers are unchanged. Exactly two new `rearm_emergency_stop_fail_safe` call sites are added, one each in the D-27 fail-closed branch (executor or admitted session is `None`) of §2.4 and §2.5. No re-arm is added to the D-28 capability-doubt branch or anywhere else, and no additional e-stop dispatch or retry mechanism is authorised.
