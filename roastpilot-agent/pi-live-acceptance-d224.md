# D224 — Conditional progression to supervised Pi live acceptance

This proposal has no effect before explicit maintainer ratification of its exact
PR head and merge. Ratification is recorded in a repository-owner PR comment
naming that head. After merge, verify that both decision files match the ratified
head and record the merge SHA/tree; squash-merge provenance does not substitute
for this file-content check. If either merged file differs from the ratified
head, D224 has no effect and needs a new explicit decision. On ratification
and verified merge, the historical evidence
identified below satisfies the cold-load sequencing prerequisite for the exact
candidate only. No second implicit qualification-reuse approval is required.
Final live acceptance remains a separate human decision.

The independent static safety assessment supports non-materiality only for the
characterised cold workload. This ruling is not a new cold run, new cold
qualification, general hardware-readiness claim, or MCP acceptance. It changes
no production code or cold-admission rule.

This clarifies D183/D191's material-identity clauses and D192's fresh-
characterisation sequencing clause only for this candidate: by ratifying this
record, the maintainer determines that the identified changes are non-material
for the characterised cold-load prerequisite. Those clauses otherwise remain
unchanged. This determination supplies no measured live-runtime headroom.

## Historical evidence and review binding

The reused evidence is the D210/D211 qualification recorded in
`roastpilot-agent`'s `docs/state/registry.md` at merged Agent `a4197814`:
policy 4, interpretation revision 1, `temperature_screened_conformant`, with an
independent Pi evidence review PASS. The original exit-6 `NOT_CONFORMANT` result
is retained alongside that later interpretation, never overwritten.

- Historical private retention-manifest SHA-256:
  `a12c908d9d40241c3c5f476c928bb266cc41744757bc0bcf8a1454c16b17cb3d`.
  Both retained trees and the three supplementary artifacts were reverified
  against existing receipts on 5 November 2026.
- D211 interpretation-assessment output SHA-256, as recorded in the original
  5 October 2026 verification receipt:
  `a96a18edae62a1080ed1d9ff9249a560182b31111bb44180e23b0cce62871451`.
  This identifies the historically verified output; it is not a claim that the
  now-absent temporary assessment file was freshly rehashed.
- Independent static materiality review: authenticated local Claude
  `safety-reviewer`, high effort, 5 November 2026; retained handback SHA-256
  `610a5eb7af0b4a653b47230a2fc83ef2e287cf87328489ff598c0238c115f03b`.
  It supports non-materiality for the characterised cold workload only and
  grants no acceptance or hardware authority.

Agent D220 and D221 references in this record refer specifically to
`roastpilot-agent/plan.md`; existing Cloud decisions with those numbers are
separate historical records.

## Exact artifact and dependency boundary

| Item | Binding |
| --- | --- |
| Intended Agent source | Reviewed candidate `7ed3b787a608bb48a0789d211ef94749b035973a`, tree `4c11333b68df271ed3998af73ba62836f29a9240`; protected delivery pending |
| Intended Agent wheel SHA-256 | `96cdfce574045aaed92fbf3f48d5dd8b9889deb75f58e7d7299f7bcc4758b79c` |
| Intended MCP | Published `coffee-roaster-mcp==0.2.4`, source `e2fab8e910e7bff59d158b612c19e17d33a765c2`, wheel SHA-256 `b11b6764b520bbb7662d4f82841949322222c239a1024d7cc4c74f1875020b70` |
| Preserved dependency file manifest SHA-256 | `703997fa6e0d0950dc5b11fa6e2ea12732f33e1e892b1fc0925439cf18dba576` |
| Qualified historical Agent | Source `fcd457492c300712491e0bcb2ae9dcb4b55535b6`, original wheel SHA-256 `f3313ceef9846770ba00affd8708dc3d74871402b620072a125eef067715900e` |
| Qualified historical MCP | Reviewed source `96f8916407ec8d31bbed9637e824c3cd2b0cf24a`, unreleased 0.2.2 candidate wheel SHA-256 `4f52048efa4c368e785c30acface04356dd943583a251e02a9b635905dec476a` |

