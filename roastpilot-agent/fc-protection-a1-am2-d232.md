# D232 — HUMAN read identity and pending-call ownership for A1

Owner-ratified on 14 November 2026. This records AM-2; it does not establish implementation completion or live admission.

The [complete immutable AM-2 contract](fc-protection-a1-am2-contract.md) has SHA-256 `5cd7ae775efc306d21f4e37452ddd8b11a34ddc5c6f92e03d2d7ac5cba6d3369`. Its proposed header is historical. The [verified OWNER ratification](https://github.com/syamaner/roastpilot-agent/issues/1076#issuecomment-6875804554) establishes authority, including the listed lead corrections and D-2/D-3/D-4. The original contract and AM-1 remain authoritative except where AM-2 replaces them.

S2 computes a pure HUMAN telemetry projection and commits shared adapter state only after constructing evidence bound to an unchanged complete identity snapshot. Unbound readings retain usable raw temperature evidence for existing validity and hard-limit handling, but cannot renew freshness or overwrite current caches. A local generation advances on reset, clears the diagnostic containment cache, and prevents old completions or cancellations from publishing into a newer generation. Same-generation UNKNOWN remains visible; the cache never owns command settlement.

S3 must treat pending HUMAN reads and containment calls as lifecycle ownership. Lifecycle replacement refuses while a call is pending; local completion does not clear remote-unknown command ownership. Cleanup and independently admitted emergency remain available. S3 must resolve unbound raw-state persistence explicitly and must not reuse prior committed state as the new observation.

The S2 binding is `cd92250e2c190e2a116e4d9ef2fe62cd46ca398e`, PR #1084. The four-slice plan remains unchanged. Legacy AUTOMATIC read/projection and late-Start publication are outside this amendment; F-AUTO remains a proposed separate issue, not delegated work. Fresh repaired-head validation and independent reviews are mandatory. No hardware, deployment, live-enablement or release authority is granted.
