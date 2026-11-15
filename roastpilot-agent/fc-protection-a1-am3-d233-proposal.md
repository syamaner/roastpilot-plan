# D233 — A1 S3 shutdown admission and cooling boundary

Owner-ratified on 15 November 2026. [Verified owner record](https://github.com/syamaner/roastpilot-agent/issues/1076#issuecomment-6894208392). This branch records the decision; it is not yet merged into Plan main. The exact contract bytes are unchanged.

The [corrected AM-3 contract](fc-protection-a1-am3-contract.md) has SHA-256 `f9057dd9d9b7c99b7f1d6995f5b5d3b8ac9fc3f52e0cb053c0644975a21f0979`. The original A1, AM-1 and AM-2 remain authoritative except for its explicit amendments. The original four-slice plan remains unchanged.

The proposed application-owned fence closes before teardown, respawn or child-stop awaits. New HUMAN reads and containment are refused without transport; pending calls retain ownership and classification. A closed fence or unconfirmed teardown blocks guarded HUMAN heat, fan, drop, containment and session start at actual dispatch. Unknown command ownership is never settled by local completion, cleanup, refusal or reopening.

The exact existing emergency heat-off retry stays outside the ordinary HEAT/FAN freshness row and the new conditions. NON_HEAT marks/cooling and fault-control cleanup retain existing policy. HUMAN fault-control drop gets the condition in the existing recovery-drop recheck. The correction adds no new cooling policy, adapter change, API/schema or PendingHumanCall member. AUTOMATIC behaviour remains unchanged.

D-8 selects R: unexpected child failure still permits reads for existing hard-limit and read-failure handling, while the guarded actuation paths are blocked. D-10 selects B-corrected: selective dispatch protection, preserving emergency retry and existing cooling policy. Both selections were ratified explicitly, together with D-5 through D-12 and the lead corrections.

This records software design only. S2 PR #1084 merged at `7bfd027ec5139669362d89b37cfd43215e922dc9`, tree-identical to reviewed `6e0eb5f728a90ddd36d341e4f4558168f7789e13`. It does not validate S3. After ratification, the implementation base, issue watermark and Plan bindings must be refreshed before delegation; full safety-critical validation, independent review and protected delivery remain required. No hardware, live enablement or release approval follows.
