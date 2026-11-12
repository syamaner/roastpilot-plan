> Owner-review copy: Claude story-planner output, consolidated by the lead before ratification. The immutable planner output remains in `/private/tmp/a1-read-evidence-correction/followup/planner-result.md` (SHA-256 `4918a48932ae991c2f7dd51bcb99d64fb47ad0c1fca0d80369ca5cbc10567b3a`). Lead corrections clarify the fresh-snapshot claim, retained telemetry type, rejected metadata fixture, unbound-read counter reset, representability test oracle, preservation of prior valid causal receipts, and managed-worktree provisioning. No implementation is authorized by this document.

# A1 contract amendment AM-1 (corrected): typed human-read evidence for S2 and its S3 consumer, Agent #1076

**Status: PROPOSED. Not ratified. No delegation may use AM-1 until the owner ratifies its exact bytes.** This text supersedes the first AM-1 draft entirely.

- **Authority.** The owner approved the typed-evidence direction only. AM-1 turns that direction into a contract and settles one boundary choice, D-1 (§2.3). Ratifying AM-1 ratifies D-1. No other owner decision is open.
- **What stays authoritative.** The ratified A1 contract (SHA-256 `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f`) governs everything AM-1 does not replace.
- **Ratification of the original.** The original's opening "proposed, not ratified" line is historical. Ratification is the OWNER-authored API comment 6796642729 (`syamaner`, `OWNER`, created and updated 2026-11-11T13:07:07Z), which binds that exact hash.
- **How this text was produced.** It is text-only planner output. I had no tools, no MCP and no added directories. I verified nothing against a filesystem. Every citation is a parent-supplied `file:line` export at the bindings below. No D219 confinement, capture, implementation, hardware, live-admission or release claim follows from it.

## 0. Bindings, gates and evidence (as supplied by the parent)

| Binding | Value |
|---|---|
| Implementation tree | Agent `011c9ecfc5533977e201c02dde652b92ab0536d2`. This is the S2 branch tip after the tests-only correction. Candidate `160156c0`; base `771fc2d7`. Parent-verified fresh planning snapshot clean, including ignored files; this does not describe the implementation checkout’s ignored validation environment. |
| Plan tree | `93806f4c1049b86b21c3309a5f3cba3982708b98` |
| G0-a (parent-supplied) | Plan PR #102 merged 2026-11-11T14:07:22Z at `93806f4`, reviewed head `3c45234`. It adopted the four-PR refinement. The retained draft-effectiveness prose in `fc-protection-d230.md` is historical. |
| Plan anchors | `roastpilot-agent/fc-protection-d230.md`: clause 2 (accepted readings), clause 8 (diagnostic separation), the stale-reading clarification (RD-3) and the architecture gate. `roastpilot-agent/fc-protection-stories-d230.md`: A1 body, AC-4 and AC-12. The Plan exports carry no line numbers, so they are cited by section. |
| Registry / epic | D230 in `roastpilot-agent/plan.md`. The active epic is E11-packaging. #1076 is open. AM-1 does not touch E11-S3 or #954. |
| Issue | #1076, author `syamaner` / `OWNER`. Body SHA-256 `48a60e43…a519a472b`. The body was posted through the ChatGPT Codex Connector app under the owner account; `author_association` is still OWNER. |
| Watermark for posting AM-1 | Body hash plus pre-AM-1 comments `{(6796642729, "2026-11-11T13:07:07Z")}`, using the same canonical encoding as the ratification comment. Exclude the AM-1 post itself during revalidation. The lead recomputes this. |
| Ratification of AM-1 | A new maintainer-authored comment with the provenance marker, binding AM-1's own SHA-256 alongside the original hash. Changing the original's bytes is not part of ratification. |

**Validation evidence.** Each receipt is a separate fact; none of them is a full pass of the current head.

| Head | Receipt | What it means |
|---|---|---|
| `160156c0` | Unfiltered full gate, 15635 passed / 14 skipped, PASS. The original 42 causal controls and the initial focused failure are also retained here. | Original gate. Its scope does not expand after repair. |
| `d39fde3` (tests-only) | Broader focus, 551 passed / 1 failed. The failure was in `get_server_info` setup under the shared 1.5 s deadline, before the T26 witness ran. | Remains **failed**. Not relabelled. |
| `011c9ec` (tests-only) | Setup uses the existing 5 s default; the measured containment step uses 1.5 s, asserted (`tests/test_mcp_fixed_zero.py:663-673`). First focused run 7 passed; statics PASS. | **No full gate at `011c9ec`.** |
| Optional causal witness scorer | INVALID, with 3 optional controls unrun. | Unchanged. There is no rescoring authority, and the stopped batch is not relabelled. |

- The two identical mutation logs are explained only by the distinct driver substitutions and the first-catcher limitation. No per-mutant PID evidence is claimed.
- Review packets carry this table verbatim.

**Resolved source facts (parent adjudication M1–M7):**

