# D235 proposal: S3 global emergency reachability

Owner approved the narrow emergency correction direction and retained cooling lock on 15 November 2026. The corrected AM-5 story-planner contract is being prepared; it is not ratified and no implementation is authorised by this proposal. AM-4 remains immutable.

At Agent `750e8af605fcd387ebfbc0c8f8c599c7a32a464e`, a realistic R1 drop holds S3 evaluation persistence inside the terminal executor. During acknowledgement finalisation, global emergency stop selects that occupied executor and queues without dispatch until storage releases. The per-run direct live-controller path dispatches before release. Earlier direct-hook testing bypassed the executor backlog and did not prove global emergency reachability.

Approved direction: reuse the existing direct live-controller emergency path for the exact current HUMAN runner when outstanding S3 evaluation persistence would block the terminal writer, only while provably before completion persistence or uncertainty. Cover the acknowledgement proof interval and the completion barrier. Preserve synchronous supersession, safety policy, the shared arbiter, shielding, fail-safe behaviour, and existing accepted-versus-confirmed semantics. Do not widen historical, finalised, different-run or AUTOMATIC routing.

Owner explicitly retains cooling refusal while the finalisation reservation waits on storage, including after emergency stop, and accepts that the existing projection may still offer a refused cooling action. This is a software limitation to disclose in readiness, not a hardware-cooling claim. No timeout, cancellation, early release permitting overlapping finalisers or new hardware action is authorised.

Evidence is synthetic and head-bound. The 2,084 focused Python tests, 314 frontend contract tests and statics passed; the integrated full native gate, causal controls and final reviews remain pending. Read-only architecture review recommends the narrow existing-route correction. Formal contract and independent safety review must precede owner ratification and delegated repair. D230/A1 scope otherwise remains unchanged. No Plan-main merge, deployment, live admission or physical GO follows.

## Corrected contract ready for ratification

The [AM-5 contract](fc-protection-a1-am5-contract.md) is prepared at SHA-256 `9bcad75d3a9722ab7b89f2d25507a8ba3a775d39d9d24696d3657284b3aed314`. Independent safety review returned PASS with exact lead corrections, incorporated in these bytes. D-18–D-22 include cancelled-task routing, strict boolean capability, completion-persistence lifetime and the retained cooling lock. All five source-verification questions were closed at `750e8af`; issue watermark was refreshed unchanged. This is proposed contract readiness, not ratification or implementation. No Plan-main merge is authorised.
