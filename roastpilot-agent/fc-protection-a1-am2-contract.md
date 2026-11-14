> Owner-review copy: immutable text-only story-planner output SHA-256 `99fe435aad1b42c496fffa68904a44755081bec2067ff585d80cea98defb5596`, consolidated by the lead before ratification. The raw output remains `/private/tmp/a1-am2-planning-packet/planner-result.md`. Lead corrections listed below are part of the exact proposed bytes, not already-ratified requirements.
>
> - Preserve the existing known-versus-unknown containment classification; do not classify every terminated call UNKNOWN.
> - Remove contradictory freshness-only wording now that binding also gates cache commit.
> - Qualify the commit invariant by successful envelope construction.
> - Distinguish automatic read paths from the shared reset/Start lifecycle.
> - Separate deliberate interleaving setup from forbidden lifecycle escape calls.
> - Correct the size baseline and remove an invented threshold.
> - Make the class-sweep regex enumerate typed initializers, assignment and generation increments; parent verified 27 base hits.
> - Supply the complete current fault-session accessor/consumer inventory.
> - Bind the reset protocol declaration exactly.
> - Keep the pending-marker invariant consistent with known containment outcomes.
> - Do not require a prohibited lifecycle reset to prove cache non-authority.
> - Distinguish automatic lifecycle escapes from later independently eligible operator requests.

# A1 contract amendment AM-2 (proposed): superseded human-read projection, containment-cache generation, and S3 pending-call ownership (Agent #1076)

**Status: proposed and not ratified.** No implementation, repair, merge or delegation is authorized by this text.

- **What remains in force.** The original A1 contract (SHA-256 `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f`) and AM-1 (SHA-256 `360432547cb36bbe8cd8ce63131e047dc28bb1ac4d32f892f36757236f86a41a`) remain the authority. AM-2 replaces nothing until the owner ratifies its exact bytes.
- **Status of the new criteria.** Every AM2 criterion below is a lead recommendation that I have turned into contract text. None is an approved owner decision.
- **What ratification would cover.** Ratifying AM-2 would also ratify decisions D-2, D-3 and D-4 (§9).

**How this text was produced.**
- This is text-only planner output. I had no tools, filesystem, MCP or added directories.
- Every `file:line` citation comes from the parent-supplied exports at the bindings below. I could not re-verify any of them, so the implementer must re-verify each one in its own fresh worktree.
- No D219 confinement, native-capture, implementation, full-gate, hardware, live-admission or release claim follows from this text.

**Decision context.** The independent safety review returned HOLD on the contract record, not the code, at `cd92250e`. Two automated findings on PR #1084 are context, not authority:
- **f230ac27:** a late human read overwrites the current session identity.
- **becd92dd:** a late or prior-run containment result stays cached.

---

## 0. Bindings, gates and evidence (as supplied by the parent)