The intended wheel was built from reviewed `7ed3b787`, with all 63 Python
payload files verified against that source. Protected Agent delivery remains a
prerequisite; the final merged source must be file-equivalent to tree
`4c11333b68df271ed3998af73ba62836f29a9240`, and its exact merge SHA and
content comparison must be recorded in a verified repository-owner comment on
the D224 Plan PR, naming this exact Plan head, before this proposal is ratified. This
retains the wheel's actual build provenance.

The candidate contains 93 distributions. All recorded qualified versions remain
unchanged except the required MCP 0.2.2 to 0.2.4 replacement; the Agent retains
its development version string but its source and wheel identities change.
The remaining dependency files are exact copies of the retained qualified set.
The Codex delivery session acting for Sertan Yamaner on 5 November 2026
verified 9,867 equal dependency files, 9,814 original installed RECORD hashes,
and 127 package files against the earlier selected Agent/MCP wheels.
That earlier installed-Agent verification does not cover the new wheel; the
new Agent payload and unchanged MCP must be reverified after staging.
`pip check` passed. These are explicit host attestations, not independent
re-hashing by the model reviewer.

The dependency manifest is SHA-256 over canonical JSON mapping relative
site-packages paths to file SHA-256, with sorted keys and compact separators.
It excludes Agent/MCP package and distribution-metadata trees, generated
`__pycache__` and `.pyc` files. Inference dependencies remain ONNX Runtime
1.30.0, NumPy 2.5.3 and SciPy 1.18.1. No resolver run or dependency upgrade is
permitted between qualification reuse, dry preflight and live acceptance.
Any changed dependency bytes or versions invalidate this candidate boundary.

The original receipt-bound wheel is the historical Agent source authority.
The retained venv's old Agent module was not treated as immutable source and
was replaced in the separate candidate. The original wheel's Python payload
matches its declared clean source; the intended wheel matches its declared
source. The historical evidence and original exit-6 outcome remain unchanged.

## Materiality scope and preserved limits

The static Agent comparison covers the 63 Python files extracted from the
actual historical and intended wheels, not a merge-base diff. The MCP
comparison covers git source snapshots (19 Python files plus pyproject); the
0.2.4 wheel-to-source binding is a parent attestation. The appliance template
was confirmed comment-only through a direct git endpoint diff. The bundled SPA
and other non-Python payload were not compared with the historical wheel;
installed-byte reverification must bind them to the intended wheel before use. Its per-file SHA-256 manifests
show 50 of 63 Agent Python files and 14 of 20 MCP source/metadata files
byte-identical. Agent cold engine, policy, MCP observation adapter, evidence
modules, advisor, config and safety are identical, as are MCP audio, detector,
first-crack runtime, config and dependency metadata. The direct comparison
receipt (SHA-256 `5a71448ec1a57673dec4fd8d6e34979d0cf64f3b05032de0cf2681eedd8711eb`) and the current static handback are retained privately.

#1069 adds four total numeric validation calls to the normal typed MCP state
parse on each one-second tick. The strict raw-tree cold evidence projection is
unchanged. The MCP already emitted these keys, so its response payload does not
grow. Normal live persisted telemetry and API/SSE retain those values or null;
these live projection paths are absent from the cold runner. Values, nulls or
zeros alone do not establish that inference ran. Positive processed-window,
capture, session and boundary continuity evidence remain necessary.

The post-seal `two_phase.py` checker now selects D211 revision 1; this does not
change the characterised tick workload or rewrite original outcomes. MCP export
changes are unreachable through the cold tool allowlist, and start-admission
bookkeeping adds fail-closed, constant-size refusals. Recovery and emergency
paths are live-only and were not measured by the cold run.