- **M1 (read-failure counter).** `_read_telemetry` catches `Exception`, increments the counter once and returns `(None, True)` (`controller.py:4277-4281`). `CancelledError` is not an `Exception`, so it propagates with the counter untouched. A non-raising return, including `None`, resets the counter to 0 (`:4282-4283`). The ratified H2-3 wording "raised **or returned `None`**" diverges from this; §2.5 corrects it.
- **M2 (child epoch).** `MCPServerProcess.child_epoch` returns `_child_epoch` (`mcp_client.py:2568-2576`). `_replace_session` increments it and clears discovery (`:2578-2584`).
- **M3 (object predicate).** `_json_object` returns a value only when `type(value) is dict` (`mcp_client.py:2068-2071`). It is the exact predicate AM-1 requires.
- **M4 (reader protocol).** `StateReader` declares only `read_telemetry` (`controller.py:427-432`). `read_human_evidence` exists only on the adapter (`mcp_client.py:1547-1554`) and in S2 tests. No production fake implements it (`tests/conftest.py:77-118`). S3 owns any protocol or fake addition.
- **M5 (S2 path set).** S2's eight paths are `src/roastpilot_agent/{controller,human_protection,live,mcp_client,replay}.py`, `tests/conftest.py`, `tests/fixtures/fixed_zero_stdio_peer.py` and `tests/test_mcp_fixed_zero.py`. AM-1 explicitly assigns one additional test file, `tests/test_human_protection.py`, for the envelope and plain-Enum checks.
- **M6 (`RoastTelemetry`).** Defined in `models.py:457-519`, with `bean_temp_c: float` and `env_temp_c: float` (`:505-506`).
- **M7 (test sources).** The complete `tests/test_mcp_fixed_zero.py` and the tests-only diff were supplied.

## 1. Acceptance criteria (AM-1 scope only)

**Owner direction, as supplied:** "Successful read with invalid/missing temperatures uses existing freshness/RECOVERY; genuine read/transport failure retains existing failure-counter/FAULT; raw validity and automatic behaviour preserved."

| ID | Criterion | Source |
|---|---|---|
| AM-1 | A decoded `get_roast_state` response that lacks a usable BT/ET pair is a successful read. It is typed differently from a genuine read failure. | Owner direction |
| AM-2 | Such a read does not increment the read-failure counter, cannot renew freshness, and cannot authorize heat, fan or drop. It follows existing validity, RD-3 RECOVERY and the tracker. | Owner direction; D230 RD-3, clause 2 |
| AM-3 | A genuine read failure keeps the existing counter and `evaluate_mcp_failure` FAULT handling. Cancellation keeps its existing counter behaviour (untouched) and propagates. | Owner direction; `controller.py:4277-4298` |
| AM-4 | Raw BT/ET validity is decided from exact type, finiteness and float-representability **before** mirror coercion. Nothing is fabricated, and an exact `int` keeps its type. | Owner direction; clause 2; AC-4 |
| AM-5 | One `get_roast_state` call per human read. No hidden second read, no retry, no revalidation call. | Ratified H2-2, T55 |
| AM-6 | Request-admission time is captured before the request. Freshness evidence counts only when bound to the same child epoch and Start session. | Architecture gate; clause 2 |
| AM-7 | Existing safety precedence is unchanged: read health, then validity, then hard limits (`controller.py:4288-4313`), then the human reading, then protection. Emergency precedence is unchanged. Tracker counter precedence (`human_protection.py:134-144`) is unchanged. | Ratified H2-5; RD-3 |
| AM-8 | The AUTOMATIC mirror, the parser, `get_roast_state`, `read_telemetry`, `RoastSessionState` and `RoasterDeviceState` are unchanged. | Owner direction; ratified AC-12, T52 |
| AM-9 | Malformed non-temperature metadata keeps its existing failure path, per D-1. | D-1 (ratified with AM-1) |
| AM-10 | AM-1 adds no persistence schema, model field, API field or new `RoastEventKind`. | Lead resolution 4; ratified trap list |

## 2. Spec

### 2.1 Base facts at `011c9ec`

**Current human read (`mcp_client.py:546-555`).**
- It makes one `_call("get_roast_state", {})` (`:548`).
- It then validates the **original** payload with the tolerant mirror (`:549`).
- It then checks `type(...) in (int, float)` for both temperatures (`:552-554`). That check admits NaN, ±inf and integers of any size.

**`read_human_evidence` (`mcp_client.py:1547-1554`).**
- It reads the clock before the call (`:1549`). Projection reads the clock again (`:1557`).
- It extracts counters from the **mirror's** `raw_vendor_data` (`:1553`).
- It returns `(None, counters, t)` for unusable temperatures. That tuple cannot be told apart from the ratified "returned None = failure" rule.

**Mirror.**
- `RoasterDeviceState.bean_temp_c` and `env_temp_c` are `float | None` with no default (`:214-215`).
- `raw_vendor_data: dict[str, EventPayloadValue]` is required (`:219`).
- `RoastSessionState.device_state` is required and nullable (`:326`).

