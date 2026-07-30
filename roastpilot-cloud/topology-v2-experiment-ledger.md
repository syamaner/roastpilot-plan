# Topology v2 experiment — metrics ledger (issue #159)

Durable record for the 24-hour spec-first topology experiment (fable planner →
opus implementer, sonnet routine review, Codex review floor). Started 28 Jul
2026 ~16:25Z. The keep / adjust / revert decision at +24h is recorded in
`factory.md`; this file is the evidence it draws on.

**Maintenance protocol.** Update at every PR merge and at the +24h checkpoint.
Metrics come from artifacts (PR timelines, issue comments, the session logs
below), never recollection. **The token logs are LOCAL and ephemeral** — capture
per-delegation tokens into this file at each merge, because the logs can rotate
away and cannot be reconstructed once gone. The method below lets you re-derive
*while the logs still exist*.

---

## How to reconstruct the metrics (run this if a checkpoint was missed)

### Wall-clock (per PR)
```bash
gh pr view <PR> --repo syamaner/roastpilot-cloud --json createdAt,mergedAt
```
`createdAt` is the draft-open time (draft-first per D103); `mergedAt` the merge.

### Review turns, offline vs online
- **Offline / pre-open (local):** count `codex review --base origin/main`
  invocations (session scratchpad logs `codex-review-146-r*.log`), plus
  `factory-security-reviewer` / `qa` / `pr-triage` passes (each is a named
  sub-agent; count its re-invocations).
- **Online / post-open (the Codex connector on the PR):** count bot-authored
  `pull_request_review`s + reactions on the PR:
  ```bash
  gh api repos/syamaner/roastpilot-cloud/pulls/<PR>/reviews --paginate \
    --jq '[.[]|select(.user.login|test("chatgpt-codex-connector"))]|length'
  ```

### Token spend, per delegation and per PR (THE ephemeral one — capture early)
Claude Code session transcripts hold per-turn `usage`. Structure:
- Main loop (orchestrator): `~/.claude/projects/<proj>/<session>.jsonl`
  (all rows `isSidechain:false`).
- Sub-agents: `~/.claude/projects/<proj>/<session>/subagents/agent-a<name>-<hash>.jsonl`,
  **one file per named delegation** (e.g. `agent-aimpl-146-...jsonl`).
- `<proj>` here is `-Users-sertanyamaner-git-roastpilot-cloud`. Find the active
  `<session>` by newest `<session>.jsonl` whose first timestamp matches the
  session start.

Per-delegation totals:
```bash
SUB=~/.claude/projects/-Users-sertanyamaner-git-roastpilot-cloud/<session>/subagents
for f in "$SUB"/agent-a*.jsonl; do
  name=$(basename "$f" .jsonl | sed 's/^agent-a//; s/-[0-9a-f]\{12,\}$//')
  jq -s -r --arg n "$name" '[.[]|select(.message.usage)] as $t
    | "\($n)\t\($t|length)\t\($t|map(.message.usage.output_tokens//0)|add)\t\($t|map(.message.usage.cache_creation_input_tokens//0)|add)\t\($t|map(.message.usage.cache_read_input_tokens//0)|add)"' "$f"
done   # columns: delegation, turns, output, cache_create, cache_read
```
Per-PR = sum the delegation files for that PR. Main loop = same jq on
`<session>.jsonl`. Cost drivers: **output** (priciest/token) and
**cache_creation** (~1.25× input); cache_read is high-volume but ~0.1× input.

### Findings folded, pre-open vs post-open
Read the PR's review threads + the story-issue metric comment; count distinct
findings resolved before the PR opened vs after (the Codex-connector rounds).

---

## Ledger

### PR #165 — issue #146 (claude-review completion evidence)