Unmeasured startup/request costs include 21 rather than 16 migrations on
every fresh run-private cold store, two Agent SQLite store reads per cold
health call versus one (with no MCP call), and the SPA's three-second health
poll. Live health additionally persists process-epoch/clearance rows on its
first call and performs MCP fault readbacks while a fault lease is OPEN.
The SciPy import moves into first per-session detector construction inside
`start_roast_session`; recording-on recorder construction is also inside that
session-start call. The call remains bounded by the unchanged five-second MCP
timeout. Whether it completes within that bound is unmeasured and is decided
only by the supervised idle-reboot measurement.
These are static observations, not timing measurements or a claim of live
controller headroom. Historical browser-polling activity is unknown. The
remaining supervised startup, resource and live gates must still pass.

D191's N=1, X=200 ms and production fatal streak 30 remain locked. D210's
10-minute recording-off plus 10-minute recording-on characterisation and
D211's policy-4 interpretation revision 1 remain unchanged and reproducible.
Published MCP 0.2.4 remains **not cold-admitted**. No version literal, historical
reader, result schema, temperature screen, advisory window or timeout changes.
This ruling closes neither MCP #157 nor #194 and authorises no release.

## Conditions before progression

- Reverify the installed Agent/MCP bytes and preserved dependency manifest on
  the Pi at preflight time. Verify the same frozen model, provider/model/prompt,
  relevant inference configuration, host/OS/kernel/Python, devices, power and cooling
  identity against the qualifying record, with explicit operator attestation
  for physical facts. Accepted identity deltas are limited to the exact Agent
  source/wheel identity and MCP artifact/version in the table, the additive
  current-child `session_presence: none` proof before the first session, and
  recorded executable/output locations on the same physical storage. Existing
  D192/D194 cold/live lifecycle and recording-mode differences remain as already
  defined; capture/inference settings match the qualified recording-on phase.
  These deltas must never be disguised as identical frozen identity. No other
  runtime/configuration difference is authorised. An unlisted or uncertain
  material difference blocks this ruling. Freeze and record the complete live
  configuration as well, including controller, safety, advisor timeouts,
  telemetry interval and recording. Each non-inference difference must be
  explicitly listed here as an existing D194 lifecycle difference or block
  progression; inference-only equality is insufficient.
- The qualified cold advisory context was synthetic `Cold characterisation`,
  with a 195 °C target, not a saved bean recipe. Do not claim the live bean
  profile is historically identical. The operator-selected live recipe is the
  restored Brazil Santos (Natural): 250 g, 195 °C drop, 14% development,
  initial heat 100%, fan 30%, charge guidance 170–200 °C. Its saved input
  SHA-256 is `b8ca3bfa8c4ae536ca36c540e1398c24d0b5484fbf55b3a011ac84dcbb3267d5`,
  computed over the retained original UTF-8 JSON input-file bytes with no
  canonicalisation or whitespace/newline changes. Before import, verify those
  exact bytes; after normal API import, compare every parsed original input
  field with the server profile, excluding only server-generated metadata.
  Freeze and verify that normal server profile before the actuating preflight
  and live run. This is the existing cold-to-normal-live lifecycle distinction,
  not measured equivalence of live advisory context or runtime load.
- **Proposed owner recording-sequence choice:** ratifying this exact record
  selects using the same frozen recording-on configuration for both the empty
  dry preflight and the subsequent live run. Recording/autocapture must match
  the qualified recording-on settings and be identity-verified BEFORE the
  supervised idle reboot and first-session timing measurement. The empty
  preflight produces a labelled preheat-only WAV/sidecars, retained privately;
  it is not a bean roast or live-acceptance recording. The current recording-off
  dry configuration supplies no startup/preflight evidence for the live stack.
  No recording or actuation follows from this proposal: the later bounded
  physical authorisation must explicitly include empty-preheat recording.
  Any configuration change after preflight invalidates that preflight and its
  startup measurement; repeat the frozen-identity verification and authorised
  idle-reboot first-session/dry checks before live GO. No recording-off proof
  carries over to a recording-on stack.