| Binding | Value |
|---|---|
| Planning base (read-only; never the implementation tree) | Agent `cd92250e2c190e2a116e4d9ef2fe62cd46ca398e` (the current S2 PR #1084 head). The parent reports it clean, including ignored files. |
| Plan tree | `93806f4c1049b86b21c3309a5f3cba3982708b98` |
| Plan anchors (cited by section; the exports have no line numbers) | `roastpilot-agent/fc-protection-d230.md`: clause 2, clause 4 ("Local timeout never proves remote settlement"), and the Architecture gate ("application orchestration owns child/run identity …; Infrastructure adapters own clocks, storage and MCP/driver transport"). `roastpilot-agent/fc-protection-stories-d230.md`: the A1 body, the outcome-semantics table row "Superseded by independent emergency/lifecycle action → … stale completion cannot release latch or update newer run", and AC-4, AC-8 and AC-11. |
| Registry / epic | `docs/state/registry.md`; active epic E11-packaging. A1#1076 is governed by D230, the ratified original contract and AM-1. AM-2 does not touch E11-S3 or #954. |
| Issue | #1076. Author `syamaner` with `author_association` `OWNER`, checked by the parent against a fresh API read. Body SHA-256 `48a60e43f3a22234c90757d02d71d2779a929cf8c52c2e0d35657a88519a472b`. The body contains the owner-authored supersession row quoted above. |
| Pre-AM-2 comments (both `OWNER`) | `6796642729` @ `2026-11-11T13:07:07Z` (body sha256 `f5fabbc7…df0aea`; original ratification). `6833383146` @ `2026-11-12T19:12:47Z` (body sha256 `7ca5c5db…0495d7`; AM-1 ratification). |
| Posting watermark | The body hash plus `{(6796642729,"2026-11-11T13:07:07Z"), (6833383146,"2026-11-12T19:12:47Z")}`, using the same canonical encoding as the original ratification comment. The AM-2 post itself is excluded from revalidation. The lead recomputes this; I cannot compute it. |
| Ratification of AM-2 | A new maintainer-authored comment that carries the provenance marker and binds AM-2's own SHA-256 beside the original and AM-1 hashes. The original and AM-1 bytes are not modified. |
| PR / branch | S2 remains PR #1084 on its existing branch. There is no stacking and no new PR. |

**Gates before any delegation from AM-2 (they fail closed):**

1. The owner ratifies AM-2's exact bytes.
2. The lead re-reads the issue body and all comments, recomputes the watermark, and verifies the hashes.
3. A fresh worktree is provisioned at the then-current S2 head. If that head differs from `cd92250`, every citation is re-verified first, and drift that invalidates a citation means re-planning.

**Validation receipts.** All are retained exactly as recorded. None is rescored or relabelled, and none certifies AM-2's repair.

| Head | Receipt | Meaning |
|---|---|---|
| `160156c0` | Unfiltered full gate 15635 passed / 14 skipped, PASS; the original 42 causal controls | Bound to that head only |
| `d39fde3` | Focused run 551 passed / 1 failed | Remains **failed** |
| `011c9ec` | Focused run 7 passed; statics PASS; no full gate | Unchanged |
| Optional causal-witness scorer | INVALID, with 3 controls unrun | Unchanged; no rescoring authority |
| Nine mandatory S2 repair receipts (AM-1 §3) | Valid | Preserved separately from the original 42 |
| `cd92250` | Full native gate 15759/14, PASS as supplied; exhaustive witness; 257 changed lines / 74 arcs covered; CI and Codex passes | Bound to `cd92250` only. It **does not** prove the interleavings in §2 safe: the synthetic reproduction records `application_guard_exercised: false`, and the automated review run records `review_complete: false`. The AM-2 repair invalidates it as evidence for the repaired head. |

**Synthetic adapter reproduction at `cd92250`** (lead-supplied; hardware-free; application guard not exercised):
- **Containment:** a containment completion that arrives after a new Start is cached as the new run's latest result.
- **Read, same child, new session:** after the read the old session becomes `latest_fault_session_id`, and the evidence stays **bound** to a session that is no longer the started one.
- **Read, replacement child:** the evidence is unbound, but the old session still becomes `latest_fault_session_id`.

---

## 1. Acceptance criteria (AM-2 scope; all PROPOSED)

**Source criteria quoted from the maintainer-authored issue body:**
- Outcome row "Superseded by independent emergency/lifecycle action": "Exact owner/generation evidence | New owner governs; stale completion cannot release latch or update newer run".
- AC-8: "Unknown drop/containment results cause zero reconnect, child-restart or new-session escape attempts. Emergency remains callable".
- AC-11: "Restart/fault/recovery cannot replay heat/drop or auto-resume".

**Ratified sources:**
- Original §2.7, the lifecycle ownership gate.
- AM-1 AM-5, AM-6 and AM-8.

Every row below is *inferred* from those sources plus the lead recommendation.

| ID | Proposed criterion (inferred; lead recommendation) | Slice |
|---|---|---|
| AM2-1 | A HUMAN read computes its telemetry with a **pure projection** over the adapter's current anchors. The adapter's shared cache (`_last_state`, `_last_elapsed`, `_last_change_monotonic`, `_last_ambient_token`, `_ambient_token_change_monotonic`) is committed **only when the read is bound** (D-2). A stale, superseded or otherwise unbound read still returns raw BT/ET and its projected telemetry for the existing validity and hard-limit path. It never overwrites the current anchors and never counts as bound freshness. | S2 |
| AM2-2 | Binding requires the complete adapter identity snapshot to be unchanged across the await: identity generation, started session, started child epoch and transport child epoch. All existing binding conditions also still apply. A same-value re-Start (ABA) or a reset during the read leaves the read unbound. | S2 |
| AM2-3 | These are preserved: exactly one `get_roast_state` RPC; AM-1 raw classification and D-1; exception and cancellation propagation with no envelope and no commit; exactly two clock reads on the envelope path and one on the exception path; the `HumanReadEvidence` fields and invariants; and the AUTOMATIC methods `read_telemetry`, `_project_telemetry`, `_observe_ambient_age` and `get_roast_state`, which are left without diff. | S2 |
| AM2-4 | `last_containment_result` is **diagnostic data for the current identity generation only**. It is never ownership, a latch input or settlement evidence. `reset_session_identity_for_new_run` clears it. A completion or cancellation from an older generation never publishes into a newer one (D-3). The caller still receives the original classified result. Cancellation still records and re-raises within its own generation. There is exactly one transport call and no retry. | S2 |
| AM2-5 | Any pending HUMAN adapter read or containment call is explicit unresolved lifecycle ownership. Reset, new Start, child replacement and runner replacement are **refused** until the call has actually terminated locally (return, raise, or cancellation delivered and unwound) (D-4). After that, any remote-unknown command ownership stays blocked under ratified §2.7. Cleanup or stop of the existing child, and independently admitted emergency, remain available. | S3 |
| AM2-6 | S3 adds application-level interleaving tests that assert `latest_fault_session_id`, fault-lease session identity and run-local freshness across all three reproduced interleavings and the ABA variant. | S3 |
| AM2-7 | The existing AUTOMATIC post-await cache write (`read_telemetry`), and the shared late-Start identity publish, are **not changed**. They are proposed as a separately tracked finding (§9 F-AUTO). | none |
| AM2-8 | No new endpoint, threshold, hardware action, provider, dependency, AUTOMATIC-mode change, persistence schema, model/API field or `RoastEventKind`. The four-slice plan and PR #1084 are retained. | all |

---

## 2. Spec

### 2.1 Facts at `cd92250` (from the supplied exports)

**Adapter fields** (`mcp_client.py:1355-1365`): `_fixed_zero_transport`, `_started_child_epoch`, `_last_containment_result`, `_last_state`, `_started_session_id`, `_last_elapsed`, `_last_change_monotonic`, `_last_ambient_token` and `_ambient_token_change_monotonic`.

**Identity reads and reset.**
- `latest_fault_session_id` prefers `_last_state.session_id` over `_started_session_id` (`:1383-1389`).
- `reset_session_identity_for_new_run` clears seven fields but **not** `_last_containment_result` (`:1391-1404`).

**Human read** (`read_human_evidence`, `:1583-1616`).
1. Admission clock at `:1585`.
2. Pre-await captures at `:1586-1589`.
3. Single await at `:1590`.
4. `_project_telemetry` at `:1591`. This **commits** the cache before the binding check.
5. Binding at `:1593-1601`. It re-reads only `transport.child_epoch` after the await, never the started session or epoch.

**Shared helpers.**
- `_project_telemetry` (`:1618-1629`) reads the clock, updates the elapsed anchors, sets `_last_state`, and calls `_observe_ambient_age` (`:1631-1707`), which mutates the ambient anchors.
- `start_session` (`:1709-1760`) resets at `:1733`, captures the transport epoch **before** the Start await (`:1756-1757`), and publishes the session and epoch **after** it (`:1759-1760`).

**Containment** (`contain_heat_fixed_zero`, `:1767-1787`).
- The NOT_ATTEMPTED path publishes synchronously (`:1778-1780`).
- Cancellation publishes UNKNOWN_TRANSPORT and re-raises (`:1783-1785`).
- Completion publishes without any identity check (`:1786`).

**Consumers.**
- The shutdown e-stop lease uses `latest_fault_session_id` (`api.py:6423-6436`).
- `_build_runner` resets the adapter identity synchronously (`api.py:6021-6026`).
- The main `emergency_stop` sends no session id (`mcp_client.py:1838-1849`).
- `HumanReadEvidence` is defined at `human_protection.py:82-131`.

### 2.2 S2: identity generation seam (adapter-local, infrastructure only)

These are private to `mcp_client.py`. They are never exported and never cross into `human_protection.py`, the controller or the API.

```python
@dataclass(frozen=True)
class _IdentitySnapshot:
    generation: int
    started_session_id: str | None
    started_child_epoch: int | None
    transport_child_epoch: int | None   # None when _fixed_zero_transport is None
```

- **`self._identity_generation: int`.** Initialised to `0` in `__init__`. Every call to `reset_session_identity_for_new_run` increments it by exactly 1, as its first statement, synchronously. `start_session` therefore increments it once, through `:1733`. No other code writes it.
- **`self._identity_snapshot() -> _IdentitySnapshot`.** Synchronous. It reads the four current values, including `self._fixed_zero_transport.child_epoch` when the transport is set.
- **`reset_session_identity_for_new_run`** additionally sets `self._last_containment_result = None`. Its seven existing clears are unchanged. No existing write is removed or reordered except that the increment comes first.

### 2.3 S2: pure human projection (exact semantics, copied from `:1618-1629` and `:1699-1707`)

```python
@dataclass(frozen=True)
class _ProjectionAnchors:
    last_elapsed: float | None              # type follows the adapter field it mirrors (`_last_elapsed`)
    last_change_monotonic: float | None
    last_ambient_token: float | None
    ambient_token_change_monotonic: float | None

def _project_human_view(
    state: RoastSessionState, anchors: _ProjectionAnchors, *, now: float
) -> tuple[RoastTelemetry | None, _ProjectionAnchors]:
    elapsed, change = anchors.last_elapsed, anchors.last_change_monotonic
    if elapsed is None or state.elapsed_monotonic_seconds != elapsed:
        elapsed, change = state.elapsed_monotonic_seconds, now
    age = 0.0 if change is None else now - change
    status = state.ambient_status
    token = ambient_reading_token(status) if ambient_reading_is_live(status) else None
    if token is None:
        amb_token, amb_change, ambient_age = None, None, None
    else:
        amb_token, amb_change = anchors.last_ambient_token, anchors.ambient_token_change_monotonic
        if amb_change is None or token != amb_token:
            amb_token, amb_change = token, now
        ambient_age = now - amb_change
    telemetry = project_session_state(state, age_seconds=age, ambient_age_seconds=ambient_age)
    return telemetry, _ProjectionAnchors(elapsed, change, amb_token, amb_change)
```

**Purity.**
- The function writes no adapter state.
- Its only side effect is the existing module-level one-shot non-finite warning inside `project_session_state` (`:1313-1321`), which is permitted exactly as at base.
- It never reads the clock; `now` is supplied by the caller.

**Clock and age semantics.**
- **Session-clock age.** `age` is the age of the session clock in the agent's clock domain relative to the **current** anchors, read after the await. It is `0.0` when elapsed changed or there is no anchor; otherwise it is `now − last_change`.
- **Ambient age.** `ambient_age` follows #732 unchanged, and `project_session_state` nulls it when the triad is unusable (`:1301`).
- **Unbound reads.** For an unbound read these are reported values only and are never committed. Such a read cannot renew freshness, because tracker freshness depends only on bound evidence (AM-1 H2-4).
- **Differential equivalence.** For any inputs, `_project_human_view(state, anchors_of(adapter), now=t)` followed by a commit must leave the adapter state, and return telemetry, identical to `_project_telemetry(state)` run with clock value `t` on the same adapter state. Test TC5 pins this.
- **Legacy methods untouched.** `_project_telemetry`, `_observe_ambient_age` and `read_telemetry` receive **zero diff**. Duplicating the arithmetic under a differential test was chosen over refactoring a shared AUTOMATIC helper, because AM-1 AM-8 forbids changing that helper.

### 2.4 S2: `read_human_evidence` ordered steps (replaces AM-1 §2.3 steps 2, 8 and 9 for the adapter)

1. `request_admitted_at = self._clock()`. This is clock read #1 (unchanged).
2. `before = self._identity_snapshot()`, synchronously, with no await between steps 1 and 3. (This replaces AM-1 step 2's three separate captures; the transport epoch is included in `before`.)
3. `read = await self._client._read_human_state()`. This is exactly one RPC, unchanged. Any exception, including `CancelledError`, propagates: no envelope, no commit, clock reads exactly `[admission]`.
4. After the await, synchronously with no further await:
   1. `now = self._clock()`. This is clock read #2.
   2. `after = self._identity_snapshot()`.
   3. `bound = (self._fixed_zero_transport is not None and before == after and type(before.transport_child_epoch) is int and before.transport_child_epoch == before.started_child_epoch and isinstance(before.started_session_id, str) and read.state.session_id == before.started_session_id)`.
   4. `bound_child_epoch = before.transport_child_epoch if bound else None`.
   5. `telemetry_view, proposed = _project_human_view(read.state, self._projection_anchors(), now=now)`.
   6. Construct `HumanReadEvidence(...)` exactly as at `:1602-1616`. Telemetry is kept only when both raw classes are VALID. If `__post_init__` raises, the `ValueError` propagates and nothing is committed.
   7. **Commit, as the last statement before `return`, and only if `bound`.** Assign the four anchors from `proposed` and set `self._last_state = read.state`, the neutralised mirror per AM-1.
   8. Return the evidence.

**What the step 4.3 condition covers.** Same-value reuse across a reset or Start is caught by `generation`. Started session or epoch drift is caught by the corresponding snapshot fields. Child replacement is caught by `transport_child_epoch`. Session mismatch, a missing Start, a plain client and a Start-epoch mismatch are the existing conditions, preserved.

### 2.5 S2: containment cache publication (amends `:1767-1787`)

1. **Precondition failure.** The precondition check at `:1771-1777` is unchanged. NOT_ATTEMPTED is published synchronously and returned (unchanged).
2. **Capture the generation.** Read `generation = self._identity_generation` synchronously after the precondition check, immediately before the transport await.
3. **Single transport call.** Exactly one `await transport._contain_heat_fixed_zero(session_id)`.
4. **Cancellation.** On `CancelledError`, if `self._identity_generation == generation`, publish `ContainmentResult(UNKNOWN_TRANSPORT)`. Then bare `raise` in all cases, so the same exception propagates.
5. **Completion.** On return, publish `result` only if `self._identity_generation == generation`. Return `result` unchanged in all cases.
6. **Other exceptions** propagate without publishing, as at base. AM-2 does not change this. S3 must treat them as UNKNOWN ownership (§2.7).
7. **No retry or fallback.** No retry, fallback, reconnect, respawn or Start occurs on any path.

**Why publication is keyed on the generation, not the child epoch (D-3).** A child replacement without a reset is still the same run's identity generation. Keying on the generation keeps that run's UNKNOWN visible, as pinned by the existing test at `tests/test_mcp_fixed_zero.py:1238-1263`, instead of hiding it.

**Non-authority.** The cache must never be read for ownership, latch, eligibility, continuation, Start admission or settlement. Clearing it on reset therefore cannot erase command ownership: ownership lives only in the application `HumanRunOwnership` (ratified §2.7), populated from the **returned** result or the caught cancellation.

### 2.6 Explicit amendments to AM-1

| AM-1 item | AM-2 replacement (proposed) |
|---|---|
| AM-6 | "… Freshness evidence counts only when bound: identity generation, Start session, Start child epoch and transport child epoch are unchanged across the await, the transport epoch equals the Start epoch, and the state's session equals the Start session." |
| §2.3 step 2 | This becomes `_identity_snapshot()` (§2.4 step 2). |
| §2.3 step 8 | "**Projection.** Compute `_project_human_view` over the current anchors at clock read #2. Commit anchors and `_last_state` **only for a bound envelope**, after envelope construction, usable or unusable alike. An unbound envelope commits nothing. Telemetry is kept only when both raw classes are VALID." |
| §2.3 step 9 | This becomes §2.4 step 4.3. Binding gates freshness evidence and shared-cache commit. It does not gate the existing validity/hard-limit evaluation of an unbound usable reading. |
| "Exceptions" paragraph | Unchanged, plus: "An envelope-construction `ValueError` commits nothing." |
| GA10 / TA9 | TA9 adds four cases, each giving `bound_child_epoch None` with valid telemetry returned **and no commit**: same-child new session during the read; same-child **same** session re-Start during the read (ABA); reset without Start during the read; replacement followed by Start. The existing "new-session" expectation at `tests/test_mcp_fixed_zero.py:1172` (`process.child_epoch`) is **reversed to `None`**. |
| GA12 / TA11 | "For **bound** envelopes, the four anchors and `_last_state` update identically for usable and unusable reads and equal the legacy helper's result on the same inputs (TC5). For **unbound** envelopes, none of the five changes." The decoded-read matrix assertions (`_assert_projection_state`, `:870-873`, used at `:933-938` and `:993-995` on unbound reads) must move to a bound harness, or be inverted to assert no commit. |
| §2.5 item 8 (S3 persistence) | Added: "If the turn's read is unbound, S3 must not persist the previously committed `last_state` as that turn's raw state. If existing records cannot express 'no attributable raw state' without a schema change, S3 returns `ESCALATE`." |
| §4 sweeps | The rows in §4 below are added. |

### 2.7 S3: pending-call ownership obligation (contract text for S3 kickoff; not implementation now)

This extends ratified §2.7 `HumanRunOwnership`. It is application-owned, in memory and process-level, with no SDK, store or UI types.

1. **Pending-call kinds.**
   - Add plain `Enum PendingHumanCall { READ, CONTAINMENT }`, held with `HumanRunOwnership`.
   - Each HUMAN adapter call (`read_human_evidence` in H2, and `contain_heat_fixed_zero` in RD-1) is registered through a synchronous scope.
   - The scope is entered with no await between registration and creation of the adapter coroutine, so registration is published before the coroutine's first await.
   - The scope is exited only in a `finally` that runs after that await completes (return, raise, or delivered cancellation unwinding the frame).
   - At most one pending READ exists per adapter. A second READ while one is pending is refused with zero RPC. This makes ratified H2-2/T55 explicit.
2. **Lifecycle predicate.** Ratified §2.7's "blocked" predicate becomes: unresolved ownership **or** any pending call. Every operative lifecycle entry observes it **before** reset, spawn or session dispatch, and again after every wait and immediately before each effectful step:
   - `start_roast`;
   - `_build_runner`'s reset;
   - restart-recovery construction;
   - `_respawn_mcp_for_device_config`;
   - adapter `start_session` and `reset_session_identity_for_new_run`, through the consumer-owned predicate;
   - application-triggered `MCPServerProcess` start or replacement;
   - the HTTP Start delegate.
3. **Refuse, do not wait (D-4).** A blocked entry fails closed through the existing start-admission refusal path. It adds no wait, no timeout threshold and no automatic retry. A later operator Start is an explicit operator action.
4. **After local termination.**
   - A terminated READ leaves no command ownership; a read is not a write.
   - A returned CONTAINMENT result is classified according to ratified §2.6: REFUSED_* remains known non-dispatch, COMMAND_STATE_RETURNED remains commanded-state evidence only, and UNKNOWN_* marks command ownership UNKNOWN. Cancellation, timeout or any escaping exception also marks UNKNOWN. Publish the applicable ownership transition **before** the pending scope exits. Local termination does not clear pre-existing unknown ownership or endpoint latches; subsequent lifecycle eligibility still follows ratified §2.7.
   - Neither cleanup, `last_containment_result`, nor a successful stop clears it.
5. **Always available.**
   - Cleanup or stop of the existing child is allowed while a call is pending. It may itself terminate the call. It never clears uncertainty and never authorises a new child.
   - Independently admitted emergency (`admit_emergency_stop`/`run_emergency_stop`, the shutdown e-stop admission at `api.py:6409-6442`) is unaffected.
6. **Run-local freshness.** Evidence returned to a run's controller is observed only by that run's tracker. A new run's tracker starts empty, so its first bound read is UNPROVEN.
7. **Verification duties at the S3 base** (not new guards). S3 confirms that existing start-admission ownership prevents a reset or Start from beginning while an adapter `start_session` is pending. S3 also confirms that runner teardown either awaits the old tick task or relies only on the predicate refusal above. If either cannot be shown, S3 returns `ESCALATE` naming the path.

**Source needed for S3 kickoff.** This spec is bounded, but I could not anchor the following because they are absent from the packet. S3 must cite them at its own base.
- `api.py` at `cd92250`:
  - `start_roast`, `_begin_live_run`, prior-runner teardown and tick-task cancellation/await;
  - `_respawn_mcp_for_device_config`, `recover_on_start`, the HTTP Start delegate;
  - `_admit_fault_control_lease`, `_schedule_admitted_fault_control_lease_persistence`, `_fault_lease_cache` close/reconcile;
  - the `NewRunSessionIdentityReset` protocol declaration.
- `mcp_client.py`:
  - `MCPServerProcess.start`, `stop`, `_replace_session`, `_fail_closed_teardown`, `child_epoch`, transport `_contain_heat_fixed_zero`;
  - `_applied_state_or_none`, and adapter lines after `:1855`.
- `human_protection.py` after `:230` (`record_read_failure`, `recheck`).
- The MCP producer's behaviour for a non-latest `expected_session_id`. This is context only and is not in scope.

### 2.8 Architecture gate

**Responsibilities.**
- **Domain** (`human_protection.py`): `HumanReadEvidence`, `RawTemperature`, `CounterEvidence`, and the containment outcome types. It has no generation, cache or SDK concept.
- **Infrastructure** (`mcp_client.py` adapter): clocks, projection anchors, the identity generation, the commit decision and the diagnostic cache.
- **Application** (`HumanRunOwnership`, controller, runner and service): pending-call and command ownership, and lifecycle admission.

**Dependency direction.** Application depends on domain types and the adapter protocol. The adapter depends on domain types. The domain imports no infrastructure. `_IdentitySnapshot` and `_ProjectionAnchors` never leave `mcp_client.py`.

**Closed invariants.**
1. A successfully constructed envelope commits if and only if the read is bound; exceptions commit nothing.
2. The generation is strictly increasing and is advanced only by reset.
3. The cache publishes only within the capturing generation.
4. The cache is never authority.
5. One RPC and two clock reads per envelope.
6. AUTOMATIC methods have no diff.
7. A pending call blocks lifecycle changes. Local termination removes only the pending marker; it never clears command ownership or endpoint latches, and subsequent eligibility follows ratified §2.7.
8. Emergency is never blocked.

**Extension seams.**
- Any future consumer of the generation, or of `last_containment_result`, needs a contract amendment.
- Adding a `PendingHumanCall` member is a contract change; the enum is closed.
- The F-AUTO fix may reuse §2.2 under its own contract.

---

## 3. Test list

All tests are hardware-free: fakes, an injected clock and spies. No E12 story is involved, and no hardware or qualification claim follows. Each guard's mutation **must** make the named test fail.

### S2 (`tests/test_mcp_fixed_zero.py`, `tests/test_human_protection.py`)

| Guard | AM2 | Test | Removing/inverting the guard must fail |
|---|---|---|---|
| GC1 commit iff bound | 1 | **TC1.** Bound usable, bound unusable and bound absent-device reads all commit. Every unbound reason commits nothing: no transport, no Start, session mismatch, Start epoch ≠ transport epoch, replacement during the read, reset during the read, same-child new session, same-child ABA, and replacement followed by Start. "Commits nothing" means `_last_state` keeps its identity and all four anchors are equal to their prior values, while `evidence.bean_temp_c`/`env_temp_c`/`telemetry` are still returned. | An unconditional commit (base) fails every unbound row. Committing whenever the read is "not superseded" fails the session-mismatch row. |
| GC2 snapshot equality | 2 | **TC2.** (a) Reversed "new-session" expectation: `None`, with `latest_fault_session_id == "next-session"`. (b) ABA, same session id: `None`. (c) Reset only: `None`, `latest_fault_session_id is None`. (d) **White-box** row: set `_started_session_id`, then `_started_child_epoch`, during the suspension **without** a reset, giving `None`. This row exists because no public path changes either without a generation bump. | Comparing only the transport epoch (base) fails (a)–(c). Dropping `generation` fails (b). Dropping either started field fails its (d) row. |
| GC3 generation increments | 2 | **TC3.** Each reset adds exactly 1 (`type is int`); `start_session` adds exactly 1; reads, containment and AUTOMATIC read/projection paths add 0. Explicit reset and Start each increment as specified, regardless of requested authority; this internal diagnostic generation changes no AUTOMATIC control decision. | No increment fails TC2(b). A double increment fails TC3. |
| GC4 view is pure | 1 | **TC4.** For an unbound read, the returned `telemetry.age_seconds` equals `now − last_change` when elapsed is unchanged against the current anchors and `0.0` when it changed. Ambient age is aged on the same token and `0.0` on a new token. Anchors are untouched. | Writing anchors in the view fails TC4/TC1. |
| GC5 differential equivalence | 3 | **TC5.** Parametrised over: elapsed equal or different; anchors None or set; ambient not live, live with the same token, or live with a new token; non-finite derived rates. A bound read's anchors, `_last_state` and telemetry equal those of a reference adapter running `_project_telemetry` with the same clock value. | Any arithmetic divergence fails TC5. |
| GC6 clock count | 3 | AM-1 TA2 extended: envelope clock `[admit, project]` for both committed and uncommitted reads; exception clock `[admit]`. | Adding or moving a clock read fails it. |
| GC7 commit last | 3 | **TC7.** Patch `HumanReadEvidence` construction to raise `ValueError`. The error propagates and nothing is committed. | Committing before construction fails TC7. |
| GC8 failure semantics | 3 | AM-1 TA10 (`:1047-1076`) re-run in a bound harness: every failure, including cancellation, propagates the same object, commits nothing and leaves the generation unchanged. | Catching or committing on failure fails it. |
| GC9 AUTOMATIC untouched | 3, 7 | **TC9.** `read_telemetry` still commits after a reset during its await (base race, pinned as unchanged and tracked as F-AUTO). AM-1 GA13 and `:1182-1209` stay green. The PR diff has zero hunks in `read_telemetry`, `_project_telemetry`, `_observe_ambient_age` and `get_roast_state`. | Routing AUTOMATIC through the view or commit guard fails TC9. |
| GC10 cache cleared on reset | 4 | **TC10.** After each outcome (NOT_ATTEMPTED, one of each REFUSED_*, COMMAND_STATE_RETURNED, each UNKNOWN_*), `reset_session_identity_for_new_run()` and `start_session()` each leave `last_containment_result is None`. | Not clearing fails TC10. |
| GC11 no cross-generation publish | 4 | **TC11.** Completion and cancellation are each crossed with: reset; reset+Start with a new session; reset+Start with the same session (ABA); and a newer generation performing its own NOT_ATTEMPTED attempt during the await. Expected: the returned value equals the transport's classified result; cancellation re-raises; the cache is `None`, or the newer generation's own result; exactly one containment transport call; zero retries; zero lifecycle calls initiated by containment beyond the test-injected reset/Start/replacement. | Unconditional publishing (base) fails. Keying on the session string fails the ABA row. Swallowing cancellation fails. |
| GC12 same-generation publish kept | 4 | **TC12.** Without a reset, the cache equals the result. A same-generation cancellation caches UNKNOWN_TRANSPORT and re-raises. Child replacement without a reset (`:1238-1263`) caches UNKNOWN_TRANSPORT. | Gating on the full snapshot or the child epoch fails the replacement row. |
| GC13 cache non-authority | 4 | Sweep R-3 (§4) in S2. In S3, TD8 below. | A consumer reading the cache fails R-3. |

The AM-1 matrix tests at `:876-1044` and `:1118-1179` are rewritten per §2.6. All existing S2 receipts stay bound to their heads.

**Causal controls.**
- Run one control per changed guard, GC1–GC12, and preserve the nine valid repair receipts.
- Do not rerun the original 42 controls or unchanged controls.
- Stop on the first invalid witness and preserve it. Restore by `cp` with hash verification.
- The optional scorer stays INVALID with 3 controls unrun.

### S3 (`tests/test_runner_human_turn.py`, `tests/test_controller_human_mode.py`; anchors re-cited at the S3 base)

| Guard | AM2 | Test | Mutation that must fail |
|---|---|---|---|
| GD1 pending READ blocks lifecycle | 5, 6 | **TD1.** Hold H2's read. Attempt Start through the service and the HTTP delegate, then runner construction, respawn and application child replacement. Expect zero resets, zero `start_roast_session` calls, zero spawns, zero new run rows and zero generation change. After the read terminates, Start is admitted when no other ownership is open. | Removing the pending registration, or any per-entry check, fails its row. |
| GD2 interleaving: same-child new session | 6 | **TD2.** Read pending, then Start is refused. After release, legitimate Start. Assert `latest_fault_session_id ==` the new started session; the shutdown e-stop lease session is the new session or UNKNOWN, never the old one; the new run's first bound read is UNPROVEN. | With S2's commit guard kept and the S3 gate removed, the zero-Start assertion fails. |
| GD3 interleaving: replacement child | 6 | **TD3.** As TD2, with child replacement attempted during the read. | Removing the replacement-entry check fails it. |
| GD4 interleaving: containment | 5, 6 | **TD4.** Containment pending; Start is refused. Termination by cancellation, timeout, a malformed result or an unexpected exception leaves UNKNOWN and Start **still** refused; COMMAND_STATE_RETURNED or REFUSED_* follow ratified §2.7. During pending ownership and on automatic continuation after termination: zero reconnect, respawn or Start. A later explicit operator lifecycle request is evaluated under the existing known/unknown ownership policy. | Clearing ownership on termination fails. Releasing the pending scope before UNKNOWN is published fails. |
| GD5 ABA at application level | 2, 6 | **TD5.** The same session id after a legitimate post-termination Start: the old evidence never feeds the new tracker. | Keying the tracker on the session string fails. |
| GD6 cleanup and emergency available | 5 | **TD6.** During a pending READ or CONTAINMENT, stop/cleanup and an admitted e-stop both proceed. Uncertainty persists and no replacement follows. | Blanket-blocking emergency or cleanup fails. Treating a successful stop as settlement fails. |
| GD7 single pending READ | 5 | **TD7.** A second READ while one is pending is refused with zero RPC. | Removing exclusivity fails. |
| GD8 cache not ownership | 4 | **TD8.** After UNKNOWN, a real lifecycle reset attempt is refused under §2.7. Separately, simulate diagnostic-cache loss with a white-box clear of `_last_containment_result` only: UNKNOWN ownership remains and Start is still refused. This grants no runtime cache-clear or reset endpoint. | Deriving ownership from the cache fails. |
| GD9 refuse, not wait | 5 | **TD9.** A blocked Start returns the existing refusal synchronously; no awaiting task or timer remains. | Adding a wait loop fails. |
| GD10 unbound raw state not persisted | §2.6 | **TD10.** On a turn with an unbound read, the persisted raw state is not the prior committed state, or S3 returns `ESCALATE`. | Persisting `last_state` unconditionally fails. |

---

## 4. Class sweep (run in `{IMPL_WORKTREE}`; base set from the `cd92250` export, lines 1200–1855)

| ID | Class | Command | Expected base / after |
|---|---|---|---|
| R-1 | Adapter-cache writes after an await | `rg -n --pcre2 'self\._(last_state\|last_elapsed\|last_change_monotonic\|last_ambient_token\|ambient_token_change_monotonic\|started_session_id\|started_child_epoch\|last_containment_result\|identity_generation)\s*(?::[^=]+)?(?:\+=\|=(?!=))' src/roastpilot_agent/mcp_client.py` | **Base: 27.** `__init__` 1358–1365 (8); reset 1398–1404 (7); `_project_telemetry` 1621, 1622, 1624; `_observe_ambient_age` 1701, 1702, 1705, 1706; `start_session` 1759, 1760; containment 1779, 1784, 1786. Hits after `:1855` are unexported and must be classified. **After:** plus generation init and increment, the reset cache-clear, the bound-only commit block, and generation-guarded 1784/1786. Classification: legacy 1621–1706 and 1759–1760 unchanged (F-AUTO). |
| R-2 | Identity consumers | `rg -n 'latest_fault_session_id' src/roastpilot_agent` | Parent-verified base matches: `mcp_client.py:1384`; `replay.py:549`; `api.py:248,1707,4892,4950,5136,6423`. Classify each declaration/accessor/consumer and any changed match; S3 pins TD2. |
| R-3 | Cache readers | `rg -n 'last_containment_result' src/roastpilot_agent` | Base: `mcp_client.py` 1359, 1763, 1765, 1779, 1784, 1786 only. After S2: plus the reset clear; zero hits outside `mcp_client.py`. After S3: none in any ownership, admission or eligibility path. |
| R-4 | Reset callers | `rg -n 'reset_session_identity_for_new_run' src/roastpilot_agent` | Base: `mcp_client.py` 1391 (definition) and 1733; `api.py` 6026; plus protocol declaration `api.py:295`. S3: every call site is behind the §2.7 predicate. |
| R-5 | Human projection twins | `rg -n -e '_project_human_view' -e '_project_telemetry' -e '_observe_ambient_age' src/roastpilot_agent/mcp_client.py` | After: one definition each. `_project_telemetry` is called only from `read_telemetry`; `_project_human_view` only from `read_human_evidence`. |
| R-6 | Binding sites | `rg -n -e 'bound_child_epoch' -e '_identity_snapshot' src/roastpilot_agent` | After: snapshot before and after inside `read_human_evidence` only; the domain field unchanged. |

The ratified S-5, S-7 and AM-1 §4 sweeps are retained. S2 output is handed back classified.

---

## 5. PR plan

The four-slice plan is retained unchanged: S1 → S2 → S3 → S4, serial off `main`, resume-on-merge.

**S2 = PR #1084.**
- The AM-2 repair is added as commits on the existing S2 branch after ratification. There is no stack and no new PR.
- Estimated **+60–80 logic lines**: snapshot and generation about 15, pure view about 25, read rewrite about 15, containment guard about 10. Tests are excluded.
- Re-estimate at handback. The parent measured the existing S2 diff at 577 changed production lines before AM-2; the draft estimate therefore implies roughly 637–657 total, subject to the actual diff. Keep the repository's about-400-line planning guide; no 420-line threshold is introduced. The PR body must justify this cohesive strict consumer/evidence boundary and the additional atomic binding/commit repair, and all triggered reviewers remain mandatory.

**S3.** The ratified 550–700 estimate, plus about 30–60 for the pending-call scope and predicate. It is re-planned and re-cited at its own base.

**S4.** Unaffected, with no new projection fields.

**Linking.** Unchanged: `Refs #1076`.

---

## 6. Routing

| Slice | Required before opening (parent may only add) |
|---|---|
| S2 repair | `safety-reviewer`; `security-reviewer` (the PR parses child output, and the commit decision is identity-sensitive); `mcp-contract-checker`; `qa` (mandatory; the S2 test diff exceeds 600 lines) |
| S3 | `safety-reviewer`; `sim-roast-runner`; `mcp-contract-checker`; `qa` (likely, given the interleaving matrix); `security-reviewer` if the diff touches the decoder |

- The implementation family is the Codex parent's choice at slice start, based on observed capacity. No family or percentage is asserted here.
- Safety-review capacity is never spent on implementation.
- Review packets carry the §0 receipt table verbatim.

---

## 7. Delegation prompt notes (mandatory; carry verbatim)

1. **Worktree.**
   - `{IMPL_WORKTREE}` is a placeholder. The parent provisions a **fresh** managed worktree with a new `codex/` branch at the then-current S2 head, equivalent to `git worktree add -b codex/<slug> {IMPL_WORKTREE} <s2-head-sha>`. Without `-b`, HEAD is detached and the handback lands on no branch.
   - The parent verifies that exact HEAD, verifies `git status --porcelain --ignored` is empty, and substitutes the real path immediately before delegation.
   - The lead fast-forwards the S2 branch from the verified handback.
   - Every command self-locates. Never use the planning tree, never detach HEAD, never guess a path.
2. **Parent-only delegation.** Only the Codex parent delegates. The worker spawns no agents. Reviewers do not edit; the parent adjudicates.
3. **Directives.**
   - The worker's only directives are the ratified A1 contract, AM-1, AM-2's numbered sections and lead-authored directives.
   - Every `UNTRUSTED-QUOTE` block and every non-maintainer URL is stripped. Findings reach the worker only as the paraphrase in this contract.
   - The worker must not fetch the issue, its comments or any GitHub discussion (including `gh issue view --comments` and PR review threads), the MCP repository or producer links.
4. **Environment (#738).** Run `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev` inside the worktree. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
5. **Gates before handback (SAFETY_CRITICAL).** Run each separately:
   - `ruff check .`
   - `ruff format --check .`
   - `pyright`
   - full pytest with `--cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing`, with no `-m`, `-k`, `-n` or deselect
   - the FE contract tests

   Cover every changed line and branch. A focused pass is never a full gate. Hand back the §4 sweeps, classified. Prior receipts stay bound to their heads.
6. **Attribution invariant.**
   - The handed-back branch must be attributable to the implementation worker acting on its ratified inputs alone: the ratified contract, AM-1, AM-2 and lead-authored directives, which are the sanctioned channel.
   - Any other model input the worker procures, at any stage, in any form, by any route, breaks attribution.
   - The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?"
   - A **yes** fails the slice closed. The lead then either re-delegates from the contract in a fresh worktree, or records an explicit operator decision naming which lens supplies the independent pass.
7. **Traps.**
   - Do not edit `read_telemetry`, `_project_telemetry`, `_observe_ambient_age`, `get_roast_state`, `project_session_state`, `RoastSessionState`, `RoasterDeviceState`, `StateReader`, `controller.py` or `api.py` in S2.
   - Make exactly one RPC and two clock reads per envelope, and commit last, only when bound.
   - The generation is advanced only by reset.
   - The cache is diagnostic only. Never read it for decisions, and never turn UNKNOWN into settlement.
   - Use a bare `raise` on cancellation. No retry, reconnect, respawn or Start on any path.
   - Plain `Enum` only, Celsius only. No new threshold, schema, field, `RoastEventKind`, dependency (the `coffee-roaster-mcp==0.2.4` pin stays) or HUMAN enablement surface. Do not modify `cold_characterisation/*`.
   - Do not fix the AUTOMATIC race (F-AUTO). TC9 pins it as unchanged.
   - Causal controls: stop on the first invalid witness, restore by `cp` with hash verification, and do not rerun the original 42.
   - If any §2.1 fact does not match the worktree (for example `elapsed_monotonic_seconds` typing, or the `ambient_reading_*` helpers), stop and return `ESCALATE`.
8. **Fixtures.** Rewrite `tests/test_mcp_fixed_zero.py:870-873`, `:876-1044` and `:1118-1179` per §2.6. There are no MCP or FE fixture changes.

---

## 8. Risk profile

**Blast radius.** Human-mode session identity, which feeds the fault-lease target for terminal fault actions, persisted raw state, session-clock age and S3 bound freshness. The main e-stop is unaffected because it sends no session id. HUMAN mode stays unreachable (AC-NA). There is no hardware action, credential, endpoint or schema.

**Break these first:**
1. The old session becoming `latest_fault_session_id` after any reset, Start or replacement interleaving.
2. The ABA case: the same session id and epoch re-Started during the read.
3. Commit-before-construct.
4. An extra clock read, or the pure view writing anchors.
5. A differential mismatch with the legacy projection.
6. An old containment completion or cancellation appearing in a newer generation.
7. A cache read used as ownership.
8. AUTOMATIC diff leakage.
9. In S3: a lifecycle entry that skips the pending predicate, the pending scope exiting before UNKNOWN is published, or a blocking wait.

**Residual risks (not claims):**
- The AUTOMATIC `read_telemetry` race and the late `start_session` publish remain (F-AUTO).
- An unbound read reports a session-clock age relative to the current anchors; this is uncommitted and does not count as freshness evidence.
- S2 alone does not order overlapping same-generation HUMAN reads; S3's TD7 does.
- Until S3, nothing at application level prevents the interleavings; S2 only contains their cache effects.
- No current-head receipt exercises an application guard.

---

## 9. Owner decisions and the separate finding

**Approval scope.** Ratifying AM-2 would ratify the following.
- **D-2: commit iff bound.** A read whose session mismatches the started session is *not* committed even if not superseded, because committing it would put an unstarted session into `latest_fault_session_id`. The alternative ("commit unless superseded") is rejected.
- **D-3: cache keyed on generation.** Containment cache publication is keyed on the identity generation, not the child epoch, so same-run UNKNOWN stays visible.
- **D-4: refuse, do not wait.** Blocked lifecycle entries refuse rather than wait, so no new timeout is introduced.

Approval covers this software contract only. It is not authority for hardware, live operation, merge or release, and it does not waive any review.

**F-AUTO: proposed separate issue.** The owner decides whether to open it; it is not delegated by AM-2.
- AUTOMATIC `read_telemetry` (`mcp_client.py:1580-1581` → `:1618-1629`) commits a post-await read into the shared cache with no identity recheck.
- `start_session` publishes the started identity after its await (`:1758-1760`) with no generation recheck.
- Any change to these alters AUTOMATIC behaviour and needs its own contract and tests.
- AM-2's §2.2 seam is a possible reuse point.

**Before posting:**
1. Run a mechanical secret scan over the exact text.
2. Bind AM-2's SHA-256 beside `66a9f263…386f` and `36043254…6a41a`.
3. Recompute the watermark (§0).
4. Add the provenance marker only after owner ratification.