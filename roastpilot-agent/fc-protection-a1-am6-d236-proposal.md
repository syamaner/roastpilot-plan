# D236 — AM-6 approved direction

On 16 November 2026 the owner approved: “Approve the exact-session priority emergency correction for both global and per-run HUMAN finalisation, retaining the cooling lock. Proceed with the corrected contract and keep coordinating with the roast agent.”

AM-5 remains immutable. Its implementation at da3a9a58d321bba07d9625c15b0eb6b6ca63af70 passes the full native gate (16,548 passed; 14 skipped) but a real-stdio mock producer probe confirms unbound emergency rejects inactive fault sessions. Exact-session dispatch reaches the mock driver. This is software admission evidence, not physical confirmation.

Formal AM-6 must preserve AM-5's narrow current HUMAN runner, registration and persistence eligibility and the cooling lock. Use the existing exact-session emergency executor through a priority entry point that avoids the blocked queue, preserves shared-arbiter serialization and safety evaluation, consumes existing admission once, retains cancellation/lifecycle ownership, and returns confirmed/failed software evidence rather than unqualified accepted. Cover both global and per-run finalisation routes. No producer API widening or automatic retry/fallback is approved.

Require independent safety and MCP contract review before exact owner ratification, then delegated implementation and producer-backed integration tests for both proof and persistence-barrier windows. Correct the identified TG2 cooling-on oracle and TG10 real store-failure test gap. Other unbound stopped-fault callers remain explicit readiness prerequisites pending safety disposition.

This is direction approval only. No AM-6 implementation contract is yet ratified, no S3 delivery is complete, and no deployment, hardware or live admission is authorised. This branch is not Plan main.

## Corrected contract ready for exact ratification

The [AM-6 contract](fc-protection-a1-am6-contract.md), including lead corrections and D-23–D-30, has SHA-256 `bd804bdb6fc94a498e409df6895bd6f01a7a608707a64004334129f32062907f`. Independent safety and MCP reviews supplied final wording corrections; the lead mechanically applied their exact replacements and verified source/issue bindings. Contract ratification remains pending. Implementation has not started.

Global replies use confirmed/failed; per-run replies preserve accepted/failed with an exact-session confirmation reason. HTTP responses may still await storage after dispatch/readback. No new producer API, hardware action or live admission is authorised. Other stopped-fault emergency callers remain separate readiness prerequisites.

## Owner ratification — 16 November 2026

The owner explicitly answered “Ratify AM-6 and proceed” for exact SHA-256 `bd804bdb6fc94a498e409df6895bd6f01a7a608707a64004334129f32062907f`, including incorporated lead corrections and D-23–D-30. Verified [OWNER comment 6915711071](https://github.com/syamaner/roastpilot-agent/issues/1076#issuecomment-6915711071) binds the immutable contract at Plan 3b60694, implementation base da3a9a5, and pre-comment issue watermark. Parent reverified posted body hash and the watermark after publication.

The registered Codex repair role is implementing in a pristine same-base isolated clone; own Python/Node22 environment is verified. Full native validation, producer-backed mock tests, causal controls and independent final-head reviews remain mandatory. This is not delivered software or live readiness. Contract file bytes remain unchanged. Plan main remains unchanged.

## TG10-D correction ratified — 16 November 2026

The owner ratified the exact D237 correction SHA-256 `8cd086bc5af68bd687ff4acb354e2c119e90a94b679e570ae91bba1556ad63ae`, recorded in [OWNER comment 6925336254](https://github.com/syamaner/roastpilot-agent/issues/1076#issuecomment-6925336254). Correction and AM-6 contract bytes remain immutable. The repair resumes from test checkpoint f6a98a0 with successful-stop parity and genuine failed-write audit propagation rows. Full native gate, causal controls and final independent reviews are pending. Both intermediate source reviewers found no production defect at 803a12c; production bytes at f6a98a0 are identical. Those reviews are not final delivery approval. No hardware or live admission follows.