- Measure the first `start_roast_session` after an idle supervised reboot on
  the actual Pi against the unchanged `call_timeout_seconds = 5.0` bound
  enforced by the MCP client. This is the session-call timeout, not the
  separately configured advisor or health-check timeout. The reboot
  occurs only with no active run and the roaster physically stopped. A timeout
  or uncertain startup is a failed preflight; repeated warm starts do not
  replace the cold-start measurement.
- The dry preflight means exactly the supervised checks in this section:
  installed/frozen identity verification, idle-reboot first-session timeout,
  stopped/empty physical confirmation, emergency-stop evidence, restart
  recovery without automatic heat/fan resume, and server-governed clearance
  and closure. The session-creating path is normal Agent Start through the
  server UI/API; it executes the selected profile's preheat heat and fan targets
  on the empty drum. "Dry" means no beans, not no heat or no actuation. The
  bounded operator authorisation must identify that profile and its displayed
  initial heat/fan targets (100% / 30%, matched to the exact saved-input hash
  and verified server profile above), explicitly cover this empty preheat and its
  primary-microphone recording, and the software
  e-stop that ends it, and cover the subsequent restart-recovery checks. Do not
  create a session before that authorisation. Confirm physical heat-off and the software emergency-stop result, including positive
  `driver_safety_method_called` evidence, and restart recovery without automatic
  heat/fan resume. Use only current server-projected recovery/closure actions.
- Every fresh live Agent process requires D213 physical restart clearance.
  D220 missing-record initialization never grants Start. The production
  controller owns the loop and every roaster write passes typed safety policy;
  the LLM returns advisory data only. Operator actions use the server UI/API.
  SSH remains maintenance, diagnosis and read-only evidence access; no ad-hoc
  roast command is issued from an SSH shell.
- A clean dry preflight is followed by a separate immediate operator live GO.
  This decision itself authorises no connection, reboot, actuation, bean charge
  or live run. Before execution, a fresh explicit operator authorisation must
  cover the reboot and each actuating preflight step; one bounded supervised
  dry-preflight authorisation may enumerate and cover those steps together.
  A software emergency stop is real actuation (heat zero, fan 100, cooling on),
  not a read-only check. Physical supervision, abort and emergency response
  remain human authority.

If any condition fails or remains uncertain, progression is blocked. A fresh
D210 qualification on the intended set requires a separately approved versioned
candidate-admission path; the pinned 0.2.2 rules must not be bypassed.

## The 20-minute supervised observation

For this candidate only, this explicitly interprets D191/D192's "at least
20 continuous minutes" live-roast acceptance as one supervised observation
window including preheat and post-cooling idle observation.

The minimum is 1,200 seconds of continuous collector monotonic time, anchored
at the collector's first confirmed snapshot of a successfully started normal
live session after MCP session start. The window contains one complete normal
roast from charge through drop and cooling. Preheat is included. If the normal
roast and cooling finish early, observation continues under supervision with
heat at zero and the same Agent/MCP processes until the minimum is reached.

No profile, preheat, charge timing or development choice is altered to reach
the minimum; extra time accrues only after normal cooling, with heat at zero.
Drop, cooling, abort and emergency stop are never delayed or shortened to meet
the clock. An abort or emergency-stop outcome is retained as a safety outcome
and does not qualify. An Agent/MCP restart, child replacement, unexpected capture
restart or loss of supervision breaks continuity. Record actual collector and
controller sample gaps and all existing fault/overrun evidence; elapsed time
alone is not proof of uninterrupted monitoring. This record adds no numeric
tick-density or collector-gap tolerance, and uncertain continuity is unconfirmed,
not a pass. The operator and an independent read-only evidence reviewer judge
continuity, recording their disposition in the private acceptance report and
its sanitised summary. All attempts, passing or failing, are listed in the
acceptance report. Broken, aborted or completed-but-failing attempts are never
combined or discarded in favour of a later pass. Any failed attempt requires
an explicit human disposition of the failure before retry. Each new
attempt requires a fresh supervised dry-preflight check and immediate live GO;
D213 clearance must be valid for its current Agent process, with new explicit
clearance after any process restart. No earlier-process clearance carries over.