So a missing temperature key or a missing `device_state` key raises `ValidationError` today, while `"196"` and `True` are coerced (`tests/test_mcp_fixed_zero.py:758-759`).

**Projection.** `project_session_state` returns `None` when no usable pair exists (`mcp_client.py:1220-1234`).

**RD-3 (`safety.py:334-342`).** For HUMAN authority and a charged run, a missing reading maps to UNPROVEN and a stale one to STALE, both through `evaluate_human_reading`. That gives RECOVERY with no actuator adjustment (`:430-435`). Uncharged active phases keep FAULT (`:343-365`).

**Tracker (`human_protection.py:134-167`).**
- ABSENT counters give UNPROVEN and clear history. This is checked first.
- INVALID counters, an invalid temperature or a non-finite admission time give INVALID and clear history.
- `_is_finite_temperature` accepts any exact `int` (`:82-84`).

### 2.2 Envelope (replaces the ratified `read_human_evidence` tuple)

The envelope is pure, assigned to `src/roastpilot_agent/human_protection.py`. It imports only `models.RoastTelemetry` (M6), plus the existing `RoastPhase` import. No infrastructure SDK types or new pydantic models are introduced. The existing application telemetry model is retained as the projection type.

```python
HUMAN_EXACT_INT_LIMIT = 2**53            # float-representability bound, not a temperature limit

class RawTemperature(Enum):              # plain Enum
    VALID = "valid"
    ABSENT = "absent"                    # key missing, value null, or no device object
    INVALID = "invalid"                  # wrong type (incl. bool), non-finite float,
                                         # or exact int with abs(v) > 2**53

def classify_raw_temperature(value: object) -> RawTemperature: ...

@dataclass(frozen=True)
class HumanReadEvidence:
    telemetry: RoastTelemetry | None
    device_object: bool
    bean: RawTemperature
    env: RawTemperature
    bean_temp_c: int | float | None      # the exact raw object, iff bean is VALID
    env_temp_c: int | float | None       # the exact raw object, iff env is VALID
    counters: CounterEvidence
    request_admitted_at: float
    bound_child_epoch: int | None        # None means unbound; there is no separate binding enum
```

**`classify_raw_temperature`.**
- `None` → ABSENT. The caller passes `device.get(key)`, so a missing key and an explicit null are both ABSENT.
- `type(v) is int` and `-(2**53) <= v <= 2**53` → VALID.
- `type(v) is float` and `math.isfinite(v)` → VALID.
- Anything else → INVALID: bool, str, list, dict, NaN, ±inf, or an out-of-bound int.

This is a representability rule: every such int converts to float exactly, so mirror validation and projection cannot fail or diverge from the raw value. The same precedent bound exists at `mcp_client.py:155` and `:170`. No physical threshold is introduced.

**Vocabulary.** The vocabulary is deliberately minimal. A per-reading status is derivable (`telemetry is not None`). Binding is the nullable epoch. Missing and null are not distinguished, because no consumer needs that distinction; tests still exercise both separately. ABSENT and INVALID stay distinct because AC-12 requires that absent measurements remain absent and invalid ones are never treated as valid.

**Invariants.** `__post_init__` enforces these and raises `ValueError` on any violation.

| # | Invariant |
|---|---|
| I1 | `type(device_object) is bool`. `bean` and `env` are `RawTemperature` members. `counters` is a `CounterEvidence`. |
| I2 | For each temperature: the value is `None` exactly when the class is not VALID. A VALID value satisfies `classify_raw_temperature(value) is VALID`. |
| I3 | If `device_object` is false, then `bean` and `env` are ABSENT and `counters.class_` is ABSENT. |
| I4 | `telemetry is not None` exactly when both classes are VALID. When present, `telemetry.bean_temp_c == float(bean_temp_c)` and `telemetry.env_temp_c == float(env_temp_c)`. |
| I5 | `bound_child_epoch` is `None` or `type(...) is int`. Bool is rejected. |
| I6 | `request_admitted_at` is an exact `int` or `float`, not bool. Finiteness is decided by the tracker (`:142`), not here. |

**Failure direction of an invariant violation.** A violation is a programming error. The `ValueError` propagates as a read failure (counted, FAULT), which is fail-closed. Tests prove that the adapter never constructs a violating envelope across the full matrix.

**A genuine failure produces no envelope.**

### 2.3 Classification grammar and boundary decision D-1

Everything happens inside `RoasterMCPClient._read_human_state` / `RoasterControlAdapter.read_human_evidence` (`mcp_client.py:546-555`, `:1547-1554`). The ordered steps:

