# roastpilot-cloud — Factory apparatus removal epic (plan)

**Status:** Planned, not filed (15 Sep 2026). This is a durable design doc, the
plan-repo home for the removal work. No GitHub issues exist yet; filing the epic
and its slice stories is a separate operator action. Kick it as a
conventional/interactive drive when ready.

**Context.** The autonomous CI factory was decommissioned on 15 Sep 2026
(permanent, non-compliant). `docs/state/registry.md` (#541), the cloud repo's
`AGENTS.md` (#543), and this repo's `factory.md` all carry the decommission
banner. Those changes were prose-only: the executable apparatus (factory
workflows, `scripts/factory/`, `tests/factory/`, factory skills) still sits
in-tree as dormant machinery. This epic removes it.

**Why remove rather than leave dormant.** The dormant machinery is not free:
113 `tests/factory/**` files run inside the required unit-test gate on every PR,
factory-only dependencies keep drawing dependabot churn, and a large
factory-first surface adds cognitive load to every reader of the repo. Nothing
product-facing depends on it, and branch protection is unaffected, so removal is
low-risk once the two embedded general-CI scripts are relocated first.

## Grounding inventory (main @ `ddc4da2`)

- **14 workflows.** Eight are pure factory: `codex-verdict-status.yml`,
  `implement-ready-issues.yml`, `owner-command-intake.yml`,
  `owner-command-issue-intake.yml`, `story-planner-sweep.yml`,
  `story-planner.yml`, `task-agent-read-confinement-probe.yml`,
  `triage-issues.yml`. One is mixed: `claude-code-review.yml` (a keepable
  `claude-review` product job plus factory `spec-grounded-review` /
  `publish-spec-grounding-review` jobs). Five stay: `ci.yml`, `codeql.yml`,
  `dependency-review.yml`, `dev-snowflake-agent-verify.yml`,
  `dev-snowflake-contract.yml`.
- **`scripts/factory/`** is all factory (~60 `.mts` at root plus `eval/` and
  `metrics/`), with two exceptions embedded there that general CI runs:
  `check-invisible-format-characters.mts` (invoked by `ci.yml` gates, a required
  check) and `check-unlicensed-dependencies.mts` (invoked by
  `dependency-review.yml`, a required check).
- **`tests/factory/`** is 113 files, all factory, except that a few cover the
  kept `ci.yml` trusted-gate logic (`trusted-revision-resolver.test.ts`,
  `ci-trusted-gate-*.test.ts`) and must survive.
- **`snowflake/ci_change_classifier.py` and `ci_gate_result.py`** are used by
  the kept `ci.yml` (classify / checks jobs), so they stay despite the `ci_`
  name.
- **`.claude/`**: keep the interactive agents (`implementer`, `pr-triage`,
  `privacy-auditor`, `qa`, `schema-migration-reviewer`, `story-planner`) and
  product skills (`qa-review`, `upstash-ratelimit-js`, `upstash-redis-js`);
  factory skills are `triage`, `to-issues`, `spec-grounded-review`.
- **Branch protection** required checks are all served by `ci.yml`,
  `codeql.yml`, and `dependency-review.yml`; none map to a factory workflow, so
  removal needs no branch-protection change. The only caveat is the two
  relocatable scripts, which sit inside two of those required checks.

## Decisions (operator-accepted at planning, 15 Sep 2026)

- **D-remove-1: remove `claude-code-review.yml` wholesale.** Product PR review
  under the current model is the interactive orchestrator plus the Codex
  connector plus the local `codex review` floor; the CI claude-review lens, and
  the tool-catalog-closure hardening around it (#192 / #204 / #211), is
  factory-era complexity that no longer earns its place.
- **D-remove-2: keep and reframe `factory-security-reviewer`.** It still guards
  protected instruction and configuration edits (`AGENTS.md`, `.claude/**`,
  `docs/state/registry.md`, `.github/**`), which persist after the factory is
  gone; it reviewed the #543 reconciliation itself. Only its factory-pipeline
  framing is dead.
- **D-remove-3: defer AGENTS.md prose simplification** (the now-unpinned
  connector / envelope / roster sections) to the optional final slice or a
  separate follow-up, so the deletion epic stays code-focused.

## Slices

Each slice is a protected-path diff, so each draws `factory-security-reviewer`
and needs a fresh task-scoped operator grant. The ordering keeps CI green at
every step (relocate shared bits before any bulk delete). Conventional /
interactive execution, Codex-authored per slice, pr-triage, human merge.

1. **Relocate the two general-CI scripts** out of `scripts/factory/` (to
   `scripts/ci/`): `check-invisible-format-characters.mts` and
   `check-unlicensed-dependencies.mts`, with their tests moved out of
   `tests/factory/`; update the `ci.yml` and `dependency-review.yml` references.
   This unblocks deleting `scripts/factory/` wholesale without breaking two
   required checks.
2. **Relocate the kept CI-gate tests** out of `tests/factory/` that cover the
   kept `ci.yml` trusted-gate logic (`trusted-revision-resolver.test.ts`,
   `ci-trusted-gate-*.test.ts`) to `tests/ci/`, so they survive the
   `tests/factory/` removal.
3. **Delete the eight pure-factory workflows** and surgically remove the factory
   jobs from `claude-code-review.yml` (per D-remove-1, remove the whole file).
4. **Delete `scripts/factory/`** (the ~60 scripts plus `eval/` and `metrics/`),
   now that slices 1 and 2 relocated the shared pieces.
5. **Delete `tests/factory/`** (113 files minus those relocated in slice 2).
   This also removes the tests that pin `AGENTS.md` prose, un-pinning it.
6. **Config, skills, docs.** Remove the factory `.claude` skills (`triage`,
   `to-issues`, `spec-grounded-review`); keep and reframe
   `factory-security-reviewer` (D-remove-2); prune the CODEOWNERS factory
   entries in lockstep with `protected-surface-lockstep` and
   `enforcement-test-placement` (these couple CODEOWNERS to
   `implement-patch-logic.mts` guard lists, so edit them together); update the
   `AGENTS.md` and `registry.md` routing lists to drop the deleted paths while
   still protecting `.github/**`, `.claude/**`, `AGENTS.md`, and `registry.md`.
7. *(optional, deferred, D-remove-3)* **Simplify the now-unpinned `AGENTS.md`
   factory prose** (connector-verdict section, envelope, roster). Doc-only.

## Keep, do not touch

`ci.yml`, `codeql.yml`, `dependency-review.yml`, `dev-snowflake-agent-verify.yml`,
`dev-snowflake-contract.yml`; `snowflake/ci_change_classifier.py` and
`ci_gate_result.py`; the interactive agents and product skills listed in the
inventory; the inlined `resolve-trusted-revision` block in `ci.yml`.

## Landmines (from the inventory, carry into each slice)

1. The `ci.yml` gates job runs `check-invisible-format-characters.mts`, and
   `dependency-review.yml` runs `check-unlicensed-dependencies.mts`: relocate
   both (slice 1) before deleting `scripts/factory/`.
2. `snowflake/ci_change_classifier.py` and `ci_gate_result.py` are used by the
   kept `ci.yml`: keep them and their `snowflake/tests/` coverage.
3. `vitest.config.ts` includes `tests/**`, so `npm run test` runs
   `tests/factory/**` today: the delete must be atomic with the scripts those
   tests import, or the gates job goes red on missing imports mid-removal.
4. `protected-surface-lockstep.test.ts` couples CODEOWNERS to
   `implement-patch-logic.mts` guard lists byte-for-byte and asserts no
   `.github/CODEOWNERS` exists: adjust CODEOWNERS and this test together
   (slice 6).
5. `agent-model-pin.test.ts` pins `.claude/agents/*.md` model frontmatter:
   relevant when touching the kept agents in slice 6.
6. `claude-code-review.yml` mixes a keepable job with factory jobs: D-remove-1
   removes the file, but its sibling tests and fixtures
   (`claude-code-review-workflow-contract.test.ts`, `spec-grounding-*`,
   `publish-spec-grounding-*`, `claude-review-*`) go in slices 3 and 5.
7. `resolve-trusted-revision` is inlined into `ci.yml` (kept) and every factory
   workflow: no shared file to delete; the kept copy and its tests stay
   (relocated in slice 2).

## Estimated shape

Six core slices plus one optional doc slice. No branch-protection change
required. Highest-risk surface in the repo, so the mandatory adversarial fsr
pass on each slice and the relocate-before-delete ordering are load-bearing, not
optional.
