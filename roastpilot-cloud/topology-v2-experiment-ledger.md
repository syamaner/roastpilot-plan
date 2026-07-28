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

### Session-level (as of ~22:13Z, ~5.75h in)
| Bucket | Output | Cache-create |
|---|--:|--:|
| Orchestrator main loop (opus, xhigh) | 1,533,737 | 2,147,116 |
| All sub-agents (1502 turns) | 775,755 | 18,567,626 |
| Model-resolution diagnostic (5 modeltest agents) | 4,056 | 511,860 |

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
