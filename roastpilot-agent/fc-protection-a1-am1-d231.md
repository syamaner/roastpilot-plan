# D231 — Typed human-read evidence for A1

Owner-ratified on 12 November 2026. This records the exact AM-1 contract ratification; it is not implementation completion or live admission.

[The complete immutable AM-1 contract](fc-protection-a1-am1-contract.md) has SHA-256 `360432547cb36bbe8cd8ce63131e047dc28bb1ac4d32f892f36757236f86a41a`. Its historical proposed header is preserved. [The verified OWNER ratification](https://github.com/syamaner/roastpilot-agent/issues/1076#issuecomment-6833383146) establishes authority and reproduces the exact bytes. The original A1 contract, SHA-256 `66a9f2635e0aaace5548c7c768e095c836baa772e46ccf3b24488b56b92e386f`, governs what AM-1 does not replace.

A successful human-mode read with unusable BT/ET returns typed evidence, distinct from a genuine read failure. It cannot renew freshness or authorise normal control. Existing charged-run RECOVERY and genuine failure handling remain. Missing/null device state is unusable successful evidence; non-object device state and other metadata rejected by the existing mirror retain their failure path. Automatic behaviour is unchanged.

S2 owns the evidence type and adapter. S3 owns controller consumption. The four-slice plan remains S1 domain/safety, S2 strict MCP consumer, S3 controller/lifecycle, S4 safety-relevant UI. The implementation binding for this amendment is `011c9ecfc5533977e201c02dde652b92ab0536d2`; later slices refresh their bindings.

Plan PR #102 merged at `93806f4c1049b86b21c3309a5f3cba3982708b98`, adopting the four-slice refinement. Earlier D230 preparation-only/draft wording remains historical; it does not negate the subsequent original and AM-1 owner ratifications. Independent validation, protected delivery, C admission evidence and supervised hardware qualification remain separate requirements. Human FC alone starts development. No recipe-success or hardware-ready claim follows from this record.
