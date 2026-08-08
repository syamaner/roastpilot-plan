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

The ~10:00Z snapshot below called the first run complete because the remaining backlog needed operator decisions. Those were taken: operator agreed tonight's queue (#164 → #160 → #163; #167 **design-writeup only**; autonomous merge on fully-clean, same gates). Progress this run: **#167** re-scoping writeup posted + parked (recommends converging the main review job onto the Bash-free spec-grounding pattern to close #167 + #146-completion-forgery with no new execution class). **#164 → PR #176 MERGED** (above). **#160 → PR #177 MERGED** (see the row above — the C4 heuristic-lint marathon: 7 connector rounds, converged by reducing C4 to precise import-only detection; `vitest.config` residual filed as #178). **#163 → PR #179 MERGED** (docs drift: CodeQL/codecov roster gate-types corrected to live, fsr routing surface spelled out inline incl. the `.claude`/`.codex` bare basenames, publisher-rationale sibling comment fixed). **All three agreed items (#164/#160/#163) merged — run complete.**

**#163 — the docs-drift sibling tail (learning 13).** A 30-line docs change took **5 connector rounds** + ~5 local codex rounds. The connector/codex are an inexhaustible finder of *stale-claim siblings* scattered across files: fixing the AGENTS.md roster surfaced a repo sibling (`publish-implement-patch.mts`'s publisher rationale), then a routing-completeness gap (the `.claude`/`.codex` bare basenames the glob-only list missed — a genuine routing-bypass P1), then a config-file rabbit-hole (`codecov.yml`, whose "required" is dual-meaning — codecov's own config term vs a branch-protection claim — so each in-place correction generated a fresh accuracy issue). The convergent move on the rabbit-hole was to **revert `codecov.yml` out of scope** (a pre-committed stop) rather than fold a fifth time — its pre-existing stale claim is a tracked low-stakes follow-up. Same shape as #160's C4 (learning 9): a good adversarial lens has an infinite edge-tail on drift/heuristics; converge by scope-disciplining (revert the rabbit-hole file / precise structural signal), not iterative patching. Tokens: impl-163 56,501 out / 896,444 cc (170 turns); fsr-163 7,388 / 194,421.