1. `request_admitted_at = clock()`. This is clock read #1.
2. `epoch_before`: if `self._fixed_zero_transport` is set, read `child_epoch` (`mcp_client.py:2568-2576`); otherwise `None`. Also capture `started_session = self._started_session_id` (declared `:1325`) and `started_epoch = self._started_child_epoch` (declared `:1322`, cleared `:1364`; Start-epoch semantics pinned by `tests/test_mcp_fixed_zero.py:884-914`).
3. Make **exactly one** `_call("get_roast_state", {})`. No other call happens on any path.
4. **D-1 scope test.** Only when `_json_object(payload)` is a dict, **and** its `device_state` key is absent, `None`, or itself a dict (exact `dict` predicate, M3), is temperature neutralisation applied. Otherwise, validate the **original** payload with the unchanged `RoastSessionState`; any exception propagates exactly as `get_roast_state` would raise it.
5. **Classification** (only inside D-1 scope):
   - `device_object = type(device_state) is dict`.
   - If `device_object`, `bean = classify_raw_temperature(device.get("bean_temp_c"))`, and the same for env. Otherwise both are ABSENT.
6. **Neutralise a copy only.** Shallow-copy the top level and the device object. Never mutate the transport payload.
   - A missing `device_state` key becomes `None` in the copy.
   - In a device object, each non-VALID temperature becomes `None`.
   - No other key is touched.
   - Validate the copy once with the unchanged `RoastSessionState`. Any `ValidationError` from another field propagates (D-1).
   - There is exactly one `model_validate` call per read, applied to either the copy or the original.
7. **Counters.** If `device_object`, call `extract_accepted_counters(device["raw_vendor_data"])` on the **raw** device object's value. Mirror validation has already proven that value is a dict. Otherwise call `extract_accepted_counters(None)`, which gives ABSENT.
8. **Projection.** Call `_project_telemetry(state)` unchanged (`mcp_client.py:1556-1567`). This is clock read #2. It updates `_last_elapsed`, `_last_change_monotonic` and `_last_state` for every envelope, usable or not. Keep the telemetry only when both classes are VALID; otherwise set it to `None`.
9. **Binding.** `bound_child_epoch = epoch_before` iff all of these hold; otherwise `None`:
   - `epoch_before` is an int;
   - `epoch_before == started_epoch`;
   - re-reading `child_epoch` after the await equals `epoch_before`;
   - `started_session` is a str;
   - `state.session_id == started_session`.

   Binding gates **freshness evidence only**. An unbound usable reading still reaches the existing validity and hard-limit rules.

**Clock reads and timestamps.**

| Path | Clock reads | Freshness time |
|---|---|---|
| Envelope | exactly `[admission, projection]` (as `tests/test_mcp_fixed_zero.py:791`) | `request_admitted_at` |
| Exception | exactly `[admission]` | none |

The projection clock feeds only the existing session-clock age. Same-child ordering of admissions is enforced by the tracker (`human_protection.py:150-156`).

**Exceptions.** Any exception from the call or from mirror validation propagates unchanged, including `CancelledError`. No envelope is produced. `_last_state` is not updated.

**D-1 (the boundary the owner ratifies with AM-1).** Temperature evidence means two things only: the two BT/ET leaves, and the absence or nullness of the device container.

