# AM-3 TE15 correction for ratification

Proposed, not ratified. This replaces only the GE15/TE15 row in AM-3 SHA-256 `f9057dd9d9b7c99b7f1d6995f5b5d3b8ac9fc3f52e0cb053c0644975a21f0979`. Original A1, AM-1, AM-2 and every other AM-3 clause remain unchanged. No production policy, scope, threshold, adapter or hardware change is authorised.

The existing row asks for successful respawn while UNKNOWN remains. The ratified production rules forbid that. Independent safety review confirms the contradiction and recommends these two cases: UNKNOWN refuses respawn/reopen; known-clear ownership permits them without any ownership mutation.

| Guard | Criterion | Replacement test | Causal witness |
|---|---|---|---|
| GE15 no local settlement | 7 | **TE15a.** HUMAN ownership UNKNOWN. Then, in order: a refused attempt; a B discard; a clean `stop()` with the flag false, reached through E6 (DEVICE_RESPAWN); then the respawn's lifecycle recheck before `:2819`/`:2820`. The respawn is refused: zero `MCPServerProcess.start`, zero resets, zero `start_roast_session`; `reopen_after_respawn` returns false and the fence stays closed. Ownership is still UNKNOWN after each step. Start through the service and the HTTP delegate is still refused. Zero reconnect, respawn or Start is initiated automatically. **TE15b.** Clean ownership (no UNKNOWN, no pending call): a successful respawn and reopen create, settle and clear no ownership; an ownership-mutation spy records zero calls across the reopen step and the ownership value is unchanged. | Clearing UNKNOWN on any TE15a step. Spawning or reopening while ownership is UNKNOWN. Writing ownership in the reopen step (TE15b). |

TE13 remains unchanged. Its E6 case exercises existing-child cleanup followed by refusal before replacement; the normal service Start refuses earlier. No new wait or retry is added. Start's separate metadata-await lifecycle proof remains required and unresolved; this correction does not waive it.

The owner is asked to ratify this exact test-row replacement. It preserves AM3-7/8 and AC-8/11. S3 independent implementation continues while this row waits; it cannot be declared contract-complete until ratified and tested.
