# Proposed narrow TG10-D test correction — ready for exact ratification

AM-6 stays ratified at bd804bdb6fc94a498e409df6895bd6f01a7a608707a64004334129f32062907f. Only §3 GH8/TG10-D is proposed for replacement; no production behavior, route, safety boundary, result schema or other acceptance row changes.

Confirmed source premise at base da3a9a58d321bba07d9625c15b0eb6b6ca63af70: successful direct _execute_emergency_stop while already FAULTED emits neither COMMAND_EXECUTED nor COMMAND_FAILED. _record_dispatch_command therefore returns before store.record_command. The ratified TG10-D success-plus-record_command-exception expectation is unreachable. A direct write failure does emit COMMAND_FAILED and arms the retry, providing the genuine store-failure path.

Proposed replacement TG10-D has two hardware-free rows, both per-run, finalising, capability doubt (D-28), existing default fake:

- TG10-D-success: successful direct emergency on an already FAULTED runner. Assert accepted with the existing controller-priority reason, exactly one direct emergency attempt, zero exact-executor writes, record_command invoked zero times for this request, retry flag False, phase FAULTED. A raising spy on record_command must not be reached. Preserve the existing operator-action persistence behavior. No synthetic command event may be injected.
- TG10-D-failed-write-audit: make the direct actuator emergency attempt raise; assert exactly one direct attempt, zero exact-executor writes, the controller emits COMMAND_FAILED and arms the existing typed emergency retry. Make the actual store.record_command called from _record_dispatch_command raise a distinguished audit exception. Assert that audit exception propagates from submit_operator_action, the audit write was attempted once with status failed and tool EMERGENCY_STOP, retry flag stays True, and phase stays FAULTED. No successful HTTP result is fabricated and no retry tick is executed as part of this observation. No synthetic event is injected.

Both rows use existing dispatch behavior unchanged. The failure receipt from the impossible original expectation remains failed evidence. Required test cleanup still releases holds and settles owned tasks, with cleanup failure INVALID. Structural call-count pins are labeled as such. The actual propagation row requires a behavioral control: swallowing the record_command exception must fail its sentinel-exception assertion. Neither row claims the ordinary unbound adapter works against a stopped real producer; this is a D-28 parity fake test. Real producer-backed priority rows remain unchanged.

Owner exact ratification of this narrow row correction is required before delegated test changes to this row. Unaffected AM-6 implementation continues. Parent is not authoring implementation.

## Incorporated independent QA corrections

These requirements refine both replacement rows above and are part of the exact correction:

1. Failed-write row: assert the emergency retry flag is False before the request and True afterwards. This proves arming rather than merely retaining a pre-existing True value.
2. Failed-write row: assert zero record_operator_action calls for this request and no OperatorActionResult returned.
3. Failed-write row: the propagated exception must be the exact sentinel audit instance (`is`); the distinct actuator exception must not propagate.
4. Both rows: count only record_command calls with tool EMERGENCY_STOP and source operator, scoped to this request.
5. Both rows: no concurrent tick or event flush may run between the runner's before-event capture and _record_dispatch_command. If either occurs, the witness is INVALID.
6. Success row: record the pre-request retry flag. False after the request is a state pin unless the pre-request flag was True; do not claim causal retry clearing without that precondition.

Independent QA states the correction would PASS with these six additions; all six are incorporated above. Its report and parent confinement audit are preserved in `/private/tmp/a1-s3-am6-tg10d-review/`. The parent also verified the helper bodies absent from the review packet at immutable da3a9a5: controller._run_emergency_write (:2769), _adopt_applied_state (:5353), _release_emergency_stop_transition_gate_if_safe (:2602), StoreSnapshotSink.persist_evaluation (api.py:907), and the inherited FakeMCPClient.emergency_stop (tests/conftest.py:229). None adds a command-outcome event. The inaccurate _adopt_applied_state docstring does not override its executable body.

Preserved failed witness: `/private/tmp/a1-s3-am6-delegation/repair-focused-draft1.log`, node `tests/test_runner_human_turn.py::test_am5_estop_route_during_owned_human_evaluation[TG10D]`. It remains failed evidence, not rescored. The original AM-6 bytes stay immutable; this narrow correction supersedes only TG10-D and its direct row-specific references. All remaining AM-6 obligations and D-23–D-30 remain unchanged.

## Ratification boundary

AGENTS.md reserves changes to the ratified implementation contract to the maintainer. This is a test-only correction to an unreachable expectation, not a production or hardware policy change. Unaffected implementation continues; this row is not delegated until the maintainer ratifies these exact bytes.