| Outcome | Inputs |
|---|---|
| **Envelope**, a successful read | Valid pair; each BT/ET missing, null, wrong-typed, non-finite or out-of-bound **separately**; device container absent or null; malformed counter **values** inside a dict `raw_vendor_data` (counters INVALID or ABSENT). |
| **Existing failure path** (exception → counter → `evaluate_mcp_failure` → FAULT, consistent with RD-3's "read failures keep FAULT") | Non-object top level; non-object device container (str, number, bool, list); any other field that fails the unchanged mirror (`session_id`, `phase`, heat/fan/cooling, `connected`, `driver`, a non-dict `raw_vendor_data` or a non-scalar entry in it, `t0_status`, `ambient_status`, events, …). |

- **Why this boundary.** It is a single consistent rule: container shape is metadata, so no field gains a new coercion, and it preserves base behaviour outside the approved temperature direction.
- **Clause 8.** Its diagnostic-only relaxation (malformed diagnostic metadata must not invalidate valid control telemetry) is **not** added here. It remains C's under AC-9 and needs its own contract.
- **The alternative.** Treating a non-object device container as a successful-unusable read would be a one-row change (TA6 → TA5). It is not adopted, because it would make container-level and field-level device malformation inconsistent.

### 2.4 S2 deliverables (paths inside M5 plus the assigned test file)

- `human_protection.py`: `HUMAN_EXACT_INT_LIMIT`, `RawTemperature`, `classify_raw_temperature` and `HumanReadEvidence`. Existing S1 symbols are unchanged.
- `mcp_client.py`:
  - `_read_human_state` returns a private, SDK-free internal result.
  - `read_human_evidence() -> HumanReadEvidence`.
  - `exact_temperatures` is removed.
  - No change to `get_roast_state`, `read_telemetry`, `project_session_state` or any mirror.
- Tests: `tests/test_mcp_fixed_zero.py` (adapter matrix; rewrite `:748-797` for the envelope) and `tests/test_human_protection.py` (classifier, invariants, plain-Enum).
- No change to `controller.py`, `StateReader`, `tests/conftest.py` or fakes for AM-1 (M4).

### 2.5 S3 consumption obligations (amend ratified H2-2 to H2-7, H4 and T56; S3 re-verifies every citation at its own base)

1. **H2-2.** The single read is `read_human_evidence()`, returning `HumanReadEvidence`. S3 adds it through a HUMAN-only protocol. It does not change `StateReader.read_telemetry` (`controller.py:427-432`). S3 owns any HUMAN fake support (M4).
2. **H2-3 (replaces "raised or returned `None`").**

   | Read result | Counter outside terminal latch | Counter inside terminal latch | Tracker | Routing |
   |---|---|---|---|---|
   | Raised `Exception` | +1 (as `controller.py:4279-4281`) | bypassed: neither incremented nor reset | `record_read_failure()` | `read_failed=True` → `evaluate_mcp_failure` |
   | `CancelledError` | untouched (existing) | untouched | `record_read_failure()`, synchronously | re-raised |
   | Any envelope | reset to 0 (as `:4282`) | bypassed | see item 3 | `read_failed=False` |

   Latch bypass follows ratified H2-3 and the ratified-base citation `controller.py:4617-4623`. Cancellation breaks only the new run-local tracker continuity.
3. **H2-4 (tracker).**
   - If `bound_child_epoch` is an int: `observe(child_epoch=bound_child_epoch, counters=…, bean_temp_c=ev.bean_temp_c, env_temp_c=ev.env_temp_c, request_admitted_at=…)`. Raw values go in; `None` yields INVALID. No pre-filtering, so tracker precedence stays as at `human_protection.py:134-144`: ABSENT counters → UNPROVEN first, then INVALID.
   - If unbound: `record_read_failure()` as a continuity break only, with no counter change.
4. **H2-5 (safety order).** One turn, no reordering:

   | Step | Rule | Outcome |
   |---|---|---|
   | (a) | `read_failed` | FAULT path, done |
   | (b) | `evaluate_telemetry_validity(authority=HUMAN, charged=<effective>)` with `telemetry_age_seconds=None` when telemetry is `None` | charged → RECOVERY (`safety.py:334-338`); uncharged active → existing FAULT (`:343-353`); a non-ALLOW result or `None` telemetry returns here |
   | (c) | existing `evaluate_telemetry` hard limits | EMERGENCY_STOP or FAULT take precedence over (d) and (e) |
   | (d) | `evaluate_human_reading(freshness=<tracker>)` | non-FRESH and charged → RECOVERY |
   | (e) | protection eligibility using `ev.bean_temp_c` (the raw exact value) | — |

   - No BT-only partial hard-limit check is added.
   - Verdict severity remains `_TERMINAL_VERDICT_SEVERITY` (`controller.py:420-424`).
5. **H2-6 (same-tick charge).** Same-tick charge consumes `ev.telemetry` exactly as phase rules consume telemetry. `None` gives no charge evidence this turn. Charge is never inferred from absent or invalid data.
6. **H2-8 (RECOVERY).** RECOVERY follows ratified H2-8 and RD-1. A successful-unusable read never reaches `_apply_fail_safe` `set_targets` in HUMAN mode.
7. **H4 and the latched path.** Both consume the same envelope. There are zero further reads.
8. **Persistence (AM-10).**
   - Classification may appear only in existing records, for example the persisted `SafetyEvaluation`, whose reason already carries `freshness.value` (`safety.py:435`).
   - No store, model, API or event-kind addition. Raw untrusted values are never persisted or logged.
   - `last_state` is the neutralised mirror, never the wire. That is existing mirror semantics; the base mirror already coerces.
   - If ratified AC-12 BT/ET validity recording cannot be met through existing mechanisms, S3 stops and returns `ESCALATE` for a further contract gate. It does not invent storage.
9. **AUTOMATIC is unchanged.** `_read_telemetry` and `_evaluate_safety` (`controller.py:4274-4313`) are unchanged, as are emergency paths, RD-1, the endpoint latch and the lifecycle gate.

## 3. Test list

All tests are hardware-free: fakes, an injected clock and the in-test stdio peer. No E12 story is needed, and no hardware claim follows. Each guard below names the mutation that must fail its test.

### S2 tests (`tests/test_mcp_fixed_zero.py`, `tests/test_human_protection.py`)

| Guard | AM | Test | Removing or inverting the guard must fail the test by |
|---|---|---|---|
| GA1 single call | 5 | TA1: exactly `[("get_roast_state", {})]` across every envelope row and every exception row | adding a revalidation or retry call |
| GA2 admission before await | 6 | TA2: envelope clocks are `[admit, project]` and the exception clock is `[admit]`; `request_admitted_at == admit` | capturing the time after the await, or adding a clock read |
| GA3 raw classification before mirror | 4 | TA3: BT and ET **separately**, each with `"196"`, `True`, `False`, `[]`, `{}`, NaN, +inf, −inf, a missing key and `null`. Each gives its exact class (INVALID or ABSENT), `telemetry None`, no exception, and the other temperature still VALID. | classifying from the mirror (fails `"196"`/`True`); folding missing into an exception |
| GA4 exact provenance | 4 | TA4: `196` is VALID and `type is int`; `196.0` is VALID float; both usable, with `telemetry.bean_temp_c == 196.0` | any `float()` conversion of the raw value |
| GA5 representability | 4 | TA5a: `2**53` and `-(2**53)` VALID; `2**53+1`, `-(2**53)-1` and `10**400` INVALID; each gives an envelope (no `OverflowError`/`ValidationError`), and the I4 equality holds | dropping the bound (`10**400` raises; `2**53+1` fails the required raw INVALID classification (float equality alone cannot prove exact integer representability)) |
| GA6 device absent or null | 1 | TA5b: `device_state` key missing, or `null`, gives `device_object False`, both ABSENT, counters ABSENT, no exception | removing missing-key neutralisation (`ValidationError`) |
| GA7 D-1 failure boundary | 9 | TA6: top level is a list, str or `None`; `device_state` is a str, int, bool or list; `session_id` missing; unknown `phase`; non-dict `raw_vendor_data`; non-scalar vendor entry; non-numeric string `heat_level_percent="not-an-integer"`; malformed temperature **plus** malformed `phase`. Each raises the same exception type as `RoastSessionState.model_validate(original)`, produces no envelope, and leaves `last_state` unchanged. | wrapping any of these into an envelope |
| GA8 no payload mutation | 8 | TA7: payload deep-equal before and after, for every envelope row | in-place neutralisation |
| GA9 raw counter source | 4 | TA8: an identity spy shows `extract_accepted_counters` receives the raw `raw_vendor_data` object; a `"23"` status count is INVALID | passing the mirror dict |
| GA10 binding | 6 | TA9: plain-client adapter, no Start, session-id mismatch, Start epoch ≠ current, child replaced during the suspended read. Each gives `bound_child_epoch None`, while valid telemetry is still projected. Bound case gives the int epoch. | dropping the post-await recheck, the session comparison, or the Start-epoch comparison |
| GA11 genuine failures propagate | 3 | TA10: `MCPToolTimeoutError`, `MCPConnectionError`, `MCPToolError`, `TimeoutError`, `RuntimeError` and `CancelledError` propagate unchanged; no envelope; `last_state` unchanged | catching any of them into an envelope |
| GA12 adapter-state parity | 8 | TA11: `_last_elapsed`, `_last_change_monotonic` and `_last_state` update identically for usable and unusable envelopes | skipping projection when unusable |
| GA13 AUTOMATIC parity | 8 | TA12: `get_roast_state` and `read_telemetry` unchanged on every fixture. `"196"` still coerces on `read_telemetry`. The existing legacy test (`:800-827`) stays green. | routing AUTOMATIC through neutralisation or extraction |
| GA14 envelope invariants | 1 | TA13: each of I1–I6 violated in isolation raises `ValueError`. The full adapter matrix never trips one. | removing any invariant check |
| GA15 plain Enum | — | T15 extended to `RawTemperature` and `ToolDiscovery` | `StrEnum` |

### S2 repair items already authorized within the original contract

| Item | Status at `011c9ec` |
|---|---|
| Separate raw BT/ET cases | Specified as TA3/TA5 above |
| Start-suspension replacement | Present (`tests/test_mcp_fixed_zero.py:884-914`) |
| Replay `NOT_ATTEMPTED` | Present (`:1006-1012`) |
| Live composition wiring | Present (`:1015-1044`) |
| Unknown-completion commanded-state rejection | Present (`:959-968`) |
| Overlapping-discovery reservation | Present (`:917-943`) |
| Discovery negatives: wrong property `type`, missing `minLength`/`maxLength`, non-object property schema, each single missing property | **Still to add** |
| Causal controls: discovery and epoch preconditions, post-call epoch recheck, discovery reset on replacement, reservation before the discovery await, pre-await Start epoch capture, admission-timestamp ordering, exactly one human read, raw temperature-type preservation, composition wiring | Preserve the existing nine valid mandatory repair receipts separately from the original 42. After implementation, map changed guards to these receipts and add controls for new/changed guards only; do not rerun unchanged controls solely for presentation. The optional INVALID plus three unrun remains unchanged. |

Causal-control execution policy:
- Each control must fail its designated behavioural assertion.
- Stop on the first invalid witness and preserve it.
- Restore by `cp` and verify hashes.
- Do not rerun the original 42 controls.

### S3 tests (`tests/test_controller_human_mode.py`, `tests/test_runner_human_turn.py`)

| Guard | AM | Test | Removing or inverting the guard must fail the test by |
|---|---|---|---|
| GB1 unusable is not failure (amends T56) | 1–3 | TB1: unusable envelope resets the counter outside the latch, `read_failed False`; charged gives RECOVERY `human_reading_invalid`; uncharged active gives FAULT `missing_telemetry`. An exception counts once outside the latch and is bypassed inside it. | mapping an envelope to `read_failed` |
| GB2 cancellation | 3 | TB2: counter unchanged, tracker cleared, error re-raised | incrementing the counter, or skipping the clear |
| GB3 no renewal or authorization | 2 | TB3: unusable reads with rising counters stay non-FRESH; zero heat, fan or drop | feeding mirror values, or skipping `observe` |
| GB4 precedence | 7 | TB4: usable bound reading above the hard limit with stalled counters gives EMERGENCY_STOP; a stale session clock while charged gives RECOVERY before hard limits (existing order) | evaluating (d) before (c), or (c) before (b) |
| GB5 counter precedence | 7 | TB5: ABSENT counters with invalid BT give UNPROVEN; INVALID counters give INVALID; both clear history | pre-filtering, or reordering tracker branches |
| GB6 unbound | 6 | TB6: successful unbound envelope resets the counter outside the terminal latch, bypasses it inside the latch, clears history without an additional counter change, and still evaluates telemetry against hard limits; the next bound read must re-baseline | incrementing the counter or failing to reset it outside the latch, or calling `observe` with a stale epoch |
| GB7 raw value to eligibility | 4 | TB7: int `196` eligible when other conjuncts hold; `"196"`, `True` and out-of-bound ints never eligible | using `telemetry.bean_temp_c` or a coerced value |
| GB8 one read | 5 | T55 extended across every envelope class, the exception path and the latched path | any re-read |
| GB9 no raw persistence | 10 | TB9: persisted rows contain no raw invalid value string; no new event kind | persisting raw values |

## 4. Class sweep (run in `{IMPL_WORKTREE}`; base set at `011c9ec`)

| Command | Base | After |
|---|---|---|
| `rg -n 'exact_temperatures' src/roastpilot_agent` | `mcp_client.py` 552, 553 (comprehension), 555, 1550, 1554 | 0 |
| `rg -n -e '_read_human_state' -e 'read_human_evidence' src tests` | `mcp_client.py` 546, 1547, 1550; `tests/test_mcp_fixed_zero.py:789` (per M4, no other) | **S2:** those definitions plus classified new test hits. **S3:** plus exactly one controller call site, its protocol and HUMAN fakes |
| `rg -n 'model_validate' src/roastpilot_agent/mcp_client.py` | record the full set | exactly one `RoastSessionState` validation inside `_read_human_state` (base `:549`); delta 0 elsewhere |
| `rg -n -e '2\*\*53' -e 'HUMAN_EXACT_INT_LIMIT' src/roastpilot_agent` | `mcp_client.py:155`, `:170` | plus the `human_protection.py` constant and its single use |
| `rg -n 'StrEnum' src/roastpilot_agent/human_protection.py` | 0 | 0 |
| `rg -n -e '_consecutive_read_failures' src/roastpilot_agent/controller.py` | includes 4280, 4282, 4297; record the rest | **S2:** unchanged. **S3:** a new HUMAN increment only on a raised `Exception` |
| `rg -n 'record_read_failure' src/roastpilot_agent` | definition `human_protection.py:165`; record any other | **S3:** only for exception, cancellation or unbound |

The ratified S-5 and S-7 sweeps are kept. The S3 diff must add no field to store, model or API schemas, and no `RoastEventKind`, as a result of AM-1. Classify any change to those files against ratified §2.4.

## 5. PR plan

The four-PR plan is retained unchanged: S1 domain/safety → S2 strict MCP consumer → S3 controller/lifecycle → S4 safety-relevant UI.

- **S2.** AM-1 adds roughly 60–100 logic lines in `human_protection.py` and `mcp_client.py`. Re-estimate at handback. The envelope and its classifier form a single review unit, so S2 is not split. If S2 exceeds about 420 logic lines, the PR body states that rationale.
- **S3.** S3 consumes §2.5 and re-validates its citations off updated `main`.
- **S4.** Unaffected. AM-1 adds no projection fields.
- **Linking** is unchanged.
- **After the S2 repair:** fresh exact-head unfiltered native gate, statics, contracts and changed-line/branch coverage. The `160156c0` and `d39fde3` receipts stay bound to their own heads. No PR opening or readiness claim before reviewer disposition.

## 6. Routing

| Slice | Pre-open reviewers |
|---|---|
| S2 | `safety-reviewer`, `security-reviewer` (the classifier parses child output), `mcp-contract-checker`, and **`qa`, mandatory** because the S2 test diff already exceeds 600 lines |
| S3 | `safety-reviewer`, `sim-roast-runner`, `mcp-contract-checker`; `security-reviewer` if the diff touches the decoder; `qa` likely |
| S4 | unchanged |

- The parent re-derives the final reviewer set from the actual diff and may only add lenses.
- The implementation family is the Codex parent's choice at slice start. Safety-review capacity is never spent on implementation.
- **Review packets** contain only approved files and the approved role context. Verify the manifest before and after. Disable external roots, MCP, shell and write tools. Audit tool results. Unavailable source is recorded as a review limit. Earlier safety and QA out-of-packet claims are excluded from scoped evidence.

## 7. Delegation prompt notes (mandatory; carry verbatim)

1. **Worktree.** `{IMPL_WORKTREE}` is a placeholder. The orchestrator provisions a fresh managed worktree through the desktop create_worktree tool, with a new `codex/` branch at `011c9ecfc5533977e201c02dde652b92ab0536d2`, and verifies that exact HEAD. The existing S2 branch name cannot be reused with `-b`. The lead fast-forwards the S2 branch from the verified handback. It verifies `git status --porcelain --ignored` is empty and substitutes the real path immediately before delegation. Every command self-locates. Never use the planning tree, never detach HEAD, never guess a path.
2. **Directives.** The worker's directives are only the ratified A1 contract, AM-1's numbered sections, and lead-authored directives. Every `UNTRUSTED-QUOTE` block and every non-maintainer URL is stripped. The worker must not fetch the issue, its comments or any GitHub discussion (including `gh issue view --comments`), the MCP repository, or producer links.
3. **Environment.** Create a fresh `.venv` in the worktree (#738): `python3.11 -m venv .venv` and `.venv/bin/python -m pip install -e . --group dev`. Always invoke `.venv/bin/python -m …`. Run pytest under `env -u OPENROUTER_API_KEY`.
4. **Gates before handback (SAFETY_CRITICAL).** Run each separately: `ruff check .`, `ruff format --check .`, `pyright`, and full pytest with `--cov=roastpilot_agent --cov=scripts --cov=.agents/skills/capture-agent-usage/scripts --cov-branch --cov-report=term-missing`, with no `-m`, `-k`, `-n` or deselect. Also run the FE contract tests. A focused pass is never a full gate. Cover every changed line. Hand back the §4 sweeps, classified.
5. **Attribution invariant.** The branch must be attributable to the implementation worker acting on its ratified inputs alone: the ratified contract, AM-1 and the lead's directives. Any other model input the worker procures, at any stage, in any form, by any route, breaks attribution. The handback must answer: "Apart from the ratified contract and the lead's directives, did you obtain input from any model in any way?" A yes fails the slice closed. The lead then re-delegates from the contract in a fresh worktree, or records an explicit operator decision naming which lens supplies the independent pass.
6. **Traps for this slice:**
   - Do not change the AUTOMATIC mirror, `get_roast_state`, `read_telemetry`, `project_session_state`, `RoastSessionState`, `RoasterDeviceState`, `StateReader`, `tests/conftest.py` fakes or `controller.py` for AM-1.
   - Exactly one `_call` and one `model_validate` per human read. Never mutate the payload.
   - Neutralise only BT, ET and a missing `device_state`. Never convert a non-VALID value to a number.
   - The `2**53` bound is representability only. Add no temperature threshold.
   - D-1: a non-object `device_state` and every other non-temperature failure propagate unchanged.
   - Plain `Enum` only. Celsius only.
   - Do not touch retries, `COMMAND_PHASE_MATRIX`, dependencies (the `coffee-roaster-mcp==0.2.4` pin stays), `cold_characterisation/*`, or any HUMAN enablement surface.
   - Causal controls: stop on the first invalid witness, restore by `cp` with hash verification, and do not rerun the original 42.
   - The optional scorer stays INVALID with 3 controls unrun. Do not rescore or relabel it.
   - If any §0 M1–M6 fact does not match the worktree, stop and return `ESCALATE`.
7. **Fixtures.** Rewrite `tests/test_mcp_fixed_zero.py:748-797` for the envelope. There are no MCP or FE fixture changes.

## 8. Risk profile

**Blast radius.** This is the human-mode read-evidence boundary feeding protective drop, RECOVERY and containment. Failure modes:
- unusable data counted as transport failure, giving FAULT where RD-3 requires RECOVERY;
- unusable data renewing freshness;
- coerced `"196"`, `True` or huge ints reaching eligibility;
- a hidden re-read;
- reordered precedence;
- a programming-error `ValueError` misreported.

Mitigations: HUMAN mode stays unreachable (AC-NA), and AUTOMATIC parity is pinned (GA13). Data sensitivity is low. There is no new endpoint, credential or schema.

**Break these first:**
1. A temperature `ValidationError` or `OverflowError` escaping as a failure.
2. A non-temperature failure swallowed into an envelope.
3. Classification run after coercion.
4. Payload mutation.
5. The epoch or session read only after the await.
6. A counter increment or reset on the wrong branch, including on cancellation.
7. The human-reading check moved ahead of validity or hard limits.
8. Counters taken from the mirror.
9. An invariant reachable by valid adapter input.
10. Raw values persisted or logged.

**Residual risks (not claims):**
- Malformed non-temperature metadata, including diagnostic-only fields such as `ambient_status`, still produces FAULT on the human path, as at base. Clause-8 relaxation is C's.
- `ValidationError` text may echo wire values, as at base; this is a security-review target.
- AUTOMATIC still coerces `"196"` and bools.
- There is no BT-only hard-limit check for a partial pair.
- A stale session clock while charged yields RECOVERY ahead of hard limits (existing order).
- No full gate exists at `011c9ec` or at any later head yet.

**Before posting AM-1:** the lead runs a mechanical secret scan, binds AM-1's SHA-256 beside `66a9f263…386f`, recomputes the watermark, and adds the provenance marker only after owner ratification.