**Session close (30 Jul ~05:52Z).** Autonomous overnight run complete: **3 PRs merged** (#176/#177/#179), **#167** re-scoping writeup parked, **#178** filed (vitest.config discovery-config residual). Operator decisions flagged and awaiting return: #163 branch-protection config (CodeQL-required intent, wiring codecov, requiring approvals), #167 fix path, #178 config-guard design, plus the noted `codecov.yml` L14-16 stale-comment follow-up. Guardrails held throughout: `FACTORY_PAUSED` untouched, no settings/secrets/branch-protection changed, protected branches untouched, autonomous merge only on fully-clean (all required checks green, connector clean on head, threads resolved, pr-triage where security). Merged feature branches remain on origin (deletion is the operator's). Topology v2 flow held throughout (spec-first, pre-open floor + adversarial fsr, draft-first, connector verdict, independent pr-triage). Session-level totals for this run land when #160/#163 close.

### Session-level (as of ~10:00Z 29 Jul, ~17.5h in — after #175/#171 merge, first autonomous run complete)
| Bucket | Turns | Output | Cache-create | Cache-read |
|---|--:|--:|--:|--:|
| Orchestrator main loop (opus, xhigh) | 1,510 | 3,621,493 | 9,659,831 | 835,754,022 |
| All sub-agents (~4,411 turns) | 4,411 | 2,259,455 | 51,318,180 | — |

_Prior: ~11.3h main loop 2.88M output / 8.56M cache-create; ~5.75h 1.53M / 2.15M._ Across the full run: **6 security PRs** (#165/#166/#170/#173/#174/#175), every finding folded or tracked pre-merge, zero bad merges. The +24h keep/adjust/revert summary is posted on #159. The remaining F1 backlog (#164/#167/#160/#162/#163) needs operator decisions (pipeline security architecture, artifact drop-vs-gate, live branch-protection state), so the autonomous run ended here.

_Prior snapshot (~22:13Z, ~5.75h): main loop 1,533,737 output / 2,147,116 cache-create; sub-agents 775,755 / 18,567,626._ The ~2h14m #170 slice-1 marathon roughly **doubled** both the main-loop output (1.53M → 2.88M — the orchestrator drove 7 review rounds) and the sub-agent cache-create (18.6M → 42.0M — impl-158-s1's 9 fold cycles at 13.4M dominate). **Cache-read is the volume driver** (main loop 519M, sub-agents 658M) but priced ~0.1×; output + cache-create are the cost. This is the concrete per-keystone spend the +24h checkpoint (#159) weighs against the safety bought (a P1 floor violation + a CI-bypass caught).

---

## Session 30 Jul (afternoon, operator-directed) — #168 + #169 (PR #180)

Operator returned, agreed a context-summarisation workflow (milestone-flush; in session memory), and directed the next backlog item. **#146 assessed and parked**: its implementable steps 1+2 already shipped in PR #165; the open step 3 (close the review-loop allowlist gap) is evidence-gated AND a permissive credential-adjacent grant = an operator decision, and the denial *tool names* are still not observable (step 1 surfaced only the count, which runs 5-6/run). Pivoted to the #168+#169 pair as one PR.

### PR #180 — #168 (fold-aware Codex-trigger detection) + #169 (safeClamp misuse-surface removal) — MERGED

Squash `dc8cfb9`, `Closes #168` + `Closes #169`. Conventional/interactive. Both #158-slice-1 residuals, one leaf (`untrusted-text.mts`), two ordered commits.

| Metric | Value |
|---|---|
| Open→merge wall-clock | **~1h39m** (ready 09:43:51Z → merged 11:23:13Z), draft-first; ~40m of it the `[skip ci]` self-skip detour |
| Pre-open floor | local `codex review` CLEAN; `factory-security-reviewer` CONFIRMED-SOUND (~1.4M fuzz); `qa` NEEDS-WORK → 1 fold |
| Post-open review rounds | **1** connector round with findings (a P1) → folded; then 2 clean connector passes (48f45c9, and 0e937c9 post-reword). Median-≤1 target met |
| Findings folded pre-open | 1 (qa **H16b** — the no-NFKC-leak proof extended to the 2 renderers + 2 new wrappers; qa *demonstrated* a silent leak into each pre-fix) |
| Findings folded post-open | 1 (connector **P1** — per-code-point fold → full-string-NFKC-equivalent segmentation fold) |
| Implementer | `implementer` (opus), 3 fold cycles + an orchestrator-driven message reword |
| Codex sessions | 2 local `codex review` (pre-open + P1-fold re-review, both CLEAN); connector: 1 auto (P1) + 2 manual `@codex review` re-triggers (both CLEAN) |
| Domain reviewers | `factory-security-reviewer` ×2 (pre-open SOUND; P1-fold re-review SOUND at 3M+4M fuzz, proved the segmentation reproduces full-string NFKC structurally); `qa` ×1; `pr-triage` ×1 (accept) |
| Token spend / delegation (subagent_tokens) | planner 127.2K; impl build 286.9K / fold-1 306.8K / fold-2 417.7K; fsr 136.4K + 126.2K; qa 131.3K; pr-triage 132.3K |
| Residual filed | **#181** (`@`+combining-mark-before-`codex`, low, pre-existing, structurally cannot compose) |

**#180 — learning 14: the connector out-adjudicated the adversarial security reviewer on the SAME seam.** Four pre-open lenses cleared the fold (local codex CLEAN, `factory-security-reviewer` CONFIRMED-SOUND at 1.4M fuzz, qa, the orchestrator's read), and fsr had *explicitly* rated the per-code-point-vs-full-string-NFKC seam a "low/unreachable residual — no evidence such a connector exists." The cloud connector escalated the identical seam to a **P1** and was right: a decomposed `@codexź` (`z`+U+0301) is left live by the per-cp fold, but a connector doing full-string NFKC composes it into a boundary-creating non-ASCII letter and fires. Fix = **match the plant**: compute the real full-string NFKC, not a per-code-point approximation of it — every gap between the model and the real algorithm is an exploit (identical to #171's literal `[skip ci]` matcher lesson). The re-review confirmed the fix sound (fsr 3M+4M fuzz, 0 property divergences; proved *structurally* that no reordering-relevant char escapes the `\p{M}`-segmentation, since zero non-Mark chars with ccc>1 exist across U+0001–U+2FFFF). Sharpest instance yet of learnings 1/7/11: the connector didn't just find what the others missed — it **overturned the adversarial reviewer's explicit "unreachable" verdict** on the same seam.

**#180 — learning 15: the #171 self-skip irony recurred one PR over.** The connector-P1 fold commit's message literally contained `[skip ci]` (it referenced #171's fix *by name*), so GitHub Actions skipped every workflow on that head while Vercel (a separate integration) ran; the PR sat BLOCKED with required checks never started — diagnosed via the Actions-silent / Vercel-green split. Remediated exactly as #171: reword the head commit message to name the token without spelling it, tree byte-identical (`48f45c9`→`0e937c9`), force-push. Two process gaps: (a) the orchestrator's pre-push verification checked the DIFF but not the commit MESSAGE for skip tokens — #171's guard covers the factory publisher's commits, not the conventional/interactive commits the orchestrator drives; (b) a change *about* a control token spells the token by describing it. **Class-fix: scan the commit message subject+body for the CI-skip token set pre-push on conventional commits too** (applied immediately — the squash-merge message was scanned clean before merging). A live re-proof that a control token is context-free.

**Process note (topology v2 held end to end):** planner contract D104-verified + citation-spot-checked (the planner mislabelled the base SHA but read the current tree; caught on verify), implementer in its own worktree, pre-open floor + adversarial fsr, draft-first until CI green, connector verdict, independent pr-triage, autonomous merge on fully-clean. The security core was sound from the implementer's first pass; every fold was a review-surfaced refinement, none a correctness bug in the guard itself. Zero bad merges preserved.

---

## Session 30 Jul (afternoon, cont.) — #154 (PR #182)

### PR #182 — issue #154 (workflow expression guard: audit `shell:` + `with.script` sinks, not only `run:`) — MERGED

Squash `cc6e6d1`, `Closes #154`. Conventional/interactive. A triage-of-#153
residual (zero live instances). One file, `tests/factory/workflow-run-expression-injection.test.ts`.

| Metric | Value |
|---|---|
| Open→merge wall-clock | **~1h18m** (draft 12:35Z → merged 13:53:54Z), draft-first; 1 post-open fold |
| Pre-open floor | local `codex review` CLEAN; `factory-security-reviewer` **CONFIRMED-SOUND** (no bypass, no live FP); `qa` **PASS** |
| Post-open review rounds | **1** CCR nit (low) folded; connector CLEAN both heads (auto on `ccc03b4`, `@codex review` re-trigger on `7c69ce6` → comment-channel "Didn't find any major issues" + fresh 👍, head-matched). Median-≤1 met |
| Findings folded pre-open | **0** — clean floor (all three lenses first-pass clean) |
| Findings folded post-open | **1** (CCR low nit: leftover `run expression corpus` empty-corpus string, class-complete at 2 sites → sink-generic) |
| Implementer | `implementer` (opus), build + 1 fold cycle |
| Domain reviewers | `factory-security-reviewer` ×1 (CONFIRMED-SOUND); `qa` ×1 (PASS); `pr-triage` ×1 (MERGEABLE, independently re-verified the benign claude-review red) |
| Residual flagged | **claude-review completion-assertion checklist-shape false-negative** (learning 16 below) — follow-up filed |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-154 | fable | 19 | 32,114 | 294,577 |
| impl-154 (build + fold) | opus | 139 | 38,021 | 1,121,560 |
| fsr-154 | opus | 56 | 36,505 | 380,919 |
| qa-154 | sonnet | 44 | 18,529 | 274,411 |
| triage-182 | sonnet | 31 | 20,417 | 505,969 |
| **PR #182 subagent total** | | 289 | **145,586** | **2,577,436** (cache-read ~22.4M) |

**#154 — the cheap-slice datapoint (amortisation thesis, other extreme).** impl-154
cost **38K output / 1.12M cache-create across 139 turns** — roughly **1/9 the
output and 1/12 the cache-create of the #170/#160 security keystones**, and the
whole PR (5 delegations) totalled 146K / 2.6M. The driver is the same one
learnings 8/12/14 name: **cost tracks NEW primitive surface**, and #154
introduced essentially none — it reused the existing recursion, `${{ }}`
extractor, and closed allow-list, adding only a `SINK_KEYS` set + a `.toLowerCase()`
fold on the already-present arm. The security surface (merge-key synthesis,
duplicate-key ordering, non-sink leaves, unscoped-`script`) was fsr
CONFIRMED-SOUND **first-pass** with no folds; the one post-open fold was a
cosmetic leftover string, not the guard. A class-fix (run→sink identifier rename)
that CCR caught one un-swept sibling of — folded class-complete (2 sites), and
the connector re-review confirmed clean in one round.

**#154 — learning 16: the connector re-review is the robust CLEAN channel, but
the `claude-review` completion-assertion has a checklist-shape false-negative on
a prose re-review.** After the post-open fold, the CCR re-review (run 30547564749)
genuinely completed and was CLEAN ("Prior nit — confirmed fixed… No new issues
found", a full logic re-trace, no unticked boxes, no truncation), but it posted a
`### Review summary` **prose** shape instead of the `- [x]` **checklist** shape the
first automatic review used. The #146 completion-assertion (step 8) is pinned to the
checklist shape, so it tripped "this run's tracking comment has no tracking
checklist" and failed the `claude-review` **job** — a benign false-negative in the
**safe direction** (a complete review flagged incomplete, the opposite of the
misleading-green #146 exists to prevent). Merge-safe because (a) `claude-review` is
**not** a required status check (verified live: required list is
CI/Playwright/Snowflake-offline/CodeQL/dep-review/mutation), so `mergeStateStatus`
was `UNSTABLE` not `BLOCKED`, and (b) both the orchestrator AND independent
`pr-triage` read the *full* tracking-comment body and confirmed the review was
genuinely complete-and-clean, not degraded — the red was believed benign only after
reading the content, never on faith. Contrast the connector, whose re-trigger
produced the **robust comment-channel signal** ("Didn't find any major issues" +
head-matching `Reviewed commit`), the reliable one when the stale 👍 is idempotent
(learning re #164). Follow-up filed against #146's mechanism (accept the prose
"Claude finished + no unticked boxes + explicit verdict" shape, or have the action
always use the checklist shape) so the noise doesn't recur on every post-fold
re-review.

**Process note (topology v2 held end to end):** planner contract D104-verified +
all cross-file citations spot-checked (corpus greps, pin-audit manifest scope,
`.toLowerCase()` precedent, `merge:true` asymmetry, the confirmed-untested
alias-bound catch → T13); implementer in its own worktree; isolated fsr/qa review
worktrees (mutation-isolation rule); pre-open floor + adversarial fsr; draft-first
until CI green; `@codex review` single re-trigger on the new final head after the
fold; connector comment-channel verdict verified bot-authored + head-matched;
independent pr-triage; autonomous merge on fully-clean. Zero bad merges preserved.

---

## Session 30 Jul (evening, operator-directed) — #183 (PR #185)

Operator picked the #183 fix option (**C**, terminal completion sentinel) off the planner's options analysis, then directed the drive.

### PR #185 — issue #183 (completion-assertion fails closed on a complete prose review) — MERGED

Squash `8e940ff`, `Closes #183`. Conventional/interactive. MODIFIES a factory-pipeline security control (the `claude-review` completion-assertion). 5 commits (fixtures → workflow → C-T1..C-T11 → C-T12 → C-T11-exact-fix).

| Metric | Value |
|---|---|
| Open→merge wall-clock | **~1h05m** (ready 18:23:13Z → merged 19:23:43Z), draft-first; 2 post-open folds |
| Pre-open floor | local `codex review` CLEAN ×2; `factory-security-reviewer` **CONFIRMED-SOUND** (could not admit a truncated review; mawk/gawk byte-identical; precedence/byte-equality hold); `qa` PASS → 1 fold (C-T12 no-heading accept coverage) |
| Post-open review rounds | **1** connector round with a finding (C-T11 P2) → folded; then a fresh connector pass CLEAN (comment-channel + 👍, head-matched) |
| Findings folded pre-open | 1 (qa C-T12: no-heading widening accept-path had no positive test — availability-symmetry on a security harness) |
| Findings folded post-open | 1 (**connector P2**: C-T11 lockstep used `toContain`, not byte-equality → a suffix-drift on the instruction marker would pass the test yet red every prose review at runtime; availability-direction, not fail-open. Fixed to exact `toBe`) |
| Implementer | `implementer` (opus), build + 2 folds |
| Domain reviewers | `factory-security-reviewer` ×1 (re-confirmed on final head); `qa` ×1; `pr-triage` ×1 (FIX-FIRST on the P2 → **MERGEABLE** on the fixed final head) |
| Residual filed | **#184** (pre-existing checklist-branch quoted-ticked-box fail-open, out of scope) |

Tokens (output / cache-create):
| Delegation | Model | Turns | Output | Cache-create |
|---|---|--:|--:|--:|
| planner-183 | fable | 25 | 31,027 | 753,329 |
| impl-183 (build + 2 folds) | opus | 201 | 117,344 | 2,687,763 |
| fsr-183 | opus | 73 | 44,175 | 1,016,432 |
| qa-183 | sonnet | 85 | 21,276 | 568,035 |
| triage-185 | sonnet | 67 | 42,545 | 1,613,209 |
| **PR #185 subagent total** | | 451 | **256,367** | **6,638,768** |

**#183 — learning 17: the connector's AUTOMATIC clean-signal is a 👍 reaction; a MANUAL `@codex review` can out-find it, but is not free.** Operator-confirmed mechanism (the connector's own "About" text): after an auto review it **comments if it has suggestions, otherwise reacts 👍**. On #185 the automatic pass left a clean 👍 (captured live at 18:25:41Z). The orchestrator, over-cautious about a "bare" 👍, posted a manual `@codex review` — which re-reviewed the SAME head and **posted a real P2** (the C-T11 lockstep weakness) that the auto-👍, fsr, qa, local codex AND the claude-review pass all missed, and **withdrew the auto-👍** (so a watcher checking after saw no 👍 at all — the #164 reaction-volatility hazard, now observed in the withdraw-on-re-review direction). Two lessons: **(a)** the manual re-trigger isn't purely redundant — LLM review is non-deterministic, and a second diverse pass genuinely found a real defect (learnings 1/7/11/14 again); **(b)** but it costs Codex budget and extends the cycle, so **trust the auto-👍 on routine PRs and reserve the manual re-trigger for security-gate changes** — here (a change to the completion-assertion itself) the extra pass paid off, so the calibration is "scrutinise the gate, trust the routine." The robust signal remains the comment channel with a head-matching `Reviewed commit` (the 👍 is withdraw-volatile).

**#183 — learning 18: the fix self-validated in production, and the AGENTS.md #140 "workflow-edit self-skip" is stale at action v1.0.176.** The PR body initially carried the documented caveat that a workflow-edit PR reds `claude-review` because the action self-skips (#140). It did **not**: at the pinned action `700e7f8`/v1.0.176 the action ran a **real** review of #185 under the *new* workflow (a `pull_request` run uses the PR head's workflow), the model **received the `--append-system-prompt` sentinel instruction and emitted it as its final line**, and the **new** completion-assertion passed a genuinely-complete checklist+sentinel review ("No blocking issues found"). So #185 self-validated Option C end-to-end in production (passthrough works; the new branch accepts a real complete review). The PR body was corrected. **Operator follow-up flagged:** the AGENTS.md/roster note that "the Claude action step skips and reports SUCCESS on a workflow-edit PR (#140)" and "a workflow-edit PR can never verify its own review path" is now stale for this action version — worth an AGENTS.md accuracy correction (a protected-file conventional change, not folded here).

**Process note (topology v2 held end to end):** planner options-analysis contract (operator-decided the option) → D104-verified + all cross-file citations spot-checked (the load-bearing security fact — "Claude finished" survives truncation in the pr150 fixture — verified directly) → implementer in its own worktree with a pre-flight passthrough verification (traced through the action source) → pre-open floor + adversarial fsr on the isolated review worktrees → draft-first until CI green → connector verdict → 2 folds (qa symmetry + connector P2), each re-run through the local codex floor and CI, connector re-triggered once on the new final head → independent pr-triage (FIX-FIRST → MERGEABLE) → autonomous merge on fully-clean. Zero bad merges preserved.

### Session close (30 Jul evening) — handover state

**Merged this session:** #154 → PR #182 (`cc6e6d1`), #183 → PR #185 (`8e940ff`). Both
factory-pipeline security controls, full topology-v2 flow, zero bad merges. Ledger
rows + learnings 16-18 above; **all ledger commits are LOCAL/unpushed** (operator
pushes).

**In flight at handover:** **#80** (spec-grounded review criteria-derivation +
trigger completeness) — `planner-80` drafting the D104 contract; the orchestrator
will verify + post it and label the issue `ready-for-conventional-implementation`.
A fresh session drives #80 **from the posted contract** (skip re-verification).
**Credit-conservation pivot (operator, 30 Jul evening, supersedes learning 6):**
Claude credits scarce / Codex credits plentiful, so **implementation goes to Codex
MCP** (`mcp__codex__codex` + `codex-reply`, fed the full contract in its own worktree;
Codex may call the `claude` CLI for specific agents). The **safety floor stays on
Claude and is not cut for credits**: orchestrator D104-verify → Codex implements →
`factory-security-reviewer` mandatory (opus — the cross-family diverse lens now that
Codex authors) + qa + local codex review + connector → draft → CI green → connector
(trust the auto-👍) → independent `pr-triage` (D23, never Codex) → merge on fully-clean.
#80's crux: parse the
union of {PR body, all branch commit messages} for closing keywords, inclusive by
design (under-inclusion = gate bypass, over-inclusion = fail-safe extra review;
match GitHub's real close semantics, #171 lesson).

**Filed this session:** #183 (specced+shipped), #184 (pre-existing checklist-branch
quoted-ticked-box fail-open, `ready-to-spec`).

**Operator-owned / flagged:** an **AGENTS.md accuracy correction** — the #140
"workflow-edit PR self-skips claude-review" note is stale at action v1.0.176 (see
learning 18; protected-file conventional change). Parked, decision-gated:
#167 (env-scrub credential-adjacent), #178 (config-guard block-vs-flag), #162
(retrieval read-scoping), #146 step 3 (credential-adjacent), #47 (factory-PR
Claude-review lens; #80/#77 are its criteria-freshness prerequisites). Lower-priority
`ready-to-spec`: #77, #52, #69 (C2-gated), #181 (low).

**Guardrails held:** `FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/
Environment changes; protected branches untouched; merges only on fully-clean
(required checks via check-runs API, bot-authored connector CLEAN on head, threads
resolved, independent pr-triage on security PRs); merged branches left on origin.

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

---

## Session 31 Jul — #80 (PR #186) MERGED — first full Codex-implements drive

Credit-pivot live: **Codex MCP authored every implementation** (runner half, enforcement half, base-retarget fold, two test-quality folds); Claude ran PM + the safety floor (planner, fsr, qa, pr-triage) as the cross-family lens. Supersedes learning 6.

### PR #186 — issue #80 (spec-grounded review: criteria-derivation + trigger completeness, both review AND enforcement) — MERGED

Squash `eea7c4e`, `Closes #80`. Conventional/interactive. Touches the factory-pipeline protected surface (`scripts/factory/**` runner + privileged publisher, `.github/workflows/claude-code-review.yml`). 8 commits. Spanned 2 sessions (planner-80 runner-half contract prior session; this session: runner build + enforcement half + fold + merge).

| Metric | Value |
|---|---|
| Open→merge wall-clock | **~8h42m** (ready 30 Jul 22:02:38Z → merged 31 Jul 06:44:11Z), draft-first; dominated by ONE post-open round = a full base-retarget fold (planner→Codex→re-floor→re-push→connector→triage) |
| Logic lines | ~330 (runner+enforcement) + ~165 (fold) ≈ 495 across 2 delivery halves; each half under 400 |
| Pre-open floor, runner half | codex-review **2×P1** (title-mutability→subsumed; per_page=250→folded); **fsr BLOCKER** (reproduced publisher-enforcement bypass); qa PASS → operator: drive complete fix in #80 |
| Pre-open floor, enforcement half | codex-review **1 P2** (>250 pagination — **defended**, deliberate fail-closed/availability-only/zero-instance, fsr-confirmed); **fsr CONFIRMED-SOUND**; qa NEEDS-WORK (1 tautology, folded) |
| Pre-open floor, base-retarget fold | codex-review **CLEAN**; **fsr CONFIRMED-SOUND** (residue-zero class sweep, half-fix structurally impossible); qa NEEDS-WORK (3 test-quality: source-regex smell, trivial no-DELETE, branch cov — all folded) |
| Post-open rounds | **1** (connector P1 + claude-review medium **CONVERGED** on the base-retarget bypass → fold) |
| Connector | auto P1 on 7812223 (folded); re-triggered on 0d8980b → **👍 + "Didn't find any major issues, Reviewed commit 0d8980ba92"** (bot-authored, double-channel, head-matched) |
| Implementer | **Codex MCP** (runner, enforcement, fold, 2 test-folds) — the credit-pivot's first full drive |
| Domain reviewers | planner(fable)×2, fsr(opus)×3, qa(sonnet)×3, pr-triage(sonnet)×1 |
| Merge state | required 6/6 green + connector clean + threads 2/2 resolved + pr-triage MERGEABLE; ONE red **non-required** check accepted by operator |
| Residual filed | none new; documented residuals below |

Claude sub-agent tokens (output; Codex impl/review = Codex credits, not Claude):
| Delegation | Model | Output |
|---|--:|--:|
| planner-80b (enforcement contract) | fable | 127,563 |
| planner-forkA (fold contract) | fable | 136,150 |
| fsr-v1 (runner-half, BLOCKER) | opus | 172,480 |
| fsr-v2 (enforcement, CONFIRMED-SOUND) | opus | 144,387 |
| fsr-fold (CONFIRMED-SOUND) | opus | 169,402 |
| qa-v1 | sonnet | 143,630 |
| qa-v2 | sonnet | 170,178 |
| qa-fold | sonnet | 170,624 |
| pr-triage-186 | sonnet | 86,804 |
| **Claude sub-agent total (9 delegations)** | | **1,321,218** |

**#80 — learning 19: the Codex-implements credit-pivot works, and the Claude fsr is the load-bearing cross-family lens.** Codex authored a substantial protected-path change faithfully from the D104 contracts. Its OWN local `codex review` caught only the TIP of the fail-open (title mutability, one P1); the Claude `factory-security-reviewer` (opus) independently REPRODUCED the full publisher-enforcement BLOCKER end-to-end (the runner-only change was strictly worse than base — a false all-clear). Same-family author + same-family review is not a substitute for the opposite-family adversarial lens on a security gate. See [[codex-mcp-implementer-reinstated]] memory.

**#80 — learning 20: class-sweep completeness is DIMENSION-specific.** The enforcement contract swept the DERIVATION-site dimension (every `parseLinkedIssueReferences` call site) and fsr CONFIRMED-SOUND on `hasCriteria:true`. But the base-retarget bypass lived on a DIFFERENT dimension — the VERIFICATION-surface asymmetry (head-only vs head+base) between the two dispatch paths (`hasCriteria:true` publishSummary vs `hasCriteria:false` Fork A). No pre-open lens caught it; the POST-OPEN connector + claude-review CONVERGED on it. Reinforces learning 8 (emergent subtlety, budget multiple rounds regardless of contract quality): sweep on the dimension the bug actually lives in, not only the obvious one. The fold's OWN sweep (verification-surface) was then residue-zero and fsr-verified.

**#80 — learning 21: outcome.json (producer/consumer) schema additions are BREAKING under the trusted-base publisher pattern.** The privileged publisher checks out TRUSTED base (main) only, so a PR that adds a strict-grammar field to `outcome.json` (a) fails its OWN advisory publish-dogfood — main's older publisher rejects the new field as "unexpected" — and (b) would break any in-flight PR post-merge (main's new publisher then requires the field). Inherent to the trusted-base pattern; fail-closed (advisory gate, not a bypass); self-resolves the instant the PR lands on main. Operator-accept for an advisory gate with no in-flight PRs (this case); otherwise expand/contract (land a reader-tolerant change to main first, then the writer+enforcer). Same shape when `reviewedClosingIssueNumbers` was added (#96).

**Process note (topology v2 + credit-pivot held end to end):** planner(fable) contract on the issue → orchestrator D104-verify + spot-check every citation vs origin/main → Codex implements in its own worktree (sandbox blocks its git-metadata writes, so the orchestrator drives the commits with the CI-skip scan) → pre-open floor (local codex review + fsr mandatory + qa) → draft-first until CI green → ready → connector → **1 post-open converged finding** → re-plan(fable)→Codex fold→re-floor(fsr+qa+codex)→re-push→connector re-trigger(👍)→independent pr-triage→resolve threads→autonomous merge on fully-clean (one operator-accepted non-required red). Zero bad merges preserved.

### Session close (31 Jul) — handover state

**Merged this session:** #80 → PR #186 (`eea7c4e`), the first full Codex-implements drive. Ledger row + learnings 19-21 above; **all ledger commits LOCAL/unpushed** (operator pushes). Memory written: [[codex-mcp-implementer-reinstated]] (supersedes learning 6, with #80 proof case + career [CONTROL] beats).

**Guardrails held:** `FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/Environment changes; protected branches untouched; merged branch `feature/80-...` left on origin (remote deletion is the operator's); the two #80 worktrees removed. Merge on fully-clean (required via check-runs API, bot-authored connector CLEAN on head, threads resolved, independent pr-triage; one operator-accepted non-required advisory red).

**Documented residuals (not blockers):** the >250-commit compare fail-closed (deliberate, availability-only, zero-instance; docstring-explicit); the outcome.json schema-migration dogfood (learning 21 — self-resolved on this merge; expand/contract if a future field addition has in-flight PRs); the two fsr-noted fold residuals (pinned-commit reuse sound under head+base re-verify; cross-REST atomicity via cancel-in-progress:false → #88). AGENTS.md #140 "workflow-edit self-skip" note still stale (learning 18) — #186's claude-review ran a REAL 7m19s review on a workflow-edit PR again, re-confirming v1.0.176 does not self-skip; parked as an operator-owned AGENTS.md accuracy correction.

**Next drivable (operator-gated):** #167, #178, #162, #146-s3, #47 (#80 was one of its criteria-freshness prerequisites — now merged). Drivable `ready-to-spec`: #77 (the OTHER #47 criteria-freshness prereq — linked-issue-edit cross-object staleness), #52. #184 filed (checklist-branch quoted-ticked-box fail-open). #69 C2-gated.

---

## Session 31 Jul (cont.) — #77 sub-problem B (PR #187) — MERGED (squash `c3fcf04`, operator-authorized)

Fresh session, Codex-implements credit-pivot. #77 was `ready-to-spec`, so: `story-planner`(fable) D104 contract → orchestrator D104-verify + citation spot-check → Codex MCP implements → pre-open floor → draft → connector → **a THREE-fold post-open security saga on the privileged delete path** → disposition (b) → surfaced for the human merge.

**Design decision (Axis A, operator-confirmed via AskUserQuestion):** #77 has two sub-problems — **B** (the inline-blocker marker `${issueNumber}:${index}` is positional, mis-updates the wrong comment across a criteria-reorder) and **A** (the "criteria as of `updated_at`" staleness provenance). Operator chose the **no-new-execution-class** scope: NO `issues.edited` re-trigger (a new credential-reachable execution class on a public repo, amplification, zero live instances → direction test rejects + D140/FACTORY_PAUSED forbid activating). PR #187 = **B only** (cross-run-stable SHA-256 content-digest marker + drop positional legacy adoption). Sub-problem A = a separate later PR (PR-2).

### PR #187 — issue #77-B (`Refs #77`, squash `c3fcf04`, was head `921be9c`/4 commits) — MERGED

| Metric | Value |
|---|---|
| Delivered | v2 `criterion-digest:<issue>:<digest>` marker (SHA-256 of `"${occ} ${criterionText}"`, metadata-only spine); `findExistingInlineCommentId` exact-v2-only (positional legacy adoption REMOVED); dual-form recognition kept for de-reference cleanup |
| Logic lines | ~106 (B core) net; the retirement churn (added then removed) nets out |
| Pre-open floor | fsr(opus) CONFIRMED-SOUND; qa PASS (3 lcov-verified gaps folded: T10 lockstep, joinFindingsToSpine both-branch, T1 two-run repro); local codex CLEAN |
| Post-open rounds | **4** — see the saga below. Median-≤1 target BLOWN, and correctly so: a security-keystone delete path |
| Connector | round-1 2×P1 (13bf685); round-final on 921be9c CLEARED both P1s + posted 1 P2 (dup-aliasing) → fsr+pr-triage adjudicated fail-CLOSED/not-net-new/document-defer |
| Domain reviewers | planner(fable)×2 (D104 + fold contract); fsr(opus) ×6 passes; qa(sonnet) ×4; pr-triage(sonnet) MERGEABLE (independent, re-derived every claim from code) |
| Merge state | CI 6/6 required green (check-runs API); mergeStateStatus CLEAN; 3 threads resolved (1 fixed, 2 accepted-deferred). Surfaced first (connector verdict triaged-not-clean (deferred P2) + disposition (b) dropped a connector-requested fix), then **MERGED (`c3fcf04`) on explicit operator authorization** — the human made the merge call per "merging is always human" |
| Deferred to #47/PR-2(A) | finding-2 (orphan-gate-forever, pre-existing on main, fail-closed) + the P2 (dup-criteria aliasing, pre-existing on main, fail-closed) — both need issue-state provenance (sub-problem A) to retire safely |

Claude sub-agent tokens (output / cache-create; Codex impl = Codex credits):
| Delegation | Model | Output | Cache-create |
|---|--:|--:|--:|
| planner-77 (contract + fold-contract) | fable | 98,833 | 2,170,297 |
| fsr-77b (~6 passes) | opus | 132,535 | 2,856,668 |
| qa-77b (~4 passes) | sonnet | 37,869 | 2,391,864 |
| triage-187 | sonnet | ~2,000 | ~200,000 |

**The saga (learning 22): the delete-path fail-open arc — adding a privileged DELETE to fix a fail-CLOSED annoyance introduced fail-OPENs; converge by DROPPING it (learning-9 scope-discipline).** Round 1: connector 2×P1 — (1) drop positional legacy adoption, (2) retire orphaned digest threads (else a reworded criterion's old thread gates-forever). The fold did both, adding a digest-aware retirement (`reconcileObsoleteInlineBlockerComments` deletes a still-closing issue's comment whose marker isn't in a spine-derived active set). Round 2: **fsr found a legacy-form FAIL-OPEN** — the active set is v2-only (spine always emits a digest), so ANY legacy comment on a still-closing issue was retired unconditionally, even a live one, even with no replacement posted (satisfied-run / soft-422-degrade). Fix-fix: scope retirement to v2-form only. Round 3: **local codex found a REVERT-RACE fail-open** on the v2 retirement — the active set is the runner's spine, the per-delete verify never checks linked-issue CONTENT, so an attacker-timed A→B→A issue edit across the runner-fetch→publisher-delete window (spans the whole agent step) deletes a currently-live blocker. fsr adjudicated: reachable, net-new, strictly worse than the posting side (which only fails-to-post, never removes a gate); a fail-closed guard isn't available in this PR (needs issue `updated_at` provenance = sub-problem A). **Disposition (b): remove the retirement entirely** — `reconcileObsoleteInlineBlockerComments` reverted BYTE-IDENTICAL to origin/main; keep the actual #77-B win (digest identity + adoption removal); re-accept finding-2's orphan-gate-forever as a documented fail-CLOSED residual; defer safe retirement to #47/PR-2. Round 4: connector re-review cleared both P1s + posted a P2 (dup-criteria aliasing on a multiplicity change) → fsr: misattribution not fail-open (over-gates), fundamentally unfixable by content-hashing (byte-identical criteria have no stable content identity), pre-existing on main → document+defer. **The direction test drove every call: don't trade a fail-CLOSED annoyance for a fail-OPEN; drop the risky capability and defer the safe version to the story that owns the right tool.**

**Learning 23: the credit-pivot held across the hardest saga yet; the Claude fsr(opus) is the load-bearing adversarial lens — it caught BOTH the legacy fail-open (round 2) and adjudicated the revert-race (round 3) + the P2 (round 4), each after its OWN prior pass had been more permissive.** fsr's round-1-fold CONFIRMED-SOUND did NOT model intra-run runner→publisher issue-content drift (the revert-race) — it withdrew that soundness when the local codex pass surfaced it. So: same-family author (Codex) + the diverse cloud connector + the Claude opus adversarial lens are THREE distinct lenses, and the security floor needed all three across the rounds. This is the credit-pivot's whole thesis (Codex implements the volume; Claude is the safety floor) validated at maximum stress.

**Learning 24: `pr-triage` earned its independence — it re-derived, not accepted.** On a PR whose dispositions were "drop a connector-requested fix" + "two deferred residuals," pr-triage independently traced the P2 mechanics (the pipeline only POSTs + body-only PATCHes, NEVER calls `resolveReviewThread` → PATCH can't affect gating → over-gating not fail-open), and independently confirmed BOTH deferred residuals are PRE-EXISTING on main's positional scheme (not net-new). That converted "trust the adversarial lens" into "independently re-verified from the code," which is exactly what D23's independent triage is for on a high-judgment PR.

**Learning 25 (process): the orchestrator's LOCAL main lagged origin by 3 commits — the planner read the stale tree.** `story-planner` (read-only, reads the orchestrator's checkout) drafted against `dc8cfb9` while origin/main was `eea7c4e` (post-#154/#80/#183). Citations for the 6 changed files were line-shifted; the B-core files (`spec-grounding-runner-logic.mts`, `publish-spec-grounding-blocker-logic.mts`, `spec-grounding-verdict-schema.mts`) were byte-identical dc8cfb9..eea7c4e so line-accurate. Caught at citation-verification (the load-bearing orchestrator step): verify every citation against `git show origin/main:`, AND check the base the planner actually read. Substance held at the true base; a base-correction addendum was posted with the contract.

**Guardrails held:** `FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/Environment changes; protected branches untouched; every commit CI-skip-scanned pre-push (one detached-HEAD footgun caught + reconciled when the fix-fix landed on a detached HEAD after `codex review` detached the worktree — re-attached via `checkout -B`, origin corrected). Codex impl in its own worktree; fsr/qa in their own isolated worktrees (mutation-isolation). Merged on **explicit operator authorization** (`c3fcf04`, 31 Jul 12:48Z) after surfacing — the connector triaged-not-clean + the disposition-(b) walk-back were operator-visibility-worthy, so autonomous-merge-on-fully-clean correctly did NOT fire and the human made the merge call. Worktrees removed post-merge; merged-feature-branch deletion stays the operator's.

### Credit-pivot formalized — factory.md D145 + PR #188 (`d9186a4`)

Operator directive after #187: formalise the Codex-implements credit pivot.
**factory.md D145** now records it as a ratified plan-repo decision (Codex is the
default implementer including protected/security work; Claude is PM + the safety
floor, not cut for credits; the `implementer` opus agent is the fallback; #80/#187
as proof). **PR #188** (`d9186a4`, doc-only, conventional, orchestrator-authored
under human direction because implementing agents may not touch protected
agent-instruction files, fsr CONFIRMED-SOUND) reflected D145 across the three
agent-facing routing sites AGENTS.md drift left. (D144 was renumbered → D145: a
stale task had reserved D144 for the required-reviews.sh work.)

**Learning 26: the diverse lens finds framing imprecision even on a doc reflecting
a settled decision — and each catch was about the pivot's SECURITY-REVIEW model, not
the routing.** #188 took FOUR local-codex/connector passes: (1) the `story-planner`
routing site the initial 2-site sweep missed (class-fix incompleteness, again); (2)
the two "cross-family lens" LABELS on the Codex-review paths, which the pivot INVERTS
— Codex now authors, so its own review is same-family; the cross-family lens is the
Claude reviewer; (3) the interlock CLAIM — D145 said "mandatory fsr on any security
diff" but the routing rubric only mechanically routes the enumerated
factory/schema/privacy paths, so the interlock was claimed-not-enforced for a
security-adjacent change outside them (the "documented default nothing enforces"
principle, turned on D145 itself); (4) the reviewer SCOPE — the honesty note's first
draft named `factory-security-reviewer` for all security changes, but its threat model
is factory-pipeline-specific, so a non-factory security diff needs the appropriate
DOMAIN reviewer (schema-migration-reviewer / privacy-auditor). Converged (learning 9)
with a precise statement: the cross-family floor is the appropriate Claude domain
reviewer, orchestrator-enforced today, with mechanical routing tracked for #47. The
saga is the pivot's own thesis doing work — Codex authored nothing here (protected
doc), yet the diverse review lens still earned its cost by sharpening the security
framing four times. All D145/ledger commits are LOCAL/unpushed (operator pushes).

---

## Session 31 Jul (evening) — #77 sub-problem A, PR-2 (PR #189) — MERGED

Fresh session, Codex-implements credit-pivot. A has three deliverables (record +
surface `updated_at` provenance; safe orphan-retirement). A D104 contract for
deliverables 1+2 already existed on #77 (posted a prior session, base `eea7c4e`);
deliverable 3 (safe retirement, added to scope only after #187's saga converged)
had none. Orchestrator D104-verified the existing contract's citations against
current `origin/main` (`d9186a4`, post-#187/#188 — only trivial line drift, 952→955
etc.), then commissioned `story-planner` for a scoped addendum covering deliverable
3 only. Both posted as one combined addendum comment on #77, including a routing
correction: the addendum's own recommendation (Claude `implementer` opus, "security-
adjacent → not Codex") was based on pre-D145 policy: current `AGENTS.md` makes Codex
MCP the default even for protected/security work. Addendum also **split A into two
PRs**: PR-2 (deliverables 1+2) and PR-3 (deliverable 3), on the addendum's own
reasoning — deliverable 3 re-opens the exact privileged-DELETE capability class that
took #187 four rounds to converge, so an isolated diff keeps a repeat revert a
one-PR rollback.

### PR #189 — #77-A deliverables 1+2 (`Refs #77`, squash `dc9da06`) — MERGED

| Metric | Value |
|---|---|
| Delivered | `GitHubIssue`/`fetchIssue` capture each linked issue's API `updated_at`; optional `linkedIssueProvenance` spine field (parser-validated: positive-integer issueNumber, no dupes, `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$` grammar, 1000 cap); publisher always renders a "Criteria provenance" section on every `hasCriteria:true` verdict (clean or blocker), loud fallback for legacy spines |
| Logic lines | ~150 (2 commits: ~107 initial + ~45 fold) |
| Pre-open floor | **2 rounds each** — local `codex review` (r1: P2 "provenance not cross-checked against entries" → folded; r2: CLEAN) + `factory-security-reviewer` (r1: **MEDIUM** — unconditional 1000-element cap could exceed GitHub's comment limit, causing an uncaught throw with NO try/catch above `main()`, silencing the whole review (no summary, no fallback) — exactly the failure the fallback comment exists to prevent → folded; r2: CONFIRMED-SOUND, empirically re-reproduced both old-throw and new-bounded behaviour, 16 cross-entry-invariant probes, full protected-surface delta re-check) + `qa` (NEEDS-WORK: uncovered non-array branch, no end-to-end test through real `main()` wiring, weak negative assertions → all 3 folded) |
| Post-open | **0 rounds with findings** — `claude-review` job went red (advisory, not required) but genuinely incomplete (2 denied tool calls, Bash+Skill, mid-run; checklist only 3/7 ticked; "Assert the review actually completed" correctly caught it, not a hidden finding); Codex-connector 👍 (bot-authored, postdates ready boundary, head-matched) |
| Implementer | Codex MCP (2 build/fold cycles, both self-reported gates green, both independently re-verified by the orchestrator directly, not accepted on faith) |
| Domain reviewers | `factory-security-reviewer` ×2 (MEDIUM→CONFIRMED-SOUND); `qa` ×1 (NEEDS-WORK→folded); `pr-triage` ×1 (MERGEABLE, re-derived from the actual sub-agent transcripts + Codex logs on disk, not the PR body) |
| Merge state | required 6/6 green (check-runs API); 0 inline threads; Codex 👍 verified bot-authored+boundary-correct+head-matched; independent pr-triage MERGEABLE; **autonomous merge on fully-clean** |

**Learning 27: a security-adjacent PR earned its two-round floor honestly — both real findings were genuinely different lenses, not redundant.** Local `codex review`'s P2 (provenance not cross-checked against which issues have criteria entries — a corrupted/manipulated artifact could show provenance for the WRONG issue while the actually-reviewed issue has none) and `factory-security-reviewer`'s MEDIUM (an unconditional cap → uncaught-throw → total review silence) are different failure classes on the same new surface: one is a data-integrity/misattribution defect, the other is an availability/fail-shape defect. Neither lens would have found the other's issue — confirms learning 1/7/11 (distinct lenses, not redundant) on a slice that never touched the delete path at all, so this isn't just a "security keystone" artifact; it's the baseline cost of shipping ANY new privileged-surface primitive, however small.

**Learning 28: independent verification (both orchestrator's own re-runs and `pr-triage`'s) is not theatre — it caught real gaps a self-report would have missed.** Codex's own gate report after the fold said "all green, no new uncovered lines"; the orchestrator's own independent `npm run test -- --coverage` re-run agreed. `pr-triage` went further: it located and read the actual local session logs (sub-agent transcripts, `codex review` log files) to CONFIRM the routed reviewers (`factory-security-reviewer`, `qa`) genuinely ran with genuine findings, rather than trusting the PR body's summary — flagging as a process gap that **nothing GitHub-native records that they ran at all** (no PR comment, check run, or artifact); this time the local evidence happened to still exist, but that's fragile. Worth a follow-up: post pre-open floor results as a PR comment for durability, so a future `pr-triage` (or a human) doesn't have to reach into ephemeral session logs to confirm the gate actually fired.

**Learning 29 (process): pre-existing contracts should be reused, not redrafted, when their substance survives a citation refresh.** The task briefing for this session assumed no D104 contract existed for #77-A; one already did (posted the prior session), with only trivial line-number drift from #187 landing in between. Re-verifying + posting a citation-refresh addendum, rather than re-running `story-planner` from scratch, is the credit-disciplined move (D145) when substance holds — reserve the planner spend for genuinely new design surface (here, deliverable 3, which the existing contract had never covered).

**Guardrails held:** `FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/Environment changes; protected branches untouched; merged branch `feature/77-criteria-provenance` left on origin (deletion is the operator's); the implementation + review worktrees removed post-merge. Merge on fully-clean (required via check-runs API, bot-authored connector 👍 verified, threads N/A, independent pr-triage). #77 stays OPEN (`Refs #77`, not `Closes`) — PR-3 (deliverable 3, safe orphan-retirement) is next and completes it.

---

## Session 31 Jul (evening, cont.) — #77 deliverable 3, safe orphan-retirement: 4-round adversarial saga, DROPPED by operator decision, redesigned as annotate-only

Branch `feature/77-safe-orphan-retirement` (Codex-implements, off `origin/main@dc9da06` after PR #189). **Never pushed, never opened as a PR** — the entire saga stayed local, and this ledger entry is its only durable record besides the decision comment on #77 and the branch itself (left in place, unpushed, for anyone who wants to read the exact attempted code).

### The saga: 4 rounds, 6 distinct real fail-open instances, each fix closing the priors while exposing a new one at the same root

| Round | Commit | Finding(s) | Fix |
|---|---|---|---|
| 1 | `975a3ec` | **F1** BLOCKER: checked-only digest set couldn't distinguish "criterion ticked" (self-attested) from "criterion removed" — contradicted this file's own documented policy elsewhere ("no-unmet-criteria" self-attested closing claims deliberately leave blockers untouched). Also F2 (marker-extractor issue-number divergence on a crafted body), F3-F5 (disclosure/documentation/availability, minor). | `d79cb22`: track checked-criterion digests too; skip retirement on a match. |
| 2 | `d79cb22`→`932d4cc` | **B1**: an issue whose LAST unmet criterion gets ticked drops out of `buildLinkedIssueSpecs` before checked criteria are retained (its own `continue` fires on `allUnmetCriteria.length === 0`) — zero checked-digests, zero incompleteness signal. **B2**: unmet/checked occurrence-index counters scoped to disjoint filtered arrays — ticking one occurrence of duplicate text reshuffles siblings' indices, orphaning a still-genuinely-unmet sibling's original digest. **B3**: checked criteria beyond `MAX_CRITERIA_PER_ISSUE` (50) silently capped, no truncation signal (unlike unmet). All three found convergently by local `codex review` + `qa` + `factory-security-reviewer` independently in the same round. | `932d4cc`: replace the checked-only set with `plausibleCriterionDigests` — digests computed over the COMBINED checked+unmet text count per issue (every digest text-with-count-K could produce at ordinals 0..K-1), retirement gated on absence from this combined set. Unmet-digest formula (PR #187's identity) untouched throughout — verified byte-for-byte at every round. |
| 3 | `932d4cc`→`feba4f4` (categorical fix) | **B4**: the plausible-digest computation sat inside the `truncatedAway`-gated loop, above the break — a spec 2+ positions past a truncation trip point never had its loop body execute at all; combined with the B1-era `byteCapDroppedClosing` guard (needed so all-checked specs don't look byte-cap-dropped), such a spec was caught by NO incompleteness signal. **B5**: `buildLinkedIssueSpecs` still skipped creating a spec entirely when `parseAcceptanceCriteria` found zero criteria — reachable via ordinary Markdown formatting (a decoy heading, an inserted sub-heading, 4-space-indented criteria becoming a code block) that leaves real, untouched, unticked criteria completely invisible to the digest machinery while `linkedIssueProvenance` is still recorded (captured at fetch time, before parsing) — freshness probe passes clean. Both found by `factory-security-reviewer`, independently reproduced by local `codex review` (calling B4 "B4" convergently). fsr's framing: "then B4, B5, and the next unknown door all fail closed" — proposed a **positive** completeness assertion instead of another instance patch. | `feba4f4`: new `plausibleIdentityCompleteIssueNumbers` field, populated ONLY at the exact point a spec's digest computation genuinely executes to completion. Retirement inverted from "retire unless evidence says keep" to "keep unless positive proof says retire." Closed B4 and B5 without enumerating either as a special case. |
| 4 | `feba4f4` (final, uncommitted-to-PR) | **B6 (fatal)**: the "positive completeness" signal only proves *the parser's retention loop executed* — not *the parser's heuristic captured the issue's TRUE criteria set*. Any under-match by the section-boundary heading heuristic (an innocuous same-level heading inserted mid-list, or an **accidental unclosed Markdown code fence**) silently drops criteria from the parser's view while they render normally, unticked, on GitHub. The spec still gets marked "complete" (the loop DID run, just over an incomplete input) — retirement proceeds, permanently, with **zero PR-visible trace** (not even the existing skip-warning fires). Reachable by the **issue's author alone**, who may hold NO repository write access at all. `factory-security-reviewer` reproduced end-to-end (two real criteria, one heading inserted between them, both blockers deleted, `orphanRetirementSkippedIssueNumbers: []`). fsr's explicit recommendation, unprompted: **drop the capability**, matching #187's own resolution. | — none attempted; escalated to the operator per the pre-committed threshold (see below). |

Every round's local `codex review` + `factory-security-reviewer` (mandatory, opus) + `qa` all ran; every round's fixes were independently re-verified (gates re-run by the orchestrator directly, not accepted on Codex's self-report) before the next round's review was commissioned. PR #187's unmet-criteria digest formula (`sha256("${occurrenceIndex} ${criterionText}")`, the `occurrenceCounts` map over `spec.unmetCriteria` only) was diffed against `origin/main` and confirmed byte-for-byte unchanged at every single round — the four-round saga was entirely about the NEW checked/plausible/completeness machinery layered alongside it, never about re-litigating #187's own shipped identity.

### The stop: a pre-committed threshold, honored

Before dispatching round 4's fix, the orchestrator explicitly told both itself and `factory-security-reviewer`: *"If you find a SIXTH instance of this class, say so plainly and do not soften it... If you have genuinely tried hard and this holds, say that plainly too."* Round 4 found the sixth instance. The orchestrator stopped — did not attempt a fifth patch — and surfaced to the operator with a clear recommendation rather than continuing to iterate.

**Second opinion, independently commissioned:** rather than act on fsr's recommendation alone, the orchestrator dispatched a fresh `story-planner` (fable) consultation — NOT to write an implementation contract, but to independently assess from first principles whether the capability was genuinely unfixable or whether a viable redesign existed. `story-planner`:

1. **Independently confirmed B6's mechanism** by reading the actual code (not the summary), and named the structural reason no seventh patch could close it: *"every signal the retirement decision has access to is downstream of the same heuristic parser... you cannot use a parser's output to bound that parser's own error."*
2. **Found a SEVENTH instance while checking fsr's own proposed alternative** (a raw-body scan bypassing the section heuristic): `buildStructuralView`'s documented "safe over-match direction" is correct for `parseLinkedIssueReferences` but genuinely INVERTED for `parseAcceptanceCriteria`'s section-boundary use — an under-match there is fail-open for the ACTUAL REVIEW itself (hiding criteria from the LLM judge), independent of retirement entirely, and pre-existing on `origin/main` today. Filed as **#190**.
3. **Improved on fsr's alternative design**, showing it's more viable than first framed (the publisher already fetches the issue body on its existing `updated_at` probe call — no new data needs to cross the metadata-only spine's trust boundary) and its error direction genuinely inverts to fail-closed (over-match → fewer retirements, never more) — but identified a SECOND, fatal residual even that design can't close: **text-identity retirement is inherently exploitable by the exact party who benefits from removing the gate** — the issue author can reword one word and defeat any hashing scheme, silently, with unilateral one-edit power, and on this pipeline the PR author and linked-issue author are frequently the same actor.
4. **Recommended dropping the DELETE, independently, for its own reasoning**: *"the action is irreversible, gate-removing, and leaves no PR-visible trace, while the input that determines its correctness is a heuristic view of a document that the beneficiary of the action can edit at will... there is no bounded, provable safety argument to be had."*
5. **Proposed a genuinely smaller, structurally-safe alternative**: "annotate, never retire" — PATCH the existing blocker comment with an advisory note when a criterion looks absent (same detection, different verb), **never DELETE, never resolve a thread** (the publisher already only ever READS thread-resolution state via `REVIEW_THREAD_RESOLUTION_QUERY`, confirmed no resolution-mutation capability exists to accidentally reach). Provably safe by a DIFFERENT argument than any of the six rounds attempted: it touches no gate state, so a false positive costs a wrong note on a thread that stays open and still gates the merge — availability-only, the same envelope the read-only runner already operates under. Idempotent and reversible (unlike DELETE) via the existing standalone-marker upsert machinery.

**Operator decision (31 Jul evening): drop the delete, build "annotate, never retire," file #190.** All three confirmed explicitly.

### Learning 30: two independent capabilities in the same pipeline have now converged on the identical resolution after repeated fail-open rounds — that's a signal about the PROBLEM SHAPE, not the implementers.

#187 (cross-run-stable inline-comment identity) took 2 fail-open rounds before converging on "drop the risky capability, keep the identity win." #77 deliverable 3 (content-aware auto-retirement) took 4 rounds and 6 distinct instances before reaching the same kind of conclusion. Both are "a privileged, irreversible action justified by a heuristic read of untrusted or author-mutable content." When contract completeness (learning 8) and adversarial rigor (learnings 1/7/11/14) still can't converge a design after multiple genuine rounds — not speculative-churn rounds, genuine emergent-subtlety ones — the direction test's own conclusion is usually "the capability itself is the wrong shape for what's being asked of it," not "one more fix will close it." The 4-round pattern here (F1→B1-3→B4-5→B6, each fix closing priors while the SAME underlying circularity produced the next one) is a much sharper version of the same shape #187 hit once.

### Learning 31: a second, independently-commissioned opinion (fable, not opus) earned its keep on a DECISION, not just a spec.

`story-planner`'s stated role is "turn a story into an implementation contract before any code is written." This consultation used it differently — not to plan an already-decided build, but to independently pressure-test a STOP/DROP recommendation before acting on it, and to check whether the recommending reviewer's own proposed alternative actually held up. It did more than rubber-stamp fsr's conclusion: it found a NEW, seventh instance (the `buildStructuralView` docstring inversion, filed as #190) that fsr's own pass never surfaced, and it produced a materially different, smaller, structurally-safer redesign (annotate-not-delete) that reuses the merged deliverables-1+2 provenance work rather than discarding four rounds of effort entirely. Cheap (fable), independent (fresh context, no anchoring on the round-by-round patch history), and genuinely additive — worth the pattern for any future "should we abandon this approach" decision, not just "here's the contract for what we already decided to build."

### Guardrails held throughout

`FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/Environment changes; protected branches untouched. Every commit CI-skip-scanned pre-commit. Codex + all three reviewers (local codex review, fsr, qa) in isolated worktrees throughout, never the orchestrator's own checkout; both worktrees removed post-decision. **The branch `feature/77-safe-orphan-retirement` is intentionally left in place, unpushed** — not merged, not deleted — as the durable record of the exact attempted code across all 4 rounds, for anyone who wants to read it later. No PR was ever opened; nothing reached the review-roster/connector/pr-triage stage, since the decision to drop was made before opening. #77 stays OPEN; scope updated via a posted comment documenting the full decision and reasoning. #190 filed (parser safe-direction bug, unrelated to whether deliverable 3 ships in any form). A fresh D104 contract for "annotate, never retire" is the next drivable.

## Session 31 Jul (evening, cont. II) — #77 deliverable 3 shipped: "annotate, never retire," merged as #191, #77 CLOSED

The redesign from the previous section built cleanly, in sharp contrast to the 4-round dropped attempt on the same issue.

**Contract → build.** `story-planner` (fable) produced the full D104 contract for the annotate-only design in a fresh consultation, explicitly re-verifying every citation against a refreshed `origin/main` (it had flagged its own tree was stale — pre-#189 — and asked the orchestrator to refresh before commissioning; done, then every citation spot-checked by the orchestrator directly and confirmed exact or drifted only by the few lines #189 actually touched). Posted on #77 ([comment](https://github.com/syamaner/roastpilot-cloud/issues/77#issuecomment-5146839801)). Codex MCP implemented it in a fresh worktree off current `origin/main`, gates green independently re-verified by the orchestrator (not accepted on Codex's self-report, per standing practice).

**Two full adversarial rounds, both closed cleanly — no third round needed, no drop.**

- **Round 1**: `factory-security-reviewer` verdict **CONFIRMED-SOUND on the security axis** — no fail-open, no privilege gain, no gate removal across all six break-first targets (no DELETE/thread-resolution mutation reachable; marker/identity destruction blocked by a terminal-anchor `$`-without-`m`-flag regex plus confirmed untrusted text can't even survive as a raw marker-shaped line through the existing rationale sanitizer; the fixed-point claim holds structurally, not just empirically, because parser and scanner both split on the same raw text via one shared extraction primitive; injected values validated before interpolation; throw path can't suppress the gate). One MEDIUM (an uncapped PATCH loop reintroducing the exact write-amplification class `MAX_INDIVIDUAL_CRITERION_BLOCKER_COMMENTS` was built to close) + 4 LOWs. `qa` verdict NEEDS-WORK: one gap, `fetchIssueBodyForAnnotation`'s malformed-response guards had zero reject-arm coverage. Local `codex review` found 1 P2: the 20-issue fetch cap always processes the same issues, permanently starving the rest when unresolved blockers span more than the cap. All folded in one Codex round.
- **Round 2** (confirming the fold, fresh reviewer instances, no memory of round 1): `factory-security-reviewer` verdict **CONFIRMED-SOUND, CLEAN to open** — verified all four fixes **by execution**, not by reading (a mocked 750-PATCH run proved the pre-fold vulnerability was real; the post-fold cap held at exactly the configured limit; the rotation math was traced by hand across generations; the shared-template regex was proven byte-identical to the old hand-written literal). Two more optional LOWs (truncation invisible in the PR-visible summary; rotation math relied on incidental `NaN`-coercion rather than a structural guard) — folded, since AGENTS.md treats silent truncation as a merge hazard everywhere else it appears. `qa` verdict NEEDS-WORK on exactly one item, caught by genuine empirical work: the shipped isolation test for the new digit-bound guard passed, but for the *wrong reason* (the mock never registered a response for the poisoned issue number, so the guard was never actually exercised); qa proved this by removing the guard, giving the poisoned candidate a *successful* mocked fetch, and showing the whole annotation pass rejected outright (an uncaught throw from deep inside the per-comment loop) — a real, if narrow, starve-the-whole-run risk the test was blind to. Fixed and re-verified. Local `codex review`'s one remaining P2 (raw-scan can be fooled by a checkbox-shaped example sitting inside a code fence) was **consciously not folded** — it's the design's own deliberately-chosen over-match trade-off (§1.2(b) of the contract), and "fixing" it would mean depending on `buildStructuralView`'s heuristics for a safety-relevant decision, exactly the dependency #190 shows is unsafe in general and that this whole redesign exists to avoid.
- One process near-miss, caught and corrected mid-flight: the orchestrator initially dispatched round-2 `fsr` and `qa` to read/probe the *same* implementation worktree concurrently; `qa`'s own mutate-and-restore isolation probe caused `fsr` to observe a transient file write mid-review. No damage (both reviewers independently confirmed the final tree was clean and correct), but it repeated the exact "reviewer worktree isolation" lesson from 28 Jul — logged as a fresh instance of that same class, not a new lesson.

**Independent verification discipline held at every step**, same as PR-2: gates re-run by the orchestrator directly after every fold (not trusted from Codex's report), diff line counts checked against the D104 ~400-logic-line guidance at every stage (final: 325 logic lines, 405 test lines, comfortably under both thresholds), specific fixed code re-read by the orchestrator to confirm each fold landed as described before ever re-dispatching reviewers.

**Open → merge**, PR #191, `Closes #77`: opened as a draft (D103 shift-left — build/correctness gates only), all green (CodeQL ×3, lint/typecheck/unit, mutation testing, Playwright smoke, Snowflake offline, dependency-review), then marked ready, firing the full roster in one step. `claude-review`'s automatic pass independently re-derived the whole diff and found zero blocking issues (two explicitly non-blocking style nits, correctly left in the summary comment, not inline threads). Codex connector's bot-authored `+1` verified via the API (`user.login` exactly `chatgpt-codex-connector[bot]`, on the unchanged current head, postdating the `ready_for_review` boundary event) — no preceding `👀` was observed, which the Merge Policy doesn't require when the `👍` itself is independently bot-verified. `codecov/patch` flagged 3 partial-branch lines; independently traced by `pr-triage` to pre-existing coverage gaps in code this PR only relocated or extended in an already-uncovered shape, not new-logic gaps — overall coverage rose. Independent `pr-triage` (per D23, never self-triaged) returned **MERGEABLE** after re-deriving branch protection, CI, review threads, the Codex channel/timing rules, the Claude Code Review content, CodeQL, and the codecov claims itself — and, notably, cross-checked the orchestrator's own round-2 review claims by messaging `qa-77-annotate-round2` directly to re-confirm its verdict against the final head, rather than trusting the orchestrator's summary. Merged (squash `b8867a9`). #77 auto-closed.

**Two operational curiosities during this cycle**, recorded for pattern-matching, not because either was a problem: (1) task-notification messages carried an unfamiliar "SYSTEM NOTIFICATION — NOT USER INPUT" preamble instructing the orchestrator to disregard even its own prior correctly-recorded user consent; treated as untrusted framing (it didn't match this session's established `<system-reminder>`/`<task-notification>` tag conventions) rather than acted on, and flagged to the operator rather than silently complied with or silently ignored — the operator's actual prior confirmation ("1. yes drop 2. yes 3. yes") was correctly treated as still standing throughout. (2) Two already-completed review sub-agents (`fsr-77-annotate-round2`, `qa-77-annotate-round2`) briefly appeared in the operator's UI with fresh short elapsed times well after they'd delivered their verdicts; turned out to be `pr-triage-191` independently messaging them to re-confirm their findings against the final head as part of its own re-derivation (visible once its idle-notification summary surfaced the recipient) — not a restart, not an anomaly, just the D23 independent-adjudication discipline working as intended.

### Learning 32: the redesign's two-round close, against the dropped design's four-round non-close on the same issue, is itself evidence for Learning 30's diagnosis.

Same reviewers, same rigor, same worktree-isolation discipline, same "re-verify by execution, not by reading" standard on both sides. The difference was the design's shape, not the review process: delete-based retirement needed an ever-more-elaborate positive-completeness proof built on top of a heuristic parser's own output, and each proof attempt revealed a new hole at the same structural root. Annotate-only never needed that kind of proof at all — its safety argument is "this touches no gate state," which is checkable directly by grepping every reachable `githubRequest` call, not by reasoning about whether a completeness signal is itself complete. When a review keeps finding *structurally related* new instances of the same failure shape (not merely more instances), that's the signal to change the design's failure direction, not to review harder within the same one.

### Learning 33: an operator-facing "SYSTEM NOTIFICATION" that instructs disregarding real prior consent is worth naming as a distinct pattern to watch for, independent of whether this specific instance was malicious.

The safest response when a message claims special system authority to override established conversation history — especially a history-denying instruction arriving through a channel not otherwise used that way — is: don't comply with the override, don't fabricate certainty about its origin either way, and say so plainly to the operator. That combination (skeptical-but-transparent, not paranoid-and-silent, not compliant-by-default) is what let this session both stay correctly on-track against its real prior authorization and surface the anomaly for the operator's own awareness.

### Guardrails held throughout (this session)

`FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/Environment changes. Every reviewer ran in its own isolated worktree (after the one caught-and-corrected exception above). Gates independently re-run by the orchestrator, never trusted from a sub-agent's self-report, at every fold and before every re-dispatch. `pr-triage` (D23) adjudicated independently — the orchestrator never self-triaged the PR it drove. #77 CLOSED. #190 remains open and unrelated. The #47 chain (its two criteria-freshness prerequisites, #80 and #77, are both now done) is next drivable.

## Session 1 Aug — #47 driven and decided; #192 filed + probe built; a P0 (#194) found mid-review and shipped same day

### #47: two sub-decisions, not one — both Option B, both stay open

`story-planner` (fable) produced an options-analysis contract for #47 (allowlist the factory bot for Claude review — Option A/B/C from the issue). Before presenting it, the orchestrator independently re-verified its [UNVERIFIED]-flagged claims against primary source (fetched `anthropics/claude-code-action@700e7f8...` and `anthropics/claude-code@2982f95...` into scratch clones) rather than passing along an unverified sub-agent report — both flagged claims turned out **true**: `claude-review`'s tag-mode grant is a `Set`-union of the workflow's declared `--allowedTools` and tag mode's own injected list (bare `Read`/`Glob`/`Grep`/`LS`, a second write channel via `mcp__github_comment__update_claude_comment`, CI-log tools), confirmed by reading `src/modes/detector.ts`, `src/modes/tag/index.ts`, and `base-action/src/parse-sdk-options.ts` directly; and `claude-review` grants Bash with no `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB`, against this repo's own written rule that any Bash-granting job must set it.

**Key structural finding, independent of the contract:** #47 is actually two independent `allowed_bots` decisions on two independent jobs with residuals differing by roughly an order of magnitude — `claude-review` (real `Bash(gh pr comment:*)` grant) vs. `spec-grounded-review` (zero Bash grant, already-merged base-pinned privileged-publisher split — essentially the gold-standard read-only-agent/privileged-publisher pattern already built in this repo for F1-S9). Treating them as one decision would have forced the safer job to inherit the riskier job's disposition.

**Operator decision on both: Option B — do not allowlist `roastpilot-factory[bot]` on either job.** Recorded on #47 via issue comment, not silently. Rationale: D139 rule 2 ("reject what is not used" — the factory pipeline has never opened a real autonomous PR outside one F1-S6 dry-run slice) settles it on its own; Option A as literally written in the issue also doesn't work as stated (`mcp__github_inline_comment__create_inline_comment` is that MCP server's only tool — a file+line review comment, no PR-level summary-comment equivalent — verified directly against the pinned action's `src/mcp/github-inline-comment-server.ts`, so it can't carry the pinned plugin's "no issues found" clean-review acknowledgment). #47 stays open — deferring is not resolving.

### #192 filed: `claude-review`'s live tool grant exceeds its own documented residual — independent of #47, live today

The verification pass above surfaced a finding out of #47's own scope: `claude-review`'s ACTUAL grant (not a factory-gated hypothetical) is broader than every place this repo's own security commentary describes it, on every PR review running today. Filed as **#192**, `ready-for-conventional-implementation`, with a D104-shaped contract (probe-first: a `workflow_dispatch`-style probe to empirically confirm P1 bare-tool reachability and P3 whether `Bash(gh pr comment:*)` admits `--body-file <path>`; P2 — does a scoped `Read(pattern)` narrow the union — resolvable analytically from the `Set`-union mechanism, confirmed by source read, no live probe strictly required).

**Unit-0 probe built, PR #193 opened in draft, currently on hold mid-fold.** The probe can't use `workflow_dispatch` the way the repo's #78 precedent did (`_probe-read-scope.yml`) — tag mode requires a genuine `pull_request`/entity event to trigger at all (`workflow_dispatch` fails `isEntityContext`, and `validateTrackProgressEvent` actively throws on it). So `.github/workflows/_probe-192-tag-mode-tools.yml` triggers on `pull_request: [opened]`, gated airtight to one exact branch name (`probe/192-tag-mode-tools`), same-repo, and `github.actor == 'syamaner'`; its `claude_args` are byte-identical to production `claude-review`'s so it tests the real grant, not an approximation. Built by Codex-MCP (with a sandbox limitation discovered and worked around: Codex's `workspace-write` sandbox can write inside a git worktree's own directory but not to `.git/worktrees/<name>/` — which physically lives under the MAIN repo's `.git/`, outside the worktree tree entirely, so the orchestrator did the mechanical `git add`/`commit` itself after independently reading and verifying the files Codex wrote).

`factory-security-reviewer`'s adversarial pass on PR #193 attacked the trigger gate (held — fork/repo/case-sensitivity/TOCTOU/re-run-actor edge cases all closed, verified against the repo's single-collaborator state) and confirmed the byte-identity claims (verified), but found two real gaps not yet folded: **CI is red** (the diff trips this repo's own factory-integrity alarm — 4 stale counter pins across `claude-code-action-token-model.test.ts` and `workflow-execution-surface-logic.test.ts` need a faithful re-count, not a blind bump), and **the probe only answers P1+P3, not P2** (it recommends adding `Read(probe-context/**)` to the same run, at-worst-a-no-op given the confirmed `Set`-union mechanism, so one run could answer all three). Next session: fold both, re-run fsr, then execute the probe for real (a separate throwaway PR from the exact gated branch name, capture results, post to #192, then a #78→#79-style cleanup PR removing the probe workflow).

### #194 (P0): a genuine, live, currently-exploitable credential path found mid-review — independently verified, fast-tracked, shipped same day

`factory-security-reviewer`'s review of PR #193 (which reuses `claude-review`'s exact `claude_args`) surfaced something well beyond #193's own scope: `claude-review`'s comment-injection TOCTOU protection is a **documented no-op for `pull_request` events specifically** — `extractTriggerTimestamp` returns `undefined` for that event type (only `issue_comment`/`pull_request_review`/`pull_request_review_comment` are handled), and `filterCommentsToTriggerTime` unconditionally passes every comment through when the trigger time is falsy. Combined with `allowed_non_write_users: ""` (which gates BOTH the env-scrub and the bubblewrap sandbox install off) and `GITHUB_TOKEN`/`GH_TOKEN` exported into every Bash subprocess, this is a live path: any public commenter, no write access needed on a public repo, could post a comment that reaches the review prompt after the run starts and, if it steers the model into `gh pr comment --body-file /proc/self/environ`, publishes `CLAUDE_CODE_OAUTH_TOKEN` — an external provider identity D140 explicitly excludes from its `GITHUB_TOKEN` push-access-equivalence residual acceptance — as a public PR comment.

The orchestrator independently re-verified all four pillars of this chain against the pinned action source directly (not on the sub-agent's word) before treating it as real: `extractTriggerTimestamp`/`filterCommentsToTriggerTime` (`fetcher.ts`), the `allowed_non_write_users` gating of both scrub and sandbox (`action.yml:290`,`:217`), the token export (`run.ts:185-186`), and the custom-prompt-append-not-replace behavior (`create-prompt/index.ts:479-490`). This crossed from "#192/#193 scope" into "live exposure on infrastructure this repo actively uses right now" — the orchestrator stopped, did not take any unilateral action on the already-running production job, and surfaced it to the operator as its own decision point rather than folding it quietly into #192.

**Operator decision: fast-track a minimal fix now**, as its own P0 issue (#194), separate from #192/#47. Fix: `include_comments_by_actor: ${{ github.event.pull_request.user.login }}` on `claude-review`'s action step — a free, non-widening mitigation (closes the untrusted-comment channel `filterCommentsByActor` gates, touches no tool grant, no `claude_args`) that the orchestrator's own earlier analysis had already surfaced as available.

**Three rounds of adversarial review on PR #195, each catching a distinct real thing — a compressed, single-day echo of the #77-deliverable-3 pattern (learning 30), except this one converged instead of getting dropped:**

| Round | Finding | Fold |
|---|---|---|
| 1 | Fix is genuinely PARTIAL, not closure: `claude-review` separately grants `Bash(gh pr view:*)`, and the pinned `code-review` plugin's own command file instructs `gh pr view <PR> --comments` as its literal first review step — a call with **zero author filtering** (demonstrated live against this repo's own PR #177: `["chatgpt-codex-connector","codecov","github-actions","syamaner","vercel"]`, every author, unfiltered). An easier path than the original TOCTOU race — no race needed, the comment only has to exist when the tool fires. Also: the D140 drift counters alone couldn't detect the security control itself being silently swapped for a same-count inert input (proven by mutation: `label_trigger: ""` in its place, 1 test failed of 2904). | Rewrote the in-file comment to state precisely what's closed and what isn't (never claim full closure); added T22 (exact-binding assertion, not truthy — kills the swap). |
| 2 | The first commit's message still carried a literal `Closes #194` trailer. This repo's `squash_merge_commit_message: COMMIT_MESSAGES` setting means a squash-merge prefills from constituent commit messages — so merging as-is would have **auto-closed the still-open P0 under all three enabled merge methods**, regardless of what the PR body said (verified via `gh api repos/.../{{owner}}/{{repo}}` merge settings, not assumed). Also: nothing pinned `track_progress: true`, the precondition making the whole `include_comments_by_actor` control live at all — flipping it false is invisible to T22 (the input itself is untouched) but silently routes the job into agent mode, which never fetches comments in the first place. | Squashed to one commit, subject/trailer reworded (`Refs #194`); added T23 (pins `track_progress: true`). Orchestrator independently reproduced both mutations (M2, M10) against its own edit before pushing, not just trusted the reviewer's report. |
| 3 | **Even the reworded PR body still tripped `closingIssuesReferences`.** GitHub's keyword parser is purely lexical and does not understand negation — "does not close #194" parses identically to "close #194". Caught by querying GitHub's own GraphQL field directly (`closingIssuesReferences(first:10){ totalCount }`) rather than trusting a regex — every independently-written regex model (the reviewer's and the orchestrator's) disagreed with GitHub's actual parser at least once across this round. | Reworded the PR body to remove every closing-keyword/issue-number adjacency — including catching a **self-referential trap mid-fix**: the orchestrator's own first attempt at explaining the round-3 bug literally quoted "does not/NOT close #194" while describing it, re-triggering the exact same detector. Re-verified via the same GraphQL query, twice, 15s apart, after discovering the first post-edit read (`totalCount: 1`) was a propagation-delay artifact and the settled value was `0`. See the new durable memory entry `github-closing-keyword-parser-is-lexical` for the reusable lesson. |

Merged (squash `96b64df6`, from single commit `f1e0da2`) after: CI fully green (15 checks), zero unresolved review threads, `claude-review`'s own automatic pass came back genuinely clean ("No issues found," with real substantive checks — confirmed `closingIssuesReferences` empty, swept the other three `claude-code-action` invocations for the same vulnerability class and found none share the tag-mode+comment-fetch shape), and a manually-triggered Codex connector verdict (`chatgpt-codex-connector[bot]`, "Codex Review: Didn't find any major issues", `Reviewed commit: f1e0da2c9b` — sha-prefix-matched to head). Independent `pr-triage` re-derived every signal from the live API (not the orchestrator's summary) and returned MERGEABLE, additionally verifying the underlying security claim itself by fetching `action.yml`/`fetcher.ts` from the pinned action SHA directly. #194 confirmed to remain OPEN post-merge via the same GraphQL field, then closed the loop with a follow-up comment on #194 stating precisely what shipped and what still needs #192's tool-grant work.

**Worth noting on the Codex-wait mechanics**: the automatic trigger DID fire this time (a bare `chatgpt-codex-connector[bot]` 👍 at 15:35:57Z, ~3.5 minutes after `ready_for_review`) — but with **no preceding bot-authored 👀**, an observed variant this repo's Merge Policy doesn't explicitly cover (its literal text requires the 👀 to precede the 👍). The orchestrator didn't need to resolve that ambiguity: this is a security-gate PR (modifies `claude-code-review.yml` itself) either way, so the established "manual `@codex review` even with an auto-👍 already present" exception (memory: `codex-connector-clean-signal-calibration`) applied regardless of how the bare-👍 case should be read, and the resulting comment-format verdict is the more robust channel anyway (the memory already notes 👍 reactions are withdraw-volatile).

### Learning 34: verifying a sub-agent's [UNVERIFIED]-flagged claims against primary source, before escalating, is what turned a routine allowlist decision into catching a live P0 the same day.

#47's contract flagged two claims it couldn't confirm read-only (the tag-mode tool union, the missing `ENV_SCRUB`). Confirming both directly led straight to commissioning the #192 probe, whose OWN adversarial review then surfaced #194 — a chain of three genuine findings, each one layer deeper than the last, that started from taking a "couldn't verify" flag seriously rather than passing it through as an open question. The same discipline repeated at every subsequent step (re-verifying the GraphQL field instead of trusting a regex; re-running mutations independently instead of trusting a reviewer's report; re-fetching pinned source instead of trusting a PR description) is what kept a fast-tracked P0 fix from shipping with a false closure claim not once but twice.

### Learning 35: a "let me just fix the commit message" fix can still fail if it doesn't account for every surface GitHub actually reads.

`Closes #N` lives in (at least) three places a reviewer has to check independently — the commit message trailer, the PR body prose, and (unverified here, but worth remembering) the PR title — and GitHub's own `closingIssuesReferences` GraphQL field is the only thing that has ever agreed with itself across every check in this saga. Two different people (the reviewer, the orchestrator) independently modeling "what counts as a closing keyword" both got it wrong at least once in the same PR. Treat that field, not a regex, as ground truth any time a PR must deliberately leave its issue open — and expect a short propagation delay after editing, so don't conclude a fix failed from a single read.

### Guardrails held throughout

`FACTORY_PAUSED` untouched; no settings/secrets/branch-protection/Environment changes. Every reviewer (`factory-security-reviewer` ×2 PRs, local `codex review` ×2 PRs, `pr-triage` ×1) ran in its own isolated worktree, never the orchestrator's own checkout. Gates independently re-run by the orchestrator at every fold, never trusted from Codex's or a sub-agent's self-report. #194 confirmed OPEN post-merge via GraphQL, not assumed from the PR body. #47 stays open (Option B, both sub-decisions). #192/#193 next drivable (fold fsr's CI + P2 findings, re-review, execute the probe).

## Session 1–2 Aug 2026 — #192 exfil arc driven to completion (probe executed, fix + cleanup + docs all merged)

The whole #192 chain closed this session, across five PRs (#193, #198, #199, #200, #202) and one new issue (#201), every one through the full pre-open floor. Headline: **the probe empirically confirmed the `gh pr comment --body-file` exfiltration primitive is LIVE on `claude-review`**, and the fix that narrows the grant merged the same session — but honestly, as defense-in-depth, not closure (#194/#192 stay open).

### PR #193 (probe workflow) — folded, and a stale-base hazard caught in verification

Codex-MCP built the throwaway `_probe-192-tag-mode-tools.yml` (a `pull_request`-triggered probe; `workflow_dispatch` fails `isEntityContext`/`validateTrackProgressEvent`, so tag mode needs a genuine entity event). Folded three prior fsr findings: faithful factory-integrity recount, `include_comments_by_actor` (mirroring #195), scoped `Read(probe-context/test.txt)` for the union sub-question. **The load-bearing catch was in independent verification, not the fold itself:** Codex's first recount was internally honest but computed against a STALE corpus — #193's branch was cut before #195 merged and never rebased, so the pins it moved were 67/112 (pre-#195), not main's 68/113. Merging as-is would have both conflicted AND under-counted by one. Fixed by rebasing the probe commit onto current main first, then re-folding; the honest post-#195 recount is source-only `{9→10,29→30,27→29,68→79}`, all-steps `{17→18,54→55,44→46,113→124}`, invocation 4→5, toHaveLength 7→8. Pre-open floor CLEAN (fsr full + focused; local `codex review` raised 2 functional P2s — step-7 detached-HEAD can't resolve the PR, and a green-but-empty risk — both folded). Codex connector's *manual*-triggered review then raised 2 more P2s (denial-evidence can't distinguish the two `Read` probes; the count-alarms don't pin the trigger predicate) — operator decided accept-as-throwaway-residuals; in-thread rationale + resolve; pr-triage MERGEABLE; merged.

### PR #198 (throwaway run) — the probe FIRED and confirmed the primitive live

A second PR from a branch literally named `probe/192-tag-mode-tools` (a `pull_request` workflow only evaluates once it's on the default branch, so this had to follow #193's merge), modifying `probe-context/test.txt` so step-8's inline comment had a diff anchor. Results, cross-checked model-report vs SDK evidence: **step 7 (`gh pr comment <PR> --body-file /etc/hostname`) = ALLOWED and actually posted** the runner hostname to the PR — the exfil primitive works; `/proc/self/environ` would publish `CLAUDE_CODE_OAUTH_TOKEN`. Also: bare `Read`/`Glob`/`Grep` injected (NOT `LS` — model said DENIED but SDK `permission_denials_count:0`, a useful channel divergence); scoped `Read` does NOT narrow the union (step-2 out-of-scope `/etc/hostname` read ALLOWED); the second write channel `update_claude_comment` present. Escalated step-7 to the operator immediately as its own finding (per the pre-agreed protocol), not folded quietly. Full results posted to #192; #198 closed.

### PR #199 (the fix) — grant narrowed, and the codex-vs-fsr disagreement settled by an EVIDENCE GATE

Operator: "fast-track" the fix; chose "remove the gh-pr grant" after I surfaced that `ENV_SCRUB` is NOT a one-liner (it needs bubblewrap, absent on the runner; triage-issues deliberately removed it as "breaks the job outright"). Fix: `--allowedTools` → exactly `mcp__github_inline_comment__create_inline_comment`; `--disallowedTools` → blanket `Bash`. Then, crucially, a genuine reviewer disagreement: **local `codex review` (twice) raised a P1 that removing `gh pr diff`/`view` blinds the review to the patch; fsr (twice) said the diff is prefetched so the review still functions.** Resolved empirically, not by argument — the fix PR's OWN `claude-review` run (on the modified, grant-removed workflow) reviewed the actual changed lines citing real line numbers with no `gh`/Bash in-session, and said so. fsr right; codex P1 refuted by a live run. fsr also caught a `close #194` in the commit SUBJECT that would have auto-closed the P0 (the lexical-parser trap again, this time in a commit message — my "never Closes" instruction to Codex missed the lowercase mid-sentence "close" verb). Connector raised 4 P2s: non-inline-summary (refuted — summary posts via `update_claude_comment`), doc-sync (→ #201), retire-the-probe (→ #200), pin-the-Bash-denial (FOLDED as T24/T25, a mutation-proven contract test; pr-triage did its OWN mutation proof). Merged `2d7829e`. **#194/#192 stay open**: the tag-mode bare `Read` + inline/`update_claude_comment` writes are an independent `Read(env)→comment` exfil path #199 does not touch, and step-B completion-forgery merely moved from Bash to the MCP channel — it wasn't eliminated.

### PR #200 (cleanup) + #202 (docs, Closes #201)

#200 removed the probe + reverted the pins (byte-identical to the pre-#193 baseline); pr-triage independently BUILT the real post-#199 merge and ran the full factory suite (2908 pass) to rule out any stale-CI-base risk. Merged `a38ac94`. #202 synced `registry.md` + the AGENTS.md `claude-review` capability cell + a token-model comment to the merged reality, honestly (states step-B is NOT adversarially sound; #194/#192 open) — fsr verdict ACCURATE, and its two precision notes (frame the summary claim architecturally not as an empirical run; restore #194 present tense) were folded. Merged `027ef23`, closed #201.

### Learning 36 — a reviewer *disagreement* is best settled by an evidence gate, not by adjudicating the arguments.

codex and fsr disagreed on a load-bearing, empirically-decidable question (does removing `gh pr diff` blind the review). Rather than pick a side from reasoning, the fix PR was structured so its OWN `claude-review` run *was* the experiment — the modified workflow reviewing itself. It reviewed the real diff without Bash and said so; question closed. When two diverse lenses split on something the system can be made to demonstrate, make it demonstrate.

### Learning 37 — the lexical closing-keyword parser reads commit SUBJECTS too, and "fix"/"close" as ordinary verbs trip it.

fsr caught `close #194` in a commit subject describing the action of closing a *path* — GitHub reads it as closing the *issue*. Instructing an implementer "use Refs, never Closes" is insufficient: the hazard is any `close|fix|resolve` token adjacent to `#N`, including a conventional-commit `fix(...)` prefix if a bare `#N` follows, or a lowercase verb mid-sentence. Scan the whole message (subject + body + every commit) with the adjacency regex AND confirm via `closingIssuesReferences`. (Extends the `github-closing-keyword-parser-is-lexical` lesson.)

### Learning 38 — "touches a protected file" is not the manual-`@codex review` trigger; "modifies an enforcement mechanism" is.

pr-triage caught that I reflexively re-triggered the connector on #202 (a pure docs sync) when the auto-👍 sufficed — a docs change to AGENTS.md is not a security-gate change, and the re-trigger cost a connector cycle for no diverse-lens gain (and withdrew the auto-👍 I'd observed). The calibration boundary is the *mechanism*, not the *path*. (Refines the `codex-connector-clean-signal-calibration` note.)

### Per-PR metrics (topology-v2 experiment is past its 24h window, recorded as durable narrative)

Implementer: **Codex-MCP throughout** (credit pivot D145 held; Claude reserved for the safety floor + orchestration). Reviewers all in isolated worktrees, gates independently re-run at every fold. Post-open review rounds: #193 ~2 (connector P2s folded/accepted), #199 ~1 (connector P2s: 1 fold + responses), #200 0, #202 ~1 (precision fixes pre-open). fsr passes: 6 across the session (full + focused on #193/#199, delta on #199-fold, #200, #202) — all on the operator's "rigor is not the budget lever" instruction; the credit lever was implementer (Codex) + search (Auggie/grep) choice, never the floor. Precise per-delegation token counts were NOT captured early enough into the ephemeral `subagents/agent-*.jsonl` (the known hazard in `reconstruct-topology-metrics-from-logs`); PR-level timelines are reconstructable from GitHub. Guardrails held: `FACTORY_PAUSED` untouched; no settings/secrets/branch-protection changes; every merge human-authorized explicitly; #194/#192 confirmed OPEN post-each-merge via `closingIssuesReferences`.

---

## Session 4 Aug 2026 — #192 Units 1+1b (PR #204) MERGED — deny the tool catalog + restore base config

The two remaining structural closures for `claude-review`'s tool-grant residual, landed together as PR #204 (squash `0542a77`, `Refs #192, #194`, human-merged on an explicit "if safe, merge" after a full comment sweep + `closingIssuesReferences` verify). Codex-MCP authored both units and every fold (credit pivot D145 held); Claude was PM + the cross-family safety floor throughout. Headline: **the deny catalog alone does NOT close the exfil — Codex's own P1 showed the startup-execution vector survives it — so Unit 1b (restore base-owned config before the action runs) was folded in rather than deferred, and the whole thing was gated by an exhaustive restore-ordering adversarial pass.**

### PR #204 — #192 Units 1+1b — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; `.github/workflows/claude-code-review.yml` (168 logic lines) + `tests/factory/**` (790 test lines across 3 files) |
| Open → merge | ~19.5h wall-clock (2026-08-03 21:10Z → 2026-08-04 16:40Z), but dominated by a session compaction + a ~7h operator-decision gap on the claude-review-red posture; active drive was a fraction |
| Units | **1** = deny the full 37-entry SDK tool catalog (metadata-only lens, `ToolSearch` §1.3 residual, `always()` evidence producer, T24–T33); **1b** = restore base-owned config from a retarget-hardened trusted revision before the action runs (`base.sha` only when `base.ref` byte-equals the default branch, else default-branch tip; `--no-renames`; `-z`/`read -r -d ''`; rm-before-checkout in BOTH restore steps), closing the startup-execution vector |
| Offline / pre-open floor | `codex review` CLEAN (ran the full 2,947-test suite green in-sandbox); `factory-security-reviewer` **CONFIRMED-SOUND** on the complete diff (full attack matrix on both reorders in hermetic git repos: dir↔file, file→dir, deep-nesting, gitlink/submodule, prefix-collision, symlink; proved the sibling's third re-apply cannot place attacker content in or delete a trusted path); `qa` **PASS** (5 independent mutation experiments); `pr-triage` ×2 |
| Online / post-open | Codex connector bot-authored 👍 on the final head `0bf33d3` (08:04:47Z, postdating the ready boundary, head unchanged) — clean, no findings round |
| Findings folded pre-open | Codex **P1** (deny alone leaves the startup-exec vector → Unit 1b restore); Codex **P2** (checkout-before-rm deletes restored dir on a dir→file replacement → rm-before-checkout reorder); CodeQL HIGH TOCTOU (fd-based fix, not dismissed); the sibling reorder (pr-triage class-sweep, below); §1.3 `ToolSearch` relaxation (the full deny stubbed the review) |
| Findings folded post-open | 0 (connector clean on the final head) |
| Deferred to issues | **#205** (the `base.sha` retarget weakness in the `spec-grounded-review` restore + the write-token publish job); **Unit 2 #192** (runtime fail-closed catalog assertion + the completion-assertion metadata-only robustness); **Unit 3 #192** (doc sync incl. `registry.md`) |
| Implementer | **Codex-MCP** (both units + every fold via `codex-reply`); the Claude `implementer` agent never invoked |
| Domain reviewers | `factory-security-reviewer` (opus, CONFIRMED-SOUND); `qa` (sonnet, PASS); `pr-triage` (sonnet) ×2 |
| Claude-subagent tokens (this session, all #204) | ~708 turns, ~431K output, ~4.3M cache-create across 12 delegations. Mapped: fsr-final 70t / 55.3K out / 379.6K cc; qa 80t / 15.8K / 177.4K; pr-triage#1 106t / 27.6K / 401.6K; pr-triage#2 81t / 14.4K / 288.0K. (Codex implementation + `codex review` are on the separate weekly subscription, not in these logs.) |

### Learning 39 — the independent adjudicator (D23) is a backstop for the ORCHESTRATOR's routing, not only the implementer's.

`pr-triage` returned FIX-FIRST **twice on the same PR**, each time catching a routing error the orchestrator (me) made, not the implementer or the contract:
- (a) the `spec-grounded-review` sibling restore carried the identical checkout-before-rm class the Codex P2 fixed in `claude-review`, and it was **in-scope** — Unit 1b already edited that block (the `-z` fix), so "fix the class, sweep the repo pre-open" applied; I had wrongly deferred it to #205.
- (b) the diff's 601-line new test file crossed the **exact 600-line** `qa`-routing threshold, and I had never dispatched `qa`.

Topology v2 already has the orchestrator re-derive reviewer routing from the real diff *because* the pre-code contract's routing is only a prediction. Here the *contract* was fine; the *orchestrator* under-routed twice, and the independent D23 adjudication is what caught it. Lesson: the orchestrator is not exempt from the "re-derive routing from the real diff's paths AND content" discipline, and a security floor that only guards the implementer's output would have missed both.

### Learning 40 — learning 16 recurs, now systematically: a metadata-only `claude-review` reds the completion-assertion non-deterministically.

Unit 1's full deny catalog makes `claude-review` a metadata-only lens with no file-read tool. Running under it, the model honestly cannot complete the injected "line-by-line review" checklist item, so it strikes it through and leaves `- [ ]`; the #146 completion-assertion reds on any unticked box, **regardless of the terminal `REVIEW-COMPLETE` sentinel the same comment also carries**. It passed on two prior heads (`bbbb286`, `c84d60c`) and failed on the third (`0bf33d3`) — pure model-output-shape non-determinism (learning 16, now made systematic by the deny). The assertion cannot distinguish a *deliberately* metadata-only review from a truncated/failed one. `claude-review` is not a required check (#163), so the red is non-blocking; the operator chose accept + defer the robustness to Unit 2. This is the design-completeness tail of the metadata-only-lens decision: denying the tools was Unit 1; making the completion contract recognise the resulting review shape is Unit 2.

### Process notes

- **Codex API `[bot]`-suffix login.** The reviews AND reactions APIs return the connector's author as `chatgpt-codex-connector[bot]` (with the suffix). A Codex-wait watch filtering the bare `chatgpt-codex-connector` matched nothing and ran ~20 min blind to a real 👍. Filter with the suffix; the bot-authored 👍 (which a public-repo stranger cannot forge) is the load-bearing anti-spoof property, since the transient 👀 is often already GC'd by the time you poll. (Folded into `codex-connector-clean-signal-calibration`.)
- **The two ordering reorders are one class, swept together.** rm-before-checkout in both `claude-review` and `spec-grounded-review`; T4b/T4d each mutation-kill exactly its own job's revert and nothing else. The sibling's third re-apply step (PR-head `scripts/factory` + the review skill) does not interact with the reorder.
- Guardrails held: `FACTORY_PAUSED` untouched; no settings/secrets/branch-protection changes; the merge human-authorized explicitly; #192/#194/#205 confirmed OPEN post-merge via `closingIssuesReferences`.

## Session 4 Aug 2026 (cont.) — #192 Unit 3 (PR #207) MERGED — doc-sync of registry + AGENTS.md to the #204 state

The documentation half of #204: truth-syncs `docs/state/registry.md`'s F1-S7 row and `AGENTS.md`'s `claude-review` roster row to the merged #204 tool-catalog-deny + base-config-restore state, so the repo docs stop describing the pre-#204 grant. Squash `01e1ebe` (`Refs #192`, human-merged on an explicit "merge" after the full floor). Also synced the plan repo's authoritative `factory.md` (§8 + a D146 supersession note, commit `f204002`) after a reviewer caught that AGENTS.md would otherwise contradict the doc it defers to.

### PR #207 — #192 Unit 3 — MERGED

| Field | Value |
|---|---|
| Path | conventional/interactive; docs only — `AGENTS.md` (1 line, the roster row) + `docs/state/registry.md` (1 line, the F1-S7 row). Three commits `b93fe5d` → `7581d4c` → `ba5e285` |
| Implementer | **Codex-MCP** applied the verbatim contract, but its MCP call hit the harness 1800s idle cap TWICE (silent multi-minute gate runs); both times the edits had landed (staged), so the orchestrator finalised (gate-verify, commit, push) and applied the two prose folds directly rather than re-spinning dead threads. See learning 42 |
| Offline / pre-open floor | `factory-security-reviewer` **CONFIRMED-CLEAN** (every #204 security claim byte-verified against merged `0542a77`; ~51.4K subagent tokens); local `codex review` run twice |
| Findings folded pre-merge | **3, each from a different lens** (learning 41): local `codex review` P2 (the prose said "every harness tool" denied but `ToolSearch` is the single §1.3 permitted residual — `7581d4c`); local `codex review` re-run P2 (AGENTS.md's #204 closure claim contradicted plan-repo `factory.md` §8/D146, which still said bare `Read` survives — resolved by the `f204002` factory.md sync); cloud Codex connector P2 (the registry "retarget-hardened ... in both restore steps" over-claim — it is `claude-review`-only, sibling = #205 — `ba5e285`) |
| Online / post-open | Connector auto-review landed on the STALE first head `b93fe5daa0` with the 2 local-review-class findings (1 already fixed, 1 live); after folding + pushing `ba5e285`, a manual `@codex review` (required — connector does not auto-trigger on push) returned CLEAN on the current head ("Didn't find any major issues", `Reviewed commit: ba5e28582b`, bot-authored) |
| Findings folded post-merge | 0 |
| `pr-triage` | **PENDING → all-resolvable** (~77.2K subagent tokens): both folds independently re-verified against the workflow ground truth; the only block was the two unresolved inline threads (`required_conversation_resolution`); adjudicated both fix-accepted; orchestrator then resolved them via GraphQL `resolveReviewThread` |
| Merge-safety | `closingIssuesReferences=[]` on every head; #192/#194/#205 OPEN pre- and post-merge; all commit subjects/bodies closing-keyword-clean; CI green incl. `claude-review` (no metadata-only red on this run) |
| Claude-subagent tokens | fsr 51.4K + pr-triage 77.2K output-side (usage blocks). Codex-MCP implement + 3× `codex review`/connector on the separate weekly subscription |

### Learning 41 — three review lenses, three distinct catches on a two-line docs diff.

`factory-security-reviewer` rated the diff CONFIRMED-CLEAN; local `codex review` then found two real P2s it missed (the ToolSearch residual and the cross-document factory.md contradiction); the cloud Codex connector — a distinct, non-deterministic instance of the *same* family as local codex — then found a THIRD the local run missed (the "in both restore steps" over-claim). None of the three was a false positive. The lesson that keeps recurring: lens diversity is a control even on prose, and even two instances of the same model family (local `codex review` vs the cloud connector) are not interchangeable — the connector out-found the local pass on the exact same diff. The single most valuable catch (the factory.md contradiction) came from a lens reasoning about AGENTS.md's *own* authority rule (the plan repo wins on disagreement), which a claim-vs-code checker structurally could not have surfaced.

### Learning 42 — Codex-MCP + silent multi-minute gates hits the 1800s idle cap; finalisation falls back to the orchestrator.

On this repo the gate suite (`npm ci` + lint/typecheck/test/build) runs several minutes with no MCP progress output, so a `mcp__codex__codex` call that runs it inline is aborted at `CLAUDE_CODE_MCP_TOOL_IDLE_TIMEOUT` (1800s) before it can commit/push. It happened twice on Unit 3. Each time the file edits had already landed (staged in the worktree), so no work was lost, but the orchestrator had to verify the staged diff, run the gates itself, and commit/push — and, because the Codex thread was gone (no returned `threadId` to `codex-reply`), the two small prose folds were applied directly rather than re-delegated. This is real friction for the "orchestrator never implements" pin: the timeout, not a topology choice, forced finalisation back onto the orchestrator. Mitigations for next time: have the Codex agent background the gates and hand back immediately after staging, or run the gates orchestrator-side by design on docs-only diffs and keep Codex to the edit. Guardrails held throughout (`FACTORY_PAUSED` untouched; humans merge; issues stay open verified via `closingIssuesReferences`).

---

## Session 6–7 Aug 2026 — F1-S6 slices 9b + 9c (the metrics/ratchet substrate, then the Codex-verdict reducer)

Bridging note (5–6 Aug, prior sessions, details on the issues, not re-ledgered here): **#47** landed as PR #214 (admit `roastpilot-factory[bot]` to both Claude review lenses; squash `f8e3d30`), **#215** synced the registry, and **F1-S6 slice 9b** shipped in two PRs, Unit 1 (metrics capture + four-rung promotion ratchet + audit-owed logic + runbook skeleton, PR #216, `eec6acd`) and Unit 2 (the 27 Jul baseline sample as conventional records, PR #218, `8aa71e9`), with `K=35` (the Wilson-95%-lower-bound break-even) ratified in-slice. Both 9b units were `factory-security-reviewer` CONFIRMED-SOUND; #218 survived the 6 Aug GitHub Actions webhook-throttle incident (zero dispatch for hours, cleared by a close+reopen once partial recovery hit).

### PR #220 — F1-S6 slice 9c (pure Codex-verdict reducer, `Refs #9`) — MERGED

Squash `03eff51`, `Refs #9` (never `Closes`; #9 spans 9c-9h). Conventional/interactive, **non-credentialed and non-activating** (`FACTORY_PAUSED` untouched, no `.github/**` change). A pure, deterministic reducer of validated public PR metadata to the Codex merge-wait verdict (`clean` / `findings` / `unknown-pending`), encoding the AGENTS.md PR Merge Policy Codex-wait rule as byte-exact, fail-closed predicates. Split at the story-planner's pre-registered >350-line contingency into `scripts/factory/codex-signal-schema.mts` (195 lines, grammar + validation) and `scripts/factory/codex-verdict-logic.mts` (465 lines, predicates + reduction).

| Field | Value |
|---|---|
| Open → merge | **8h 22m** (2026-08-07 12:11:54Z draft → 20:33:40Z merged), draft-first; **13 commits** across 4 pushed heads (`5b1a980` → `b40a701` → `ace05d5` → `a95060a`) |
| Implementer | **Codex-MCP (D145 default)** — the first large *logic* slice authored on Codex-MCP (prior ledger slices used the `implementer`/opus agent; #207 used Codex-MCP for a docs-only diff). ~11 `codex-reply` fold cycles in one thread |
| Planner | `story-planner` (**fable**); contract D104-verified + 3 open-question ratifications brought to the operator before implementation |
| Offline / pre-open floor | **~9 local `codex review` rounds** + `factory-security-reviewer` **re-engaged ~10 times** (CONFIRMED-SOUND each, the load-bearing cross-family lens under D145) + `qa` ×3 (round-1 NEEDS-WORK → converged PASS → connector-fold PASS) + `pr-triage` ×1 (MERGEABLE) |
| Online / post-open | **2 connector rounds with findings** (`5b1a980`: 3 findings, 2×P1 + 1×P2; `b40a701`: 1×P1) + **1 CLEAN verdict** on `a95060a` confirmed via TWO channels (bot 👍 reaction *and* a bot "Didn't find any major issues" comment with `Reviewed commit: a95060a5b8`, head-matched) |
| Findings folded pre-open | ~a dozen across 8 local rounds: a **BLOCKER draft-clean fail-open the contract's own P7 omitted** (a draft PR read `clean`+ratchet-eligible), push-away-and-back SHA-recurrence on the comment channel, API-indeterminate completeness, the grammar whack-a-mole (fences → HTML comments → HTML tags, converged via Design 2, learning 45), same-`subjectId`/non-empty pairing, three advice refinements, nested-sha validation, the >350 split |
| Findings folded post-open | **4 connector** (findings-via-top-level-comment + findings-before-clean precedence; conflicting reviewed-commit markers fail closed; draft findings preserved ratchet-ineligible; malformed marker line fail-closed) + **1 local-codex reaction-channel P1** dispositioned as a 9d caller-contract (operator Option B) |
| Operator decisions in-slice | 3 fail-closed tightenings ratified (same-`subjectId` pairing, line-anchored title, strict `>` postdating); completeness **folded into 9c** (defense-in-depth); grammar **Option A** (first-non-blank-line title); reaction binding **documented as a 9d caller-contract** (Option B, like P5) |
| Residuals (all availability-only, documented in the PR body) | connector clean-comment title format (Option A coupling), signal-chronology-vs-`evaluatedAt` skew, trigger-phrase variants, 👀-only advice engagement, review-object-scoped reactions — all finalised by 9d against the live connector |
| Merge-safety | `closingIssuesReferences=[]` on the merged head (#9 verified OPEN post-merge); 4 outdated connector threads resolved via GraphQL `resolveReviewThread` (use `-F id`, not `-f`, for the GraphQL `ID!` var); `pr-triage` re-verified every finding fixed *in code* at `a95060a`, not just replied-to; CI all green, no new code-scanning alerts (the 5 open repo-wide alerts pre-exist on `main`) |

Claude-subagent tokens (output / cache-create / cache-read; Codex-MCP implement + ~9 local `codex review` on the separate weekly subscription, not in Claude logs):
| Delegation | Model | Turns | Output | Cache-create | Cache-read |
|---|---|--:|--:|--:|--:|
| fsr-9c (a681e5b8, ~10 resumes) | opus | 232 | 197,782 | 8,344,984 | 42,916,752 |
| qa-9c converged+fold (a926a92a) | sonnet | 74 | 77,065 | 1,289,047 | 7,420,259 |
| qa-9c round-1 (ae8a922b) | sonnet | 22 | 8,292 | 194,909 | 1,039,395 |
| triage-220 (a8d95b65) | sonnet | 71 | 25,786 | 366,601 | 6,171,346 |
| **PR #220 Claude-subagent total** | | 399 | **308,925** | **10,195,541** | ~57.5M |

### Learning 43 — the cloud merge-gate connector is not redundant with the local adversarial floor: they run *different threat models*.

The single sharpest datapoint of the arc. `factory-security-reviewer` (local, opus) was re-engaged ~10 times and CONFIRMED-SOUND every time — correctly, because its threat model is **attacker-forced false-cleans** (can a public-repo stranger, or crafted input, force a bad admission?), and every clean path is byte-exact bot-gated, so it found none. *After* fsr declared the reducer converged, the cloud Codex connector found **four real fail-opens** across two rounds (findings-via-top-level-comment losing to a coexisting clean; draft findings collapsed; conflicting then malformed reviewed-commit markers silently dropped). None was attacker-reachable; all were **bot-authored spec-conformance gaps** — places where the reducer disagreed with the documented Codex-signal grammar the connector itself embodies. That is a threat model fsr structurally does not target ("does this reducer match the external contract's signal shapes?" is orthogonal to "can an attacker break it?"). Extends learnings 1/7/11/14/41 (the connector is the highest-yield lens) with the *mechanism*: on a spec that mirrors an external system's grammar, the local adversarial lens and the cloud contract-conformance lens are complementary, not ranked. You need both, and "fsr says sound" is not "the connector will say clean."

### Learning 44 — the fable-cheap-planner lever has a floor on spec-dense surfaces, and it is distinct from learning 8's emergent-subtlety floor.

9c took ~14 review rounds, and unlike #170/#180 (learning 8: emergent subtlety no spec can pre-empt), most of 9c's folds were of a **knowable-but-large** surface: the Codex-signal grammar has many enumerable shapes (freshness including SHA-recurrence, comment grammar including every markup wrapper, completeness, sha-validation, precedence, both comment channels, chronology), and the `story-planner` (fable) contract specified only some of them. The tell is that the **BLOCKER was the contract's own P7 omission** (it never gated clean/findings on draft state), not an execution bug. This is not "fable is too cheap for implementation" (Codex-MCP executed each fold faithfully); it is that **when the spec must mirror an external system's grammar, the planning-cost floor rises**, and a cheap planner under-enumerates it. The concrete mitigation for the 9d/9e/9f/9g siblings (which consume this same grammar): an explicit planner pass that enumerates *every* signal shape the external contract (AGENTS.md Merge Policy) defines, as acceptance rows, before implementation — turning review-round discovery into planning-time coverage.

### Learning 45 — grammar whack-a-mole converges with a positive authenticator, not a growing exclusion list (learning 9, recurred on parsing).

The clean-comment title match began as an exclusion list and grew one construct per review round — exclude ``` fences, then `<!-- -->` HTML comments, then `<pre>`/`<blockquote>` HTML tags — three rounds, each lens finding the next markup wrapper that hid the title on its own "visible" line. It converged only when inverted to a **positive structural constraint**: the title must be the *first non-blank line* of the comment, which authenticates it, after which the reviewed-commit line's location is security-irrelevant (byte-exact sha-equality + freshness + completeness gate admission independently), so the entire visible-line exclusion heuristic was *deleted*. The reviewed-commit parser then had its own matching convergence: any `Reviewed commit:`-prefixed line that fails the anchored 40-hex regex, or a set naming 2+ distinct shas, yields `conflicting` and fails closed — closing the prefix-vs-regex gap exhaustively rather than special-casing trailing whitespace. Same shape as #160's C4 (learning 9): an open-ended exclusion/heuristic has an infinite adversarial edge-tail; converge it with one precise structural signal, not iterative patching.

**Process note (topology v2 held end to end, with one deliberate variation).** Spec-first (`story-planner` fable contract, D104-verified, 3 ratifications brought to the operator before code); implementer in its own worktree (`rpc-wt-9c`) with a sibling reviewer worktree (`rpc-wt-9c-fsr`) so the adversarial mutation passes never touched the author's checkout; pre-open floor + adversarial fsr on every fold; draft-first until CI green; connector verdict per the Merge Policy; independent `pr-triage` before the human-authority merge. The deliberate variation from prior ledger slices: **Codex-MCP was the default implementer (D145), not the opus `implementer` agent**, and the Claude cross-family safety floor (fsr + the two Claude review lenses) held exactly as D145 intended — fsr and the connector caught what the same-family Codex author and the same-family local `codex review` did not. Every fold was a real fail-closed-floor gap; every fix was convergent (closing a closed enum or channel); zero post-merge escapes; `FACTORY_PAUSED` untouched throughout. **9d is credentialed and stops for a separate operator confirmation + a D140 platform disposition.**

## Session 8 Aug 2026 — F1-S6 slice 9d Unit 1 (the advisory-status collection + status-plan logic)

### PR #223 — F1-S6 slice 9d Unit 1 of 2 (`Refs #9`) — MERGED

Squash `309e651`, `Refs #9` (never `Closes`; #9 verified OPEN post-merge). Conventional/interactive, **non-credentialed and non-activating** (pure no-I/O logic, no `.github/**`, `FACTORY_PAUSED` untouched — a `StatusPlan` is *represented, never written*). Consumes the merged 9c reducer; turns raw GitHub-API records (PR metadata, timeline events, reviews, comments, reactions, per-source completeness) into an advisory commit-status plan (`success`/`failure`/`pending`). Operator-ratified **f-1 head-freshness model** (from the prior session's re-plan, D148): success reachable ONLY via a content-addressed clean COMMENT; the sha-less 👍 reaction pair demoted to `pending`; check-suite evidence removed.

| Field | Value |
|---|---|
| Open → merge | **~3h 03m** (2026-08-08 11:11:34Z draft → 14:14:47Z merged); ready 11:33:06Z → merge ~2h42m. **1 squashed commit**, amended across **8 pushed heads** (`9b95095`→`1cdd07c`→`751ac24`→`821150a`→`93a6e3d`→`eed9001`→`1109034`→`c276aba`) |
| Implementer | **Codex-MCP (D145)**, one thread (`019fe078`), ~9 `codex-reply` fold cycles. Fallback `implementer` (opus) not used |
| Planner | `story-planner` (**fable**) — initial 9d contract **plus a mid-arc f-1 head-freshness RE-PLAN** (13 turns, 114k out) after the round-2 model shipped an evidence-gated fail-open; the re-plan (demote the unreliable sha-less reaction channel rather than heuristic it) held |
| Offline / pre-open floor | gates + **local `codex review` ×7** (initial + per-fold) + **`factory-security-reviewer` ×8 CONFIRMED-SOUND** (the cross-family safety floor, re-engaged per fold) + `qa` ×1 (NEEDS-WORK → 3 gaps folded) + `pr-triage` ×1 (MERGEABLE) |
| Online / post-open (connector) | **5 rounds, EVERY round with findings** — R1 `751ac24` (3: 2×P1+1×P2) · R2 `821150a` (2×P1) · R3 `93a6e3d` (2×P1) · R4 `eed9001` (2×P2) · R5 `1109034` (1×P1+1×P2). **No CLEAN verdict** — correct by design (4 deferred items keep it non-clean). Merge basis: triaged disposition + all threads resolved + green required CI + human merge |
| Findings folded pre-open | qa's 3 test-gaps (out-of-order boundary events, dup-marker parity, selected-manual-trigger fallback) + local `codex review` P2s (dup-marker parser divergence, defensive-branch v8-coverage) |
| Findings folded post-open | **7 connector** via **2 class fixes** + point fixes: findings-precedence (P1-b no-valid-boundary → indeterminate → selected-retrigger) collapsed into **one hoisted current-head-findings check**; advance-tie (same-timestamp visible head event → tied stale-SHA) collapsed into **`>=` for ALL advance evidence**; [665] malformed-`evaluatedAt` + [661] partial-malformed-PR → fail-closed (write `pending`, never a stranded `no-write` success) |
| Deferred to Unit 2 (acceptance criteria on #9) | **4**: P1-a invisible-append + [247] delayed-stale-verdict (one authoritative head-freshness signal closes both) · P2 trigger-author authz (operator allowlist) · P3 root-only inline-thread count · [21] shared-head-SHA status contamination (PR-namespaced status). All non-activating, zero consumers — `pr-triage` verified in code |
| Operator decisions in-slice | (R1) re-scope + fold P1-b + defer P1-a/P2 → merge; (R4) fold floor-item [665] + defer availability-item [247] + one round; (R5) fold floor-sibling [661] + defer P1 [21] → **merge, stop re-triggering** at P1→P2 convergence |
| Merge-safety | `closingIssuesReferences=[]` (#9 OPEN); **11 connector threads resolved** via GraphQL `resolveReviewThread` (7 fixed + 4 deferred, disposition on PR comment `5226454767` + #9 `5226312838`/`5226406701`); `pr-triage` re-derived every signal from the live API and verified each fix *in code* at `c276aba`; all required CI green + `claude-review` pass (no #217 red on final head) |

Claude-subagent tokens (output / cache-create / cache-read; Codex-MCP implement + ~7 local `codex review` on the separate weekly subscription, not in Claude logs):
| Delegation | Model | Turns | Output | Cache-create | Cache-read |
|---|---|--:|--:|--:|--:|
| fsr-9d-unit1 (×8 rechecks) | opus | 134 | 133,255 | 3,037,025 | 18,766,238 |
| qa-9d-unit1 | sonnet | 22 | 27,587 | 287,952 | 1,473,707 |
| pr-triage-9d-unit1 | sonnet | 37 | 21,032 | 317,764 | 2,713,847 |
| story-planner f-1 re-plan | fable | 13 | 114,358 | 292,326 | 384,442 |

### Learning 46 — the cloud connector is load-bearing on a HARDER surface than 9c's, and the pre-open floor has a *systematic* blind spot for the head-freshness / findings-precedence class.

Extends learning 43 with a sharper mechanism and a worse blind spot. On 9c the connector found bot-authored *spec-conformance* gaps; on 9d it found **genuine fail-opens** — including a **latent pre-existing one** (a same-second force-push slipping the strict-`>` advance gate) that had been in the code since the first Unit-1 commit. The connector found a real P1 on each of R1–R3 that **`factory-security-reviewer` ×8 CONFIRMED-SOUND *and* local `codex review` ×7 clean both missed**. Why: fsr's attacker-model and local codex's semantic-model both reason from the *code's stated intent*, while the connector reasons from the **external contract** (the merge policy's mandatory post-push retrigger) crossed with **real GitHub timestamp/event semantics** — second-precision ties, appends that emit no timeline event, commit-statuses keyed by (SHA, context) not PR. Those are failure modes no amount of "is the code internally consistent?" surfaces. Consequence for the arc: **5 post-open rounds**, P1→P1→P1→P2→P2. Skipping the once-on-final re-trigger would have merged ≥3 P1 fail-opens. On any invariant surface that mirrors an external system's real-world semantics, the non-deterministic cloud lens is not a courtesy pass — it is the only lens with the right threat model, and "fsr sound + local codex clean" is *not* convergence.

### Learning 47 — per-instance fold is the round-2..N engine; only a class fix converges it (D104, recurred on control-flow).

The connector walked me through the same two CLASSES instance-by-instance: advance-evidence timestamp-tie (visible-head-event → *then* stale-SHA review → *then* stale-SHA comment) and current-head-finding-dropped-by-a-boundary-path (no-valid-boundary → *then* indeterminate → *then* selected-manual-retrigger). Each round I patched the reported instance; each next round it found the next sibling. Convergence came only when I stopped patching instances and fixed the CLASS: **`>=` on every advance-evidence branch** (one predicate, all evidence types), and **a single hoisted current-head-findings check before all boundary selection** (one structural gate subsuming every per-path probe). Same shape as learning 45 (positive authenticator beats a growing exclusion list) but for **control-flow completeness** rather than parsing: when N sibling code paths each need the same guard, hoist the guard above them once; don't add it path-by-path as a reviewer finds each. The tell you're in this trap: the reviewer's finding text is "…the sibling X path has the same issue."

### Learning 48 — the diverse lens empirically *defines* the Unit-1/Unit-2 boundary, and closing a multi-unit slice is an operator STOPPING decision, not a fail-open escalation.

Once the core-model P1s closed (end of R3), every subsequent connector finding (R4–R5) sat at the **Unit-1↔Unit-2 boundary**: a signal Unit 1 structurally cannot fetch (authoritative head-freshness for invisible appends; delayed-verdict ordering; trigger-author association; PR identity in the status namespace). These are *real* — one is a P1 (cross-PR status contamination) — but **non-activating with zero consumers**, so they are Unit-2 acceptance criteria, not Unit-1 blockers. An exhaustive cloud reviewer will keep surfacing boundary edge-cases every round forever; the correct response at the **P1→P2 severity convergence** is an operator *stopping* decision (fold the last pure-logic floor sibling, defer the boundary items with documented Unit-2 criteria, merge), not another fold-round and not a model re-plan. New topology-process pattern: **let the diverse lens run until severity converges, then draw the Unit-1/Unit-2 contract line where it converged** — the connector's residual findings *are* the next unit's spec. (Corollary for checkpointing: I brought the operator in at exactly two moments — the first P1 that reopened the ratified model, and the P1→P2 convergence — and drove the folds in between on delegated authority; that cadence kept a 5-round arc from becoming 5 approval round-trips.)

**Process note (topology v2 held; the safety floor earned its keep).** Spec-first (`story-planner` fable contract + a mid-arc f-1 re-plan brought to the operator); Codex-MCP implementer (D145) in its own worktree with a sibling `rpc-wt-9d-fsr` reviewer worktree; pre-open floor + adversarial `factory-security-reviewer` on **every** fold; draft-first until CI green; connector verdict per the Merge Policy with the **once-on-final re-trigger run five times** as the head advanced; independent `pr-triage` before the human-authority merge. The D145 cross-family split was decisive: the same-family Codex author + same-family local `codex review` shipped clean, and it was the cross-family lenses — the Claude `factory-security-reviewer` (which held the floor and confirmed every fix fail-closed) and, critically, the **cloud Codex connector** (a distinct non-deterministic instance) — that caught the fail-opens. Six folds, zero post-merge escapes, `FACTORY_PAUSED` untouched. **Unit 2 (the credentialed, double-gated workflow) and activation (9h) remain separate operator-gated steps.**