| Field | Value |
|---|---|
| Path | conventional/interactive; `.github/workflows/**` + AGENTS.md |
| Open → merge | 1h 23m (2026-07-28 18:54:52Z → 20:18:03Z), draft-first |
| Offline review turns | 7× local `codex review` + ~6 `factory-security-reviewer` + ~4 `qa` + ~4 `pr-triage` passes |
| Online review turns | **2** Codex-connector rounds with findings (P1 + 4 P2s) + 1 clean round 3 |
| Findings folded pre-open | ~10 (qa B-T5 blocker; codex G4-fallback / artifact-name / run-attempt fail-open; fsr control-char / run-id-anchor / bidi-isolate; G4 dropped per D139) |
| Findings folded post-open | 5 (F1 P1 documented→#157 root; F2–F5 fixed) |
| Implementer | `implementer` agent (opus), 7 fold cycles |
| Models used | planner opus (fable not yet provisioned); implementer/fsr opus; qa/pr-triage sonnet |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-146 | opus | 42 | 40,734 | 509,447 |
| impl-146 | opus | 680 | 312,334 | 8,819,034 |
| fsr-146 | opus | 215 | 149,513 | 3,173,737 |
| qa-146 | sonnet | 151 | 48,782 | 927,027 |
| triage-165 (pr-triage) | sonnet | 75 | 40,024 | 1,913,542 |
| **PR #165 subagent total** | | | **591,387** | **15,342,787** (cache-read ~268M) |

### PR (dependabot) — issue #115 (next 16.2.10→16.2.11)
| Field | Value |
|---|---|
| Open → merge | minutes; all required checks pre-green; Codex 👍 |
| Review turns | offline 0 / online: Codex connector 👍 (dependabot lenses skip) |
| Findings | 0 |
| Delegations / tokens | none (orchestrator review + merge only) |

### PR #166 — issue #157 (claude-review write-scoped App token) — MERGED
| Field | Value |
|---|---|
| Path | conventional/interactive; `.github/workflows/**` + `.claude/**` + AGENTS.md |
| Open → merge | **26 min** (2026-07-28 21:47:01Z → 22:13:06Z), draft-first |
| Offline review turns | 2× local `codex review` (both CLEAN) + 1 `factory-security-reviewer` (CONFIRMED-SOUND) + 1 `qa` (PASS) |
| Online review turns | **1** Codex-connector round: clean 👍, no inline findings |
| Findings folded pre-open | 2 LOW (fsr test-enumerator gaps: case-insensitive `uses`, scalar `write-all` fail-closed) + 1 CI (CodeQL `js/file-system-race` in the test's dir-walk, fixed at source) |
| Findings folded post-open | 0 (connector clean) |
| Implementer | `implementer` agent (opus), 1 fold cycle + the CodeQL fix |
| Models | planner opus (planner-157) + fable (planner-157b); implementer/fsr opus; qa sonnet |
| Notable | **live end-to-end validated in production** — unlike #165, the action's workflow-edit skip did not fire, so claude-review reviewed this PR **green**, authored as `github-actions[bot]`, step B passed: direct proof the token/author change works. Two planners ran (delivery flakiness): **the fable contract was more complete** — caught a silent pr-triage fail-open the opus one missed. |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-157 | opus | 85 | 43,599 | 1,577,387 |
| planner-157b | fable | 60 | 38,596 | 483,709 |
| impl-157 | opus | 265 | 146,226 | 3,240,244 |
| fsr-157 | opus | 61 | 44,891 | 437,858 |
| qa-157 | sonnet | 55 | 17,337 | 286,605 |
| **#157 subagent total** | | 526 | **290,649** | **6,025,803** |

**#157 vs #146 — the headline efficiency result:** #157 (a comparable pipeline-security credential fix) cost **~½ the tokens** (291K vs 591K output; 6.0M vs 15.3M cache-create) and **~⅓ the wall-clock** (26 min vs 1h 23m), with **0 post-open review rounds** (vs #146's 2). The difference is contract completeness: #146's marathon came from the speculative G4 producer + step-A extraction churn discovered *at review*; #157's contract was complete up front (it even named the coupled step-B/pr-triage author break the issue text didn't), so `impl-157` ran 265 turns vs `impl-146`'s 680. Complete spec ⇒ tight execution — the core topology-v2 hypothesis, observed.

_(triage-165, the pr-triage lens, adjudicated both #165 and #166: 105 turns, 74,542 output / 2,934,673 cache-create — shared adjudication overhead.)_

### PR #170 — issue #158 slice 1 (sanitise attacker-controlled text before the publisher posts) — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `scripts/factory/**` (publisher glue) + tests |
| Open → merge | **2h 14m** (2026-07-29 01:26:47Z draft → 03:41:00Z), draft-first; 9 commits |
| Offline review turns | **7** local `codex review` (r1–r7) + `factory-security-reviewer` across 4 rounds (~2.4M cumulative fuzz) + `qa` ×2 + `pr-triage` (multi-round) |
| Online review turns | **3** Codex-connector rounds (`@codex review` re-triggers): round 1 = surrogate P2 + skip-token P2 + modelId low; round 2 = reasons-clamp P1; round 3 = CLEAN 👍 + "Didn't find any major issues" |
| Findings folded pre-open | 4 real (P1 zero-width title; **BLOCKER** backtick-reconstruction; **BLOCKER** clamp-resynthesis; P2 title-length DoS) + a vacuous-test + docstring |
| Findings folded post-open | 4 (surrogate-split P2; reasons-clamp evidence-loss **P1**; qa omitted-count + weak test; log-ordering evidence-loss P2) |
| Deferred to issues | #171 (commit-surface skip-token bypass + trailer autolink), #172 (spec-grounding `sanitizeReasonForDisplay`, slice 2), #168 (fullwidth-letter homoglyph), #169 (`safeClamp` robust-by-construction) |
| Implementer | `implementer` agent (opus), **9 fold cycles** |
| Models | planner **fable** (planner-158); implementer/fsr **opus**; qa/pr-triage **sonnet** |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-158 | fable | 65 | 36,353 | 435,803 |
| impl-158-s1 | opus | 709 | 356,734 | 13,387,385 |
| fsr-158-s1 | opus | 142 | 148,437 | 1,609,764 |
| qa-158-s1 | sonnet | 138 | 44,894 | 1,074,894 |
| qa-158-s1b | sonnet | 155 | 33,181 | 688,901 |
| triage-170 | sonnet | 138 | 62,524 | 1,578,932 |
| **PR #170 subagent total** | | 1,347 | **682,123** | **18,775,679** (cache-read ~301M) |

**#170 — the security-keystone counter-example to #157.** Where #157 showed "complete spec ⇒ 0 post-open rounds", #170 shows the ceiling of that lever: **7 total review rounds** (4 pre-open + 3 post-open), impl at **709 turns / 357K output / 13.4M cache-create across 9 fold cycles** — *more* than #146's marathon, on a slice whose contract (planner-158, a tight 65-turn fable pass) was NOT the problem. The findings that drove the post-open rounds were **subtle evidence-floor interactions** (a surrogate split that only shows on astral input at the clamp boundary; a 200-char clamp silently truncating authoritative rejection reasons; the full-evidence log running *after* a fallible POST) that no spec completeness prevents — they only surface under adversarial execution + the diverse cloud lens. Contract completeness collapses the *speculative-churn* rounds (#146's G4), not the *emergent-subtlety* rounds a security keystone carries.

### PR #173 — issue #158 slice 2 (spec-grounding publishers, `Closes #172`) — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `scripts/factory/publish-spec-grounding-*` + tests |
| Open → merge | **~40 min** (2026-07-29 05:36Z draft → 06:16:49Z), draft-first; 3 commits |
| Offline review turns | **1** local `codex review` (CLEAN) + `factory-security-reviewer` ×1 (CONFIRMED-SOUND, all 6 attack classes defeated through the real builders) |
| Online review turns | **1** Codex-connector round: CLEAN 👍 (no findings, no fold) |
| Findings folded | **0 pre-open, 0 post-open** — clean on the first pass |
| Implementer | `implementer` agent (opus), **0 fold cycles** |
| Models | planner **fable** (planner-158-s2); implementer/fsr **opus**; no qa (test diff 255 < 600) |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-158-s2 | fable | 53 | 39,146 | 418,116 |
| impl-158-s2 | opus | 233 | 77,969 | 1,180,534 |
| fsr-158-s2 | opus | 88 | 53,458 | 409,979 |
| **PR #173 subagent total** | | 374 | **170,573** | **2,008,629** |

**#173 — the amortisation, MEASURED (the answer to "does the leaf pay off").** Same story family as #170 (attacker-text sanitisation on a publisher surface), one slice later, reusing the leaf slice 1 built and hardened. The implementer cost **~1/5 the output (78K vs 357K) and ~1/11 the cache-create (1.18M vs 13.4M) across 233 turns vs 709**, with **0 fold cycles and 0 post-open review rounds vs slice 1's 9 and 3**. Whole-slice subagent total: 171K output / 2.0M cache-create vs slice 1's 682K / 18.8M — roughly **a quarter the output, a ninth the cache-create**. This is learning 8's downhill side made numeric: the *emergent-subtlety* rounds (surrogate split, evidence-floor truncation, log ordering) were paid ONCE, in the primitive; slice 2 only had to WIRE it into four sinks + fold #172, and the diverse-lens floor found nothing to fold. The keystone's cost is front-loaded and amortises across the slices that reuse it.

### PR #174 — issue #158 slice 3 (triage-verdict publisher, `Closes #158`) — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `scripts/factory/apply-triage-verdict-*` + the leaf + tests |
| Open → merge | ~50 min (2026-07-29 07:17Z ready → 08:05:56Z), draft-first; 7 commits |
| Offline review turns | **4** local `codex review` (r1 CLEAN; r2/r3 each caught a disclosure-completeness P2; r4 CLEAN) + `factory-security-reviewer` ×1 (CONFIRMED-SOUND, all 6 attack classes through the real markdown-it) |
| Online review turns | **2** Codex-connector rounds: round 1 = 1 P2 (silent backtick-strip); round 2 (after the folds) = CLEAN 👍 + "Didn't find any major issues" |
| Findings folded | 1 pre-open contract-accuracy (G6 EOL-normalise rationale) + 4 disclosure-completeness (backtick-silent → disclose; truncated-path accuracy; categorical class fix; connector's own). 0 security-surface folds |
| Implementer | `implementer` agent (opus), **4 fold cycles** (all in the new primitive's disclosure logic) |
| Models | planner **fable**; implementer/fsr **opus**; no qa (test diff 449 < 600) |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-158-s3 | fable | 43 | 36,437 | 458,116 |
| impl-158-s3 | opus | 395 | 167,566 | 2,642,873 |
| fsr-158-s3 | opus | 70 | 39,568 | 387,060 |
| **PR #174 subagent total** | | 508 | **243,571** | **3,488,049** |

### #158 COMPLETE — the amortisation curve across three slices

| Slice (PR) | new work | impl output | impl cache-create | impl turns | fold cycles | post-open connector rounds |
|---|---|--:|--:|--:|--:|--:|
| 1 (#170) | build + harden the leaf | 357K | 13.4M | 709 | 9 | 3 |
| 2 (#173) | wire 4 sinks + fold #172 | 78K | 1.18M | 233 | 0 | 0 |
| 3 (#174) | **new** multiline primitive + wire 3 sinks | 168K | 2.64M | 395 | 4 | 1 (→CLEAN on re-review) |

The three slices are the topology-v2 hypothesis drawn as a curve. Slice 1 front-loads the whole cost (build the primitive + pay every emergent-subtlety round on it). Slice 2, pure reuse, is the floor: ~1/5 slice-1's impl cost, zero folds. Slice 3 sits between: it introduced ONE new primitive (a multi-line fenced-block renderer) and paid emergent subtlety **only on that new surface** — four folds, ALL in its disclosure logic (silent backtick-strip → tilde-defuse → the whole content-modifying-transform class), while its security surface (fence-escape / trigger / marker / ceiling) was CONFIRMED-SOUND first-pass and the reused helpers cost nothing. **The cost scales with NEW primitive surface, not with lines wired.** Learning 8 confirmed: contract completeness can't pre-empt the emergent-subtlety rounds a new primitive carries, but reuse pays zero. Also observed on #174: the *local* codex review caught r2/r3's disclosure gaps before the re-push, so the connector's re-review landed CLEAN in one round — shift-left keeping connector spend to the single unavoidable round.

### PR #175 — issue #171 (commit-surface CI-skip-token bypass + modelId autolink) — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `scripts/factory/**` (commit surface) + tests |
| Open → merge | ~1h (2026-07-29 ~08:5xZ draft → 10:0xZ), draft-first; 5 commits |
| Offline review turns | 2 local `codex review` (r1 CLEAN, r2 CLEAN post-fold) + `factory-security-reviewer` ×2 (r1 EXPLOITABLE → r2 CONFIRMED-SOUND) |
| Online review turns | 1 Codex-connector round: CLEAN 👍 + "Didn't find any major issues" |
| Findings folded | 1 pre-open `qa`-class none; **1 fsr BLOCKER post-hand-back, pre-open** (nested-bracket CI-skip bypass — reached `git push` with a live token); a 2-line implementer deviation (backtick-preserving normaliser to make neutralize-LAST testable) |
| Implementer | `implementer` agent (opus), 1 security fold + the doc-verification (§0 closed by orchestrator via WebFetch of GitHub's docs) |
| Models | planner **fable** (planner-171); implementer/fsr **opus** |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-171 | fable | 63 | 43,208 | 1,207,852 |
| impl-171 | opus | 316 | 172,195 | 2,228,131 |
| fsr-171 | opus | 61 | 27,175 | 708,259 |
| **PR #175 subagent total** | | 440 | **242,578** | **4,144,242** |

**#171 — two sharp findings.** (1) **The ADVERSARIAL lens is distinct from the CORRECTNESS lens.** `factory-security-reviewer` reached `git push` with a live GitHub-honoured `[skip ci]` via a nested title `[oops [skip ci]` — the guard extracted the outer bracket group and mis-keyed it, while GitHub does a literal substring search. The local `codex review` (CLEAN), the author's full L/N/E/M suite (all green), AND my own orchestrator trace all PASSED it; only the agent *trying to break it* found it. On a gate-bypass fix the adversarial red-team is the load-bearing lens, not the correctness lens — same lesson as the cloud-connector catches (learning 1/7), now for fsr specifically. The fix realigned detection with the enforcing consumer (per-token literal regexes matching what GitHub matches, not a re-derivation of it). (2) **The fix's own commit message skipped its CI.** The commit prose describing the vulnerability contained the literal `[skip ci]`, so GitHub skipped every required workflow on the PR (mergeState BLOCKED, no runs at all) — the sharpest possible demonstration that the token is a plain substring honoured anywhere. Resolved by rewording the HEAD commit message token-free (tree identical) and force-pushing; a squash-merge writes a clean message onto `main`.

### PR #176 — issue #164 (implement-transcript artifact exposure → minimal model_id handoff) — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `.github/workflows/**` + `scripts/factory/**` + tests |
| Open → merge | ~57m (2026-07-29 23:47Z draft → 2026-07-30 00:44Z), draft-first; 2 commits |
| Offline review turns | 1 local `codex review` (CLEAN) + `factory-security-reviewer` ×1 (CONFIRMED-SOUND, empirical bash+jq probes) |
| Online review turns | 1 Codex-connector round — automatic signal UNSTABLE (a bare 👍, no comment, later withdrawn); `@codex review` fallback → CLEAN 👍 + "Didn't find any major issues" (Reviewed commit head-matched) |
| Findings folded | **ZERO at any stage** — clean pre-open floor, clean post-open. The one implementer deviation (jq `[[:cntrl:]]` reject to keep trailing-newline rejection, vs bash `$( )` stripping) was fsr-confirmed as part of what makes GITHUB_OUTPUT injection impossible, not a fix |
| Implementer | `implementer` agent (opus), 0 folds; independent `pr-triage` (sonnet) → MERGEABLE |
| Models | planner **fable** (planner-164); implementer/fsr **opus**; pr-triage **sonnet** |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-164 | fable | 72 | 67,879 | 653,271 |
| impl-164 | opus | 309 | 136,647 | 1,541,456 |
| fsr-164 | opus | 62 | 35,661 | 302,656 |
| triage-176 | sonnet | 46 | 25,709 | 192,770 |
| **PR #176 subagent total** | | 489 | **265,896** | **2,690,153** |

**#164 — the clean-pass counter-example to learning 8, plus a Codex-connector reliability note.** (1) A tight fable contract + a structurally simple, non-emergent slice (drop an artifact, re-route one field) produced **zero review rounds at any stage** — the first fully-clean pass of the run. Where #170 was emergent-subtlety-heavy (learning 8), #164 introduced **no new primitive surface** (it reused the #171 model-id allowlist and the #158 sanitisation), so the amortisation thesis held: cost tracks new surface, and there was none. (2) **The connector's automatic signal was unstable on a human-authored conventional PR.** The automatic review left a bare 👍 reaction (no verdict comment) which then *vanished* before a manual `@codex review` produced the full comment-backed verdict. A reaction is single-slot-per-content-type, so a withdrawn/re-issued 👍 loses history: a watcher polling only comments/reviews misses it entirely, and one polling only the current reaction set can't distinguish a withdrawn-then-reissued 👍 from a fresh one. The robust signal is the **"Didn't find any major issues" comment with a head-matching `Reviewed commit`**, not the reaction — and when the automatic signal is ambiguous/bare, the `@codex review` fallback is correct even though something "arrived", because it produces the unambiguous comment.

### PR #177 — issue #160 (protect the enforcement-test class in the patch guard + CODEOWNERS) — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `scripts/factory/**` guard + CODEOWNERS + AGENTS.md + `.claude/agents/**` + PR template + tests |
| Open → merge | ~3h25m (2026-07-30 01:31Z → 04:57Z), draft-first; 4 commits across 7 force-push heads |
| Offline review | 4 local `codex review` rounds (3 folds pre-open) + `factory-security-reviewer` **CONFIRMED-SOUND at the guard (C1) level**, pre-open and unchanged throughout + `qa` NEEDS-WORK (C4 coverage, folded) |
| Online review | **7 Codex-connector passes** (5 with findings, 2 clean): routing P1; C4 e2e/async coverage; C3 CODEOWNERS ownership; C4 cross-literal FP `:83`, verb-in-prose FP `:168`, Python-doc FP `:255`; subprocess/cross-module/side-effect ceiling; `vitest.config` P1. Independent `pr-triage` (triage-177, 128 turns) adjudicated every round |
| Findings | routing P1 folded (fsr surface across 5 artifacts); `vitest.config.ts` flag-not-block P1 **deferred → #178** (pr-triage + fsr: not a mechanical bypass — guard is unconditional); the C4 read/token heuristic drove **3 connector rounds of false-positives** and was finally **removed** (design-level pivot to import-only detection) |
| Implementer | `implementer` (opus), ~9 folds + the design pivot; the security core (C1 + C2/C3) was sound from the first pass — **all** post-open churn was C4 |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-160 | fable | 58 | 53,770 | 554,209 |
| impl-160 | opus | 720 | 320,547 | 14,913,823 |
| fsr-160 | opus | 93 | 53,947 | 846,652 |
| qa-160 | sonnet | 87 | 34,751 | 379,668 |
| triage-177 | sonnet | 128 | 74,726 | 2,340,479 |
| **PR #177 subagent total** | | 1,086 | **537,741** | **19,034,831** |

**#160 — the emergent-subtlety extreme, and the heuristic-lint lesson.** The security core (C1 guard protecting `tests/factory/`, C2/C3 CODEOWNERS mirror) was `factory-security-reviewer`-CONFIRMED-SOUND from the first pass and never churned. **All** post-open cost was **C4**, the placement meta-guard — a honest-drift LINT, not the adversarial control. C4's read/token heuristic ("does a test read a protected path?") proved an **inexhaustible target for the Codex connector**: it kept finding false-POSITIVES (`it("does not open .npmrc")`; an ordinary snowflake test naming a path in a docstring — each would BLOCK a legit PR) AND false-NEGATIVES (subprocess, cross-module, `read(join(base, token))` reads), each fold introducing the next edge (widen verbs → prose FPs; tighten to direct-arg → miss the common join idiom). The convergent answer was **not more heuristic tuning but a precise, keyword-anchored detector** — reduce C4 to `importsFactoryGlue` (import-only), dropping the read-heuristic entirely, which triage-177's corpus survey showed added ~no real coverage (reads overwhelmingly use variable/wrapper path args → the ceiling; import-detection already covers the 33/38 majority precisely) while generating every FP. That also **restored the story-planner's original §Q5 scoping** (Python/snowflake was never in scope; the round-3 Python scan was scope creep that produced the `:255` FP). Lessons: **(9)** a heuristic honest-drift lint has an infinite adversarial-lens edge-tail — converge it with a precise structural signal, not iterative patching. **(10)** a CI-run lint's false-POSITIVES (blocking legit PRs) are worse than its false-negatives (a defence-in-depth gap C1 backstops) — weight the direction accordingly. **(11)** the Codex connector is the highest-yield lens (learning 1/7) here *to a fault*: 4 clean local rounds, yet 5 connector rounds of real findings — but the P1s (routing gap; false-positives) were genuinely load-bearing. **(12)** contrast #164 (clean single pass, zero new primitive surface): #160 introduced a NEW heuristic-detector primitive and paid its full emergent-subtlety cost (learning 8, sharply) — the amortisation thesis holds.

### Continued autonomous run (30 Jul, operator away for the day)

The ~10:00Z snapshot below called the first run complete because the remaining backlog needed operator decisions. Those were taken: operator agreed tonight's queue (#164 → #160 → #163; #167 **design-writeup only**; autonomous merge on fully-clean, same gates). Progress this run: **#167** re-scoping writeup posted + parked (recommends converging the main review job onto the Bash-free spec-grounding pattern to close #167 + #146-completion-forgery with no new execution class). **#164 → PR #176 MERGED** (above). **#160 → PR #177 MERGED** (see the row above — the C4 heuristic-lint marathon: 7 connector rounds, converged by reducing C4 to precise import-only detection; `vitest.config` residual filed as #178). **#163** docs PR next — partly pre-done, since #160 already added `tests/factory/**` to the fsr routing surface. Topology v2 flow held throughout (spec-first, pre-open floor + adversarial fsr, draft-first, connector verdict, independent pr-triage). Session-level totals for this run land when #160/#163 close.

### Session-level (as of ~10:00Z 29 Jul, ~17.5h in — after #175/#171 merge, first autonomous run complete)
| Bucket | Turns | Output | Cache-create | Cache-read |
|---|--:|--:|--:|--:|
| Orchestrator main loop (opus, xhigh) | 1,510 | 3,621,493 | 9,659,831 | 835,754,022 |
| All sub-agents (~4,411 turns) | 4,411 | 2,259,455 | 51,318,180 | — |

_Prior: ~11.3h main loop 2.88M output / 8.56M cache-create; ~5.75h 1.53M / 2.15M._ Across the full run: **6 security PRs** (#165/#166/#170/#173/#174/#175), every finding folded or tracked pre-merge, zero bad merges. The +24h keep/adjust/revert summary is posted on #159. The remaining F1 backlog (#164/#167/#160/#162/#163) needs operator decisions (pipeline security architecture, artifact drop-vs-gate, live branch-protection state), so the autonomous run ended here.

_Prior snapshot (~22:13Z, ~5.75h): main loop 1,533,737 output / 2,147,116 cache-create; sub-agents 775,755 / 18,567,626._ The ~2h14m #170 slice-1 marathon roughly **doubled** both the main-loop output (1.53M → 2.88M — the orchestrator drove 7 review rounds) and the sub-agent cache-create (18.6M → 42.0M — impl-158-s1's 9 fold cycles at 13.4M dominate). **Cache-read is the volume driver** (main loop 519M, sub-agents 658M) but priced ~0.1×; output + cache-create are the cost. This is the concrete per-keystone spend the +24h checkpoint (#159) weighs against the safety bought (a P1 floor violation + a CI-bypass caught).

---

## Findings / learnings so far

1. **Local `codex review` ≠ the cloud Codex connector.** On #146 the connector
   caught a P1 forgeable-guard + 4 P2s that 7 local `codex review` rounds *and*
   the adversarial `factory-security-reviewer` passes missed. Distinct lenses,
   not redundant. The Codex-review arm is the highest-value review lens observed.
2. **Cheap planner ≥ expensive on at least one story.** On #157 the `fable`
   planner produced a *more complete* contract than the `opus` planner (caught a
   silent pr-triage fail-open the opus one missed). n=1; watch #158+.
3. **Cache-creation dominates token cost, not output** (18.6M vs 0.78M sub-agent).
   The #146 marathon's `impl-146` alone was 8.8M cache-create across 7 fold
   cycles — the concrete price of a P1-forgeable-guard slice.
4. **G4 lesson (D139).** The speculative no-consumer artifact drove most of
   #146's review churn; apply "no consumer ⇒ don't build the producer" at
   *planning*, not review.
5. **fable not provisioned at session start** — fable-pinned sub-agents silently
   inherited the parent (opus). Provisioned mid-session (operator); all tiers
   then honored their pins (verified by env-context self-report AND transcripts).
   Process fix: verify the *resolved* model, not just that the pin was passed.
6. **Codex-MCP-as-implementer de-scoped for this repo** (operator): the whole F1
   backlog is protected/security → faithful routing keeps it on the `implementer`
   agent; that experiment arm moves to the pilot-agent codebase.
7. **The cloud Codex connector is the highest-yield lens on a security keystone —
   confirmed a second time (#170).** After the pre-open floor (7 local `codex
   review` rounds + `factory-security-reviewer` at ~2.4M fuzz + `qa`) all passed,
   the connector still found three real EVIDENCE-FLOOR issues across its rounds: a
   surrogate-pair split (invalid wire UTF-8 → PR-create 422), a 200-char clamp
   **silently truncating authoritative rejection reasons** (a direct AGENTS.md
   floor violation), and the full-evidence log running *after* the fallible
   comment POST. The pre-open lenses framed trigger/breakout/resynthesis; the
   connector framed *evidence preservation*. Distinct lens, reinforces learning 1.
8. **Contract completeness has a ceiling (#157 vs #170).** #157 proved a complete
   spec ⇒ 0 post-open rounds. #170 is the counter-example: planner-158 was a tight,
   correct fable pass, yet the slice still took 4 pre-open + 3 post-open rounds and
   *more* impl cost than #146's marathon. The driver was **emergent subtlety** —
   floor-interactions that only surface under adversarial execution + the diverse
   lens, which no up-front spec enumerates. Completeness collapses *speculative-churn*
   rounds (#146's no-consumer G4), not *emergent-subtlety* rounds. Budget a security
   keystone for multiple review rounds regardless of contract quality.