## Predeclared metric intervals

The 1,200-second observation is not 1,200 seconds of audio capture or inference.
For a qualifying attempt, MCP capture begins at session start and stops at
drop; inference is eligible only in the roasting phase while detection remains pending, stopping
at first-crack detection. These production lifecycle rules remain unchanged.
A manual first-crack override stops capture/recording immediately in MCP 0.2.4;
that truncated attempt does not qualify for this acceptance. The operator must
never withhold a needed override or safety action to preserve qualification.
Retain that attempt and its actual capture end, and obtain human disposition
before another acceptance attempt.

- **Capture interval:** session capture start through drop, including preheat
  and post-first-crack recording. Evaluate unchanged D191 maximum consecutive
  audio overflows N=1 and peak trailing-60-second lost audio X=200 ms; production
  fatal streak remains 30. Require no fatal/capture-runtime or microphone error,
  no unexpected capture restart, and a complete primary WAV and sidecars over
  this actual capture interval. Preserve the frozen post-stop counters.
- **Inference-eligible interval:** from the T0 boundary's pending-audio discard
  until first-crack detection stops draining, or drop if detection remains
  pending. Require zero incremental dropped detector windows, zero inference
  overruns, maximum inference duration below the configured seven-second hop,
  and no growing queue during this interval. Retain time-aligned boundary and
  interval observations and evaluate cumulative counters as deltas against the
  opening boundary. A manually marked T0 performs no pending-audio discard;
  its beans-added event must not be substituted for that boundary, so the
  inference evidence is unconfirmed and the attempt cannot qualify. Running
  maxima are not subtracted: retain the maximum inference duration at the
  closing observation. Also require zero inference overruns and a maximum
  duration below the seven-second hop across all actual session inference,
  including any post-drop pending-window processing; a post-drop overrun is a
  failure, not merely a note. Record the preheat and post-detection queue/drop counters
  separately: the intentionally undrained queue outside this interval may fill
  and drop windows while recording continues. They are not inference-overload
  failures inside the eligible interval and are never erased. Any post-drop
  pending-window processing is separately reported, not presented as additional
  live inference time. Missing or ambiguous boundary evidence is unconfirmed,
  never a zero delta. No counter reset, instrumentation change or inferred
  sample is authorised by this record.
- **Full observation window:** collector/controller continuity, physical
  supervision, controller/advisor/safety outcomes and host bounds apply for all
  1,200 seconds. Existing host bounds remain: 80 °C abort/alarm, clean current
  and sticky under-voltage/capping/throttling bits from the validation boot,
  at least 512 MiB MemAvailable, at least 2 GiB free before start and 1 GiB
  throughout. No capture or inference is claimed during cooling or idle.

These are prospective live-lifecycle interval definitions for this candidate,
not retrospective changes to D210/D211's cold evaluation. A failed or uncertain
criterion is not acceptance; no threshold or interval is relaxed from an
observed outcome. Before live GO, verify that the existing read-only evidence
path can retain the necessary boundaries and metrics; an unavailable measure
must be reported as unproven rather than replaced by elapsed time or a source-
only assumption.

Preserve the complete controller/advisor/operator decision trace, requested,
adjusted and actuated commands and safety evaluations, restart/recovery state,
MCP/audio/inference and host metrics, and the complete primary WAV and sidecars.
Private data stays in the established two-copy, checksummed evidence workflow.
Only sanitized findings and a private-manifest hash may enter Git. Final live
acceptance remains the operator's explicit decision; no detector-accuracy,
calibration, general deployment-acoustics or production-readiness claim follows.
