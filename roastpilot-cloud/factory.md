# roastpilot-cloud — Software Factory Spec (D98)

**Status**: Specced and agreed, 16 July 2026. F1, the implementing epic, has
since built most of the factory; the factory is paused (`FACTORY_PAUSED=true`)
and not yet enabled for autonomous issue→PR flow. Prep work (labels, issue
templates, milestones, C1/F1 story issues) done 16 Jul 2026 directly in the
`roastpilot-cloud` repo.
**Applies to**: `github.com/syamaner/roastpilot-cloud` only. The agent repo
keeps its interactive operating model (D23); safety-critical code is never
factory-autonomous.
**References**: Warp, "How to build a cloud software factory — the automatic
triage skill"
(<https://www.warp.dev/blog/how-to-build-a-cloud-software-factory-the-automatic-triage-skill>);
`bholmesdev/hubble.md` (<https://github.com/bholmesdev/hubble.md>) — working
reference implementation whose workflow structure we adapt. Platform
substitution: GitHub Actions + `anthropics/claude-code-action` (already proven
in the agent repo's `claude-code-review.yml`), not Warp Oz. No new platform, no
new billing.

---

## 1. Decision (D98)

**roastpilot-cloud epics C2–C8 are built factory-first**: a GitHub-issue-driven
pipeline where agents triage, implement, and review, and a human specs,
clarifies, and merges. C1 (scaffold) and F1 (the factory itself) are built
conventionally, because the factory needs gates, labels, and templates to
exist before autonomous issue→PR flow means anything.

Why this repo is the right testbed, and the agent repo is not:

1. **Non-safety-critical.** Worst case is a broken web page, never a hot
   roaster. The Architecture Invariants that make agent-repo autonomy
   dangerous do not exist here.
2. **The hardest factory prerequisite is already house discipline.** The
   stated limit of the pattern is poorly-specified work; the fix is
   well-specced issues. The plan-repo → epic → story pipeline already
   produces exactly that, and D97's plan decomposes naturally into thin
   slices.
3. **Deterministic, cloud-friendly verification.** TypeScript strict +
   Vitest + Playwright against Vercel preview deploys; no hardware in the
   loop anywhere.
4. **The back half already exists.** Automated Claude Code Review, Codex
   (advisory-but-triaged), branch protection with conversation resolution,
   codecov, pr-triage independence (D23), the Codex-wait merge rule: all
   proven in the agent repo and ported as-is.

## 2. What stays human (permanently, not "for now")

- Plan-repo decisions (D-numbers), epic definition, scope rulings.
- Answering `needs-info` triage outcomes and adjudicating `needs-discussion`.
- **Merging.** The factory ends at "PR open, CI green, reviews in"; branch
  protection plus the Codex-wait rule is the human gate. Auto-arming merge is
  an explicit later decision gated on the §10 track record, not a default.
- Secrets provisioning (Snowflake keys, Vercel, Anthropic API), account
  setup, anything touching spend or security posture.
- Reviewing and applying `to-issues` decomposition output before any story
  becomes `ready-to-implement` (§7).

## 3. Pipeline

```text
issue opened
   │
   ▼
[seed]      dumb job: apply needs-triage if no readiness label
   │        (agent failure always leaves a known inbox state)
   ▼
[triage]    read-only agent job: triage skill → structured JSON verdict
   │        (no writable token in this job)
   ▼
[apply]     privileged job: swap readiness label, post triage comment
   │
   ├─ needs-info / needs-discussion / wait-to-implement → stops, human acts
   │
   ▼ ready-to-implement
[implement] read-only agent job: checkout (persist-credentials: false),
   │        implement, run local gates (lint/typecheck/unit), emit patch
   ▼
[publish]   privileged job: push feature/{issue}-{slug}, open PR
   │        (Closes #N / Refs #N per house rules)
   ▼
CI gates + review roster (Claude Code Review inline, Codex advisory)
   │
   ▼
human: pr-triage adjudication → Codex-wait → merge
```

**Staged autonomy**: for the first stories, the triage→implement chain is
broken on purpose; implementation runs by manual `workflow_dispatch` after
the human reads the triage comment. Direct chaining (label event triggers
implement, as hubble.md does) is enabled once §10's criteria are met.

## 4. Label taxonomy

Exactly one readiness label on every open issue (the seed job guarantees it):

| Label | Meaning |
|---|---|
| `needs-triage` | Inbox state; seeded on open, replaced by triage |
| `ready-to-implement` | Specced, thin, verifiable; the factory may build it |
| `ready-for-conventional-implementation` | Specced and verifiable for conventional/interactive delivery; deliberately does not authorize the factory workflow |
| `ready-to-spec` | Sound idea, needs decomposition/spec before building |
| `needs-info` | Triage could not proceed; question posted, human answers |
| `wait-to-implement` | Specced but held (dependencies, M1-deadline rule, sequencing) |
| `wontfix` | Closed with reasoning (pairs with `prevented-pre-pr` where it prevented work) |

Plus: `epic:F1` / `epic:C1` … `epic:C8` (routing + metrics), and the house
`prevented-pre-pr` label.

## 5. Issue quality bar

The story issue template (in-repo, `.github/ISSUE_TEMPLATE/story.yml`)
requires: plan link (which epic §, which plan lines), acceptance criteria as
checkboxes, in-scope surface (files/areas), out-of-scope statement,
verification notes (which suite proves it), and a size declaration (target
about 400 changed logic lines; a materially larger unit explains why splitting
would reduce reviewability; tests are excluded from the estimate and a test
diff over 600 lines requires pre-open QA). Triage enforces this bar: an issue
missing any of it comes back `ready-to-spec` or `needs-info`, never
`ready-to-implement`.

**Plan-small addendum (D104, 19 Jul 2026):** the size declaration is a **PR
plan**, not a hope — each ready issue maps to one or more ordered coherent
review units normally targeting about 400 changed **logic** lines each (tests
are excluded from the estimate), and the issue names their dependencies/order
and the **domain reviewer** each diff triggers (AGENTS.md rubric). A materially
larger unit records why it is more reviewable than the available splits. An
issue without the ordered, sized, reviewer-tagged plan is not
ready-to-implement. D119 supersedes D104's original binary size and exact-one
mapping; the decomposition and reviewer-routing gate remains.

**Execution-path boundary (D120-D122, 25-26 Jul 2026).** D119's size guide
governs conventional/interactive review units. The current automated publisher
cannot run independent pre-open review or produce multiple commits, so
`factory-dispatchable` issues retain an exact fail-closed technical envelope:
one issue/commit/PR; at most 400 combined changed textual lines across every
path category; a captured patch artifact no larger than 2 MiB; no binary patch;
and no mix of allowlisted inert
data/fixtures/generated/design-doc output with logic or tests. Migrations and
operational or unknown documentation are logic. The
privileged publisher classifies both the captured patch encoding and the
applied scratch-index diff before any push. Anything materially larger,
mixed-output, or otherwise requiring pre-open `qa` routes to conventional
execution and receives
`ready-for-conventional-implementation`, never the factory-authorizing
`ready-to-implement` label. Factory data plus logic remains separate issues/PRs
until multi-commit publishing exists. This exact automated envelope is a
temporary capability constraint, not a reversal of D119's general
reviewability guide.

**Dry-run / meta-issue exemption (18 Jul 2026, ruling from the first live
implement dry-run).** An internal factory-validation / dry-run issue — one
that exists to exercise the pipeline itself rather than ship a plan-derived
feature, and that self-declares as such — is **exempt from the plan-link
requirement**: it may substitute a reference to F1-S6 ("End-to-end dry run on
a sacrificial issue", §11) for the plan link, and triage must not bounce it to
`needs-info` on the missing link alone. All other §5 items still apply. (This
ruling was itself surfaced by triage: on the first live dry-run it correctly
recognised the meta nature of the issue, refused to guess whether the rule
bound it, and routed to `needs-info` with the question — the intended
surface→escalate→adjudicate loop. The exemption is the adjudication.)

## 6. Workflows (implemented in F1; structure adapted from hubble.md)

- **`triage-issues.yml`** — `on: issues [opened]` plus `workflow_dispatch`
  (manual/backfill re-triage, D116); seed → triage → apply as in §3.
  Concurrency group per issue number, `queue: max` — NOT cancel-in-progress;
  D133 records they are mutually exclusive, and `queue: max` is load-bearing
  so a run is never cancelled mid-generation-write. Triage skill output is
  structured JSON (readiness + reasoning + missing-info questions) validated
  by the apply job before any label write.
- **`implement-ready-issues.yml`** — `on: workflow_dispatch` (stage 1), plus
  `issues [labeled: ready-to-implement]` (stage 2, once enabled). Agent job
  has `contents: read` only and `persist-credentials: false`; a separate
  publish job holds the write token and pushes the branch + PR. Concurrency
  per issue, no cancel (never orphan a half-published branch).
- **`claude-code-review.yml`** — now holds three jobs: `claude-review`, ported
  from the agent repo unchanged in spirit (`/code-review --comment`, inline
  findings block via conversation resolution, the check itself not required);
  plus `spec-grounded-review` and `publish-spec-grounding-review`, the F1-S9
  anti-gaming pipeline (D107).
- All third-party actions pinned by SHA. **The repo is PUBLIC (D100)** — so
  GitHub Advanced Security (CodeQL, dependency review, secret scanning + push
  protection) is free and the native gates are used directly; the OSS-fallback
  plan below (osv-scanner, gitleaks) is superseded. See D100.

## 7. Skills (in-repo, `.claude/skills/`)

- **`triage`** — read-only. Judges an issue against §5's bar and the plan
  repo (checked out read-only alongside), emits the JSON verdict. Never
  writes.
- **`to-issues`** — decomposes a plan epic (C2…C8) into story issues meeting
  §5, as a *draft batch the PM reviews* before anything is labelled
  `ready-to-implement`. This is why C2+ stories are deliberately not
  pre-created: decomposition is factory work, human-approved. **Per D104 as
  superseded by D119, its output is a PR PLAN**: per story — ordered coherent
  review units, scope, approximate logic size (normally about 400 lines),
  dependency order, and the domain reviewer each diff triggers.
- **`spec-grounded-review`** — built in F1-S9/D107; read-only-by-construction,
  with no write tools and nonce-delimited untrusted input. It is the read-only
  agent behind the `spec-grounded-review` job.
- Implementation conventions (stack rules, gates, PR hygiene) live in the
  repo's `AGENTS.md` (written at C1), which the implementing agent reads
  like any Claude Code session would.

## 8. Security model

- **Agent jobs hold nothing.** No writable GitHub token
  (`persist-credentials: false`, read-only `GITHUB_TOKEN`), no Snowflake
  secrets, no Vercel tokens. The Anthropic API key is the only secret in the
  agent job.
- **Privileged jobs are narrow.** Label writes, comment posts, branch push,
  PR create. They run deterministic scripts, never agent output as code.
- **Snowflake:** implementing agents run unit tests against the mocked SQL
  API boundary only. Contract tests against `ROASTPILOT_DEV` run in the
  post-PR CI job with a CI-scoped key (DEV database only), inside the
  resource monitor cap (plan.md §15). Post-cutover production keys never
  enter Actions.
- **Vercel previews** come from the Vercel GitHub integration, not from
  tokens in workflows.
- **Review jobs are write-capable, and their tool grant is the load-bearing control.** Unlike the implement agent, `claude-review` runs with `pull-requests: write` and holds `CLAUDE_CODE_OAUTH_TOKEN` (it posts inline comments). #192's probe confirmed a live `gh pr comment --body-file` exfiltration primitive on this surface; #199 narrowed the grant to the inline-comment MCP tool plus a blanket `Bash` deny (T24/T25 pin it), and #204 (Units 1+1b) then denied the full 37-tool SDK-init catalog, removing the bare `Read` so the read end of `Read(env) -> comment` is shut, and restored base-owned configuration from a retarget-hardened trusted revision before the action runs, closing the startup-execution vector (`ToolSearch` is the single deliberate §1.3 residual and surfaces no denied tool). Two reachable write sinks remain, the inline comment and the `update_claude_comment` tracking channel, so #194 stays open on the write side: PR title/body injection and the forgeable model-authored tracking comment persist. #192's tool-grant axis is now closed (Unit 2 landed via PR #211), and the raw-`base.sha` retarget weakness in the `spec-grounded-review` sibling restore and the write-token publish job was closed by #205 (via PR #209), leaving #210 the accepted concurrency residual. See D146.

## 9. Merge policy

Identical to the agent repo's AGENTS.md, no factory exceptions: green CI is
necessary but not sufficient; every inline thread resolved (branch
protection); Codex is advisory-but-triaged with the wait-for-verdict rule;
`pr-triage` adjudicates independently of the author (D23 — doubly important
here, where the author is always an agent). The factory never merges.

## 10. Cost, metrics, and the autonomy ratchet

- **Per-issue cost**: triage is cheap (read-only, small context);
  implementation defaults to Codex-MCP per D145's credit pivot; the Claude
  `implementer` is the fallback, and the scarce Claude budget is reserved for
  orchestration and the review floor.
- **Metrics**: reuse the PR-flow metrics (churn, avoidable rework,
  findings-pre-open) plus factory-specific ones: triage accuracy (human
  overrides per 10 triages), first-pass-CI-green rate, human-touch minutes
  per story.
- **Ratchet criteria** (each step is a conscious change, recorded here):
  1. Enable triage→implement chaining after ~5 manually-dispatched stories
     with zero triage overrides and ≥80% first-pass green.
  2. Consider auto-arming merge on green+resolved only after a full epic
     (C2) lands factory-built with no post-merge defect traced to a factory
     PR. (The Codex-wait rule makes this mostly moot; revisit then.)

## 11. F1 epic — stories

Stable story scope is listed below. The cloud
[state registry](https://github.com/syamaner/roastpilot-cloud/blob/main/docs/state/registry.md)
is the sole source of live status.

| Story | Scope |
|---|---|
| F1-S1 | Labels, issue templates, milestones, and story issues for C1/F1 |
| F1-S2 | `triage-issues.yml` + triage skill (seed/triage/apply, JSON contract, concurrency) |
| F1-S3 | `implement-ready-issues.yml` (read-only agent + privileged publisher, dispatch-first) |
| F1-S4 | Review workflow port + repo `AGENTS.md` review rubric section |
| F1-S5 | `to-issues` skill + dry-run decomposition of C2 (output PM-reviewed, then labelled) |
| F1-S6 | End-to-end dry run on a sacrificial issue; factory runbook (failure modes, stuck states, cost log) |
| F1-S7 | Pipeline supply-chain and self-modification hardening |
| F1-S8 | DEV Snowflake secret isolation behind a human-gated Environment |
| F1-S9 | Anti-gaming quality gates: mutation testing, test-edit classification, and spec-grounded review |
| F1-S10 | Factory operational safety: kill switch, idempotency guards, and provenance trailer |
| F1-S11 | Held-out factory regression-evaluation harness |

Sequencing: C1 (conventional) → F1 → C2+ (factory). The M2 timing rule is
unchanged: none of this starts while it would compete with the M1 harness
deadline.

## 12. Open items

1. **RESOLVED:** OAuth (`CLAUDE_CODE_OAUTH_TOKEN`), with
   `anthropics/claude-code-action@700e7f8` pinned at v1.0.176.
2. **RESOLVED:** the per-run token-budget guardrail is a hard turns cap in
   `implement-ready-issues.yml`; its input description references “§12 open
   item 2's token-budget guardrail”.
3. **RESOLVED:** triage clones the plan repo read-only.
4. Issue intake beyond the operator (e.g. tasters reporting bugs via the
   public page) is out of scope until the repo is public; revisit at C7.

5. **Oz-pivot option (raised 18 Jul, during the F1-S3 live-commissioning grind — a
   real decision for the C2+ phase, NOT M2-F1).** The self-assembled GHA +
   `claude-code-action` substrate has a recurring tax: runner-environment gremlins
   the managed Oz platform would eliminate (the ENV_SCRUB/bubblewrap/AppArmor-userns
   fight is the type case). Operator inputs (18 Jul): (a) Oz **can** use the Claude
   Code subscription (so no flip to metered/API billing — ongoing model cost stays
   roughly flat), (b) **no** ambassador discount (standard Oz pricing). Consequence:
   the pivot is mostly a one-time MIGRATION cost (days — the security model, guard,
   deterministic publisher, skills, and logic are substrate-independent and carry;
   the GHA/bubblewrap plumbing is discarded, and some of that rigor was only there to
   compensate for GHA not being managed) + a security RE-VERIFY of Oz's own isolation
   /trifecta model. Decision deferred to **after F1 proves the loop end-to-end on
   GHA** (don't pivot mid-grind); revisit at the C2 kickoff with a side-by-side. The
   build thesis ("adapt the Oz pattern without hosted Oz — prove it's portable") is a
   narrative cost of pivoting, but an honest one. **RESOLVED — Oz RULED OUT
   (18 Jul 2026, operator).** The subscription assumption (a) was wrong: the Claude
   Code subscription **cannot** be used with Oz, so a pivot would force metered
   (Warp-credit / Anthropic-API) billing on top of Oz compute — ongoing cost rises
   meaningfully, which was the single factor the whole decision hung on. Combined
   with (b) no discount, the migration doesn't pay for itself. **Decision: stay on
   GitHub Actions + `claude-code-action` for the whole factory (F1 and C2+); absorb
   the runner-environment tax (it's a bounded, one-time-per-gremlin cost, and each
   fix is now written down).** Oz not revisited unless the subscription-compat or
   pricing story changes.

## 13. Soundness validation + hardening (16 Jul 2026 research pass)

A four-angle adversarial validation of this spec (claude-code-action best
practice; the lethal-trifecta security model; Warp/hubble.md source fidelity;
the autonomy-ramp + review-collusion literature). **Verdict: SOUND ARCHITECTURE,
with must-fix gaps before the factory builds anything — concentrated in the
pre-merge CI secret path, pipeline self-modification, and test-strength gaming.**
The read-only-agent / privileged-publisher split is confirmed as GitHub Security
Lab's recommended two-workflow pattern and correctly breaks the lethal trifecta
at the agent job; the staged ratchet + different-model reviewer + independent
pr-triage all match established practice. The gaps below are what those good
instincts don't yet close.

**Must-fix — amends §8 Security:**

1. **Pin `claude-code-action` ≥ v1.0.94** (or a SHA at/after it) — the Jan-2026
   RyotaK/GMO bot-allowlist-bypass CVE fix. Keep `allowed_bots` /
   `allowed_non_write_users` explicit-allowlist (never `*`) and
   `show_full_output` off. Auth: follow the proven house precedent — the agent
   repo's `claude-code-review.yml` already runs `claude-code-action@v1` with an
   **OAuth token + read-only permissions**, so the factory adopts the same at
   F1-S2 (this resolves the §12 auth open item), with Workload Identity
   Federation (OIDC → short-lived credential, no static key) the hardening
   upgrade to weigh later.
2. **Human-gate the DEV-Snowflake-key CI job.** The publisher split does NOT
   cover the post-PR CI job, which by design runs *agent-authored code* against
   the DEV key — the second-order injection pattern (the agent writes the
   exfiltrator; the CI job pulls the trigger; RyotaK/Cline real-world proof).
   Put that job behind a **GitHub Environment with a required reviewer**,
   egress-lock the runner (step-security/harden-runner), and `npm ci
   --ignore-scripts`. Keep the DEV key's blast radius minimal by construction
   (DEV database only, resource-capped, no prod grants).
3. **The agent cannot modify the factory's own pipeline.** Its patch must never
   touch `.github/**` (workflows/actions), the privileged glue scripts,
   CODEOWNERS, or branch-protection config — the Pipeline-Poisoning (D-PPE)
   vector Anthropic's own `security.md` is silent on. Enforce with **CODEOWNERS
   on `.github/` + require-code-owner-review**, AND a deterministic guard in the
   publish path that fails any agent diff touching those paths.
4. **Secret-scan every agent-authored diff** (gitleaks/trufflehog) in the
   publish path before the PR opens; a committed-secret exfil attempt fails closed.

**Must-fix — amends §10 quality gates (the test-strength gaming vector):**

5. **Mutation testing on the diff, over the cloud repo's security-critical
   surface** (the secure views + their baked-in `visibility <> 'private'`
   filter, grants/roles, the Zod/Pydantic range+enum validation, the deletion
   cascade). The measured reward-hack of Claude-family authors (ImpossibleBench,
   ICLR 2026) is **test-file modification / weakened assertions**, and
   first-pass-CI-green + `codecov/patch` *reward* it — both are blind to
   test-strength reduction. A surviving mutant is a fact, not a model judgement:
   the non-model leg the correlated-reviewer finding demands (cross-family
   reviewers still co-accept ~16% of buggy code — two model lenses ≈ far fewer
   than two independent votes). This is what makes the green-rate promotion gate
   trustworthy instead of gameable.
6. **Hard rule: any diff that edits a test, weakens an assertion, or adds
   `# pragma: no cover` cannot auto-chain — it goes to a human.** Cheap,
   decisive, targets the author's dominant measured hack directly.

**Must-fix — operational governance (mostly cheap config, not engineering):**

7. **Aggregate cost caps + alerting** — a per-run token cap can't see N runs ×
   cap or a runaway retry loop. ~~Set an **Anthropic monthly spend limit** (hard
   pause) + a lower usage alert, AND a **GitHub Actions budget** (alerts +
   stop-at-limit) on Actions minutes.~~ **Reconciled by D102 (18 Jul 2026): this
   item assumed METERED billing; the actual model has no metered spend to cap.**
   Anthropic = flat-fee Claude Code subscription (the factory runs on the
   subscription token, not the pay-per-token API), so there is no dollar spend
   limit to set — runaway protection is the factory's own controls (per-run
   `max_turns` cap + the kill-switch, F1-S10). GitHub Actions = free/unlimited on
   a PUBLIC repo with NO payment method on file, so it cannot incur charges
   (fail-safe by construction). So the "cost cap" acceptance is met by the
   billing model, not by config. **REVISIT if any of these change:** repo goes
   private (Actions minutes become metered), a payment method is added, or the
   factory switches to metered Anthropic API billing — at which point set the
   real spend limit + Actions budget. Supersedes the §12 per-run-only open item.
8. **Idempotency guards on non-idempotent GitHub writes.** A naive whole-job
   retry re-fires side effects → a duplicate PR/comment. A branch push is
   idempotent (same ref); **PR-create and comment-post are not** — gate them
   with an "already exists?" pre-check keyed on issue/branch and disable naive
   retry on those steps (guard in the tool layer, not the prompt). Honor
   429/`Retry-After` with backoff on both APIs (GitHub's 100-concurrent
   secondary limit trips a fan-out first). D114 below records the complete
   REST rate-limit response contract used by the shared client.
9. **A manual kill-switch / global pause enforced OUTSIDE the agent's code** —
   the workflow-disable REST endpoint (one call halts everything) + an
   in-workflow "pause flag" repo variable the jobs read first. (An auto
   circuit-breaker on consecutive failures is a fast-follow; the *manual* switch
   is the must-fix.)
10. **A rollback runbook for a bad merged PR** — a documented, pre-tested path:
    Vercel Instant Rollback (stop the bleeding, seconds) + revert-PR (fix
    source-of-truth so it doesn't re-deploy). Design around the Vercel gotchas:
    instant rollback only works for previously-production-aliased deploys,
    doesn't re-apply env changes, and **turns OFF production auto-assign after —
    so auto-deploy silently pauses until someone re-promotes.**
11. **Dependency review on agent PRs.** An agent that adds/bumps npm deps to the
    Next.js app is a supply-chain vector (typosquats, known-vulnerable versions).
    ~~GitHub's `dependency-review-action` is paid on private repos → wire OSS
    `osv-scanner` instead.~~ **Superseded by D100: the repo is public, so
    `dependency-review-action` is free and is wired as the gate** (F1-S4, #37:
    `fail-on-severity: high`, GPL/AGPL deny-list, `fail-on-scopes: runtime,
    development, unknown`).
12. **Provenance trailer on every factory PR** — model ID + prompt/skill version
    + pinned action-SHA + issue ref in the PR body/commit (extend Claude Code's
    `Co-Authored-By`), so a *systemic* bad-PR cause is traceable and agent- vs
    human-authored history is distinguishable. Pair with a human `Signed-off-by`.
13. **A factory-level regression eval harness — the single gap a human merge gate
    does NOT cover.** The gate catches an individual bad PR but not a *systematic*
    quality regression from a model bump or a prompt edit. A modest suite (a
    dozen known issues → expected triage/PR outcomes + deterministic scorers:
    compiles / tests pass / diff-in-bounds), gated in CI on any prompt/model
    change, is the highest-leverage single addition (Anthropic's own eval
    guidance backs the capability-vs-regression split).

**Paywall caveat — RESOLVED by D100 (repo is public):** the caveat below applied
only while the repo was assumed private. GitHub push protection, dependency
review, CodeQL, and artifact attestations are paid (Advanced Security) *on
private repos*, but are **free on public repos** — which this repo is. So the
native gates are used directly (CodeQL #36, dependency-review #37, native
secret-scanning + push protection enabled), and the OSS equivalents (gitleaks,
osv-scanner) are NOT needed. If the repo is ever taken private, revisit: either
budget for Advanced Security or wire the OSS gates.

**D100 (18 Jul 2026) — the repo is public; native GHAS gates supersede the
OSS-fallback plan.** The factory security surface (§6) and the paywall caveats
(§8 #11, the caveat above) were written assuming a private repo. The repo was
made public at C1 kickoff, so CodeQL, dependency review, secret scanning + push
protection, and artifact attestations are all free and are wired as the native
gates (F1-S4: #35 Claude review, #36 CodeQL incl. `actions` + `python`, #37
dependency-review, native secret-scanning). osv-scanner / gitleaks are dropped.
Surfaced when Codex flagged the dependency-review step against the stale
"private repo → osv-scanner" plan text during #37 review.

**D101 (18 Jul 2026) — Snowflake preview isolation + synthetic-telemetry seed.**
Decided before the C2 build starts, so schema/data work inherits it.
- **In-account isolation, not a second account.** One Snowflake account; a
  dedicated PREVIEW environment fully separate from prod: database
  `ROASTPILOT_PREVIEW`, role `ROASTPILOT_PREVIEW_ROLE` (scoped to only that DB
  + warehouse), warehouse `PREVIEW_WH` (XS, auto-suspend 60s) capped by resource
  monitor `PREVIEW_MONITOR` (10 credits/month, notify→suspend), and a **key-pair
  SERVICE user** `ROASTPILOT_PREVIEW_APP` (no password login). Provisioned
  18 Jul.
- **Vercel env scoping IS the safety boundary.** Preview-scoped env vars point
  the app's PR preview deploys at `ROASTPILOT_PREVIEW`; Production-scoped vars at
  prod. Same var names (`SNOWFLAKE_ACCOUNT/USER/PRIVATE_KEY/ROLE/WAREHOUSE/
  DATABASE`, `SNOWFLAKE_AUTHENTICATOR=SNOWFLAKE_JWT`), different per-environment
  values. GH secrets/vars mirror the preview values for CI/migration runs
  (`SNOWFLAKE_PREVIEW_*` + `SNOWFLAKE_PREVIEW_PRIVATE_KEY` secret).
- **Hard rule:** migrations run against **prod only from `main`**; preview/CI
  migrations target the preview DB. A factory-generated migration must never
  reach prod from a PR/preview.
- **Preview/CI data = synthetic, seeded from local M1 roast telemetry, never
  prod, never real users.** A local enrichment pipeline (`scripts/seed/`, run by
  the operator) takes the real M1 roast curves (roastpilot-agent exports /
  `tests/fixtures/` live-roast excerpts), strips/synthesises identifying data,
  fans them into variations for volume, and **synthesises** the user/tasting/
  taster-surface rows. Built alongside the first schema migration (loader needs
  the C2 schema). Build note: multi-line PEM in env — app reads it directly or
  base64-encodes.

**D103 (19 Jul 2026) — shift the diverse lens LEFT: fold Codex before "ready",
not after.** F1's rework is dominated by review findings landing after a PR is
marked ready — F1-S8 alone ran **5 Codex rounds / ~15 real P1s, all post-open**,
on the grant-boundary keystone that two Opus `safety-reviewer` passes called
clean. Root cause: the pre-open review pass was Claude-family only (author +
subagent reviewers), and a same-family lens co-accepts a bug the author already
rationalised; the one lens that reliably caught them (Codex, a different model
family) only ran *after* the PR was ready, so every catch became rework. Three
process changes, codified in `pr-preflight` (step 3 + new step 5) and both
repos' AGENTS.md PR-Hygiene:
- **Diverse-lens pre-open loop (flagship):** open review-worthy PRs as a
  **draft**, trigger `@codex review`, wait for the verdict on the head sha
  (never guess time — match Codex's `Reviewed commit:` sha), fold every real
  finding, only then mark **ready**. A draft-fold is not rework; the same
  finding post-ready is.
- **Fix the CLASS, sweep the repo, pre-open** — one categorical fix + a
  repo-wide `grep` for siblings, never per-symptom patches (the round-2..N
  engine: the sanitizer, git-guard, and identifier-compare classes each recurred
  this way).
- **Snowflake grant-boundary checklist** on any grants/roles/migration diff (no
  PUBLIC grant + PUBLIC audited; USE SECONDARY ROLES is a statement not a
  session param; DEFAULT_SECONDARY_ROLES verified not assumed; future grants
  audited; exact identifier byte-compares) — folds the F1-S8 class up front.
The KPI stays **preventable post-open rework → ~0**, not the gross fix rate:
healthy rework (a reviewer catching a real defect) is the system working and
must not be gamed away. Codex stays advisory-but-triaged — this moves *when* it
runs, not whether it gates.

**D104 (19 Jul 2026) — PLAN-SMALL is a decomposition gate, not a review-time
catch.** (PM directive, from the agent-repo DORA/PR-flow work.) The `to-issues`
decomposition (§7) must output an explicit **PR plan**: each ready-to-implement
issue is exactly ONE thin PR, scoped so its **logic** diff is under ~400 lines —
Snowflake migrations, generated files, fixtures, and docs are exempt from the
cap and get their own issue/PR. Per drafted story the decomposition records:
scope, ~logic size, dependencies/order, and **which domain reviewer the PR
triggers** (AGENTS.md rubric: schema-migration-reviewer for Snowflake/grants,
privacy-auditor for routes/reviewer-data, factory-security-reviewer for
pipeline, qa/e2e). A story that decomposes into "build X" without this ordered,
sized, reviewer-tagged PR list is **NOT ready-to-implement** — this is now part
of §5's intake bar, enforced at the `ready-to-spec → ready-to-implement`
transition by `triage`. Encoded in the `to-issues` skill + §5/§7 + AGENTS.md.
**D119 supersedes D104's binary size cutoff and exact-one mapping; its
decomposition and reviewer-routing requirements remain.**

**D105 (19 Jul 2026) — factory draft-first adopted, with the draft-verdict
amendment; closes #62/#66.** The publisher opens each factory PR as a **DRAFT**;
the diverse lens (Codex) iterates on the draft; `pr-triage`/the lead folds
findings **by class**; only then is the PR marked ready. Iterating with Codex is
expected in the DRAFT phase; **once-on-final-commit / don't-re-litigate governs
only the POST-ready phase.** Two hard-won amendments from the live #64 arc:
- **The draft-phase exit is "no findings within a window", never "clean verdict
  on the draft"** — observed 19 Jul: an explicit `@codex review` on a draft runs
  and posts findings-reviews, but Codex does NOT complete the clean-verdict flow
  (no "Didn't find any major issues" comment) on drafts; a draft waiting for a
  clean signal waits forever. Verdict-at-ready.
- **claude-review skips drafts and runs on `ready_for_review` — but the skip
  must be coordinated with any review-gate/status logic, never shipped alone**:
  a skipped job reports Success, so a gate that treats "the review workflow ran
  successfully" as "a review executed" is satisfied by a run where it never ran
  (the agent repo hit exactly this race). The cloud repo keeps its draft-skip
  (merged in #65) — this repo's context differs from the agent repo's #593
  keep-on-drafts choice because factory PRs will open as drafts routinely and
  double-running claude-review per draft round is cost/noise at factory scale;
  the divergence is deliberate and recorded here (#66 closed on this decision).
  The ready-transition actor today is the lead/`pr-triage` (dispatch-first);
  automation of that transition is an autonomy-ratchet (§10) step, not assumed.

**Supersession note:** superseded for factory PRs (see D142 and AGENTS.md): the
privileged publisher opens factory PRs NON-draft, and the same review roster
runs post-open; draft-first is the model for human/interactive PRs only.

**D106 (19 Jul 2026) — account-role DDL is operator-run provisioning, never
migration-stream work (closes cloud #61). PROVISIONED same day:** the operator
ran the D106 script — roles `ROASTPILOT_AGENT` + `PUBLIC_WEB` (SYSADMIN
hierarchy), prod database **`ROASTPILOT`** (naming confirmed; the
DEV/PREVIEW/prod family is complete), shared warehouse `ROASTPILOT_WH` (XS,
auto-suspend 60) capped by `ROASTPILOT_MONITOR` (5 credits/month, notify 50%
/ suspend 100% / suspend-immediate 110%), warehouse USAGE granted to both
roles. Service USERS deliberately not created (key pairs arrive with C3/C4);
no prod deploy credential (C7 cutover decision). The ACCOUNT-scoped DDL C2 needs
(`CREATE ROLE ROASTPILOT_AGENT` / `PUBLIC_WEB`) is run once by the operator as
ACCOUNTADMIN, the same pattern as the preview/DEV-CI provisioning. Migrations
ASSUME the roles exist and only grant/use them within the database — all of
which the DEV-CI role can deploy and the F1-S8 grant audit can verify. Zero new
CI privilege; the audit's rejection of account grants stays correct-by-design.
The C2 decomposition includes the provisioning step as an explicit runbook
story. (Same batch of operator decisions, 19 Jul: cloud #47 = close the
review-job Bash exfil path THEN enable the Claude lens on factory PRs, in S7;
#59 = the PUBLIC-audit completeness limit ACCEPTED, closed; #58 folds into S6;
the live DEV dispatch bundles into S6's dry run; S6 additionally scopes the
@claude PR feedback loop + the codex-verdict stamp-and-flip status; C2 kicks
off after F1 completes.) **Forward note:** this prediction did not land as
framed: #47 resolved Option B (1 Aug), staying open and NOT enabling the lens;
the Bash exfil path was narrowed separately by #199 (merged, partial —
#194 residual, #192 since closed). See D146.

**D107 (21 Jul 2026) — F1-S9 spec-grounded review: design + security model +
the completeness slice (documents shipped work; the §14 "should-add"
spec-grounded-review item, now built).** F1-S9 landed anti-gaming quality gates
in three parts (mutation testing, the anti-gaming diff classifier, and the
spec-grounded review pipeline); this decision records the pipeline's design so
the plan reflects the merged reality (the §11 table previously stopped at F1-S6).

- **Architecture (controller owns the loop; the LLM advises — the M1 invariant
  holds here too).** A **read-only** review agent (no write token, no MCP write
  tools) reads the linked issue's acceptance criteria + the PR diff, both
  fenced as UNTRUSTED behind a **per-run CSPRNG nonce delimiter** (unforgeable —
  ends the char-class-guard arms race), and emits a typed verdict artifact. A
  separate **deterministic publisher** (privileged, `pull-requests: write` only)
  re-derives kind/severity from a TRUSTED `criteria-spine.json` (metadata only,
  no agent text) and turns the verdict into merge-gating inline comments +
  a summary. The agent cannot self-grade: severity is deterministic
  (`closing && !satisfied → blocker`), omitted criteria default to unsatisfied.
- **Security model (hardened over ~9 Codex rounds on cloud #87).** Publisher
  runs from `ref: base.sha` (never PR head — a PR must not rewrite its own
  judge), full checkout + `npm ci --ignore-scripts` off the base lock, minimal
  permissions (no id-token/contents:write), fail-closed artifact parsing
  (byte-cap → `isUtf8` → strict schema → cross-field invariants), fail-loud
  workflow-output validation (a runner regression must fail the step, never
  fabricate a no-op), capped attacker-influenced lists (65536-char comment
  limit), and TOCTOU revalidation of head-SHA + references before any
  destructive delete. Two-tier gating: inline blocker threads hard-gate via
  `required_conversation_resolution`; the summary/fallback is operator-attention
  (the publish job is NOT a required check — a skipped required check would
  deadlock the draft/dependabot/fork classes).
- **Go-live (operator, 21 Jul):** the gate is LIVE on the repo's own non-draft
  human/claude PRs (non-required, reversible); factory-bot enable is **#47**
  (which also closes the review-job Bash exfil path, per D106's S7 note).
  **Forward note:** this prediction did not land as framed: #47 resolved Option
  B (1 Aug), staying open and NOT enabling the lens; the Bash exfil path was
  narrowed separately by #199 (merged, partial — #194 residual, #192 since closed). See D146.
- **Completeness slice — cloud #90 (folds #88/#89), must-fix before #47.**
  On `hasCriteria: true`, generation-aware reconciliation auto-deletes only
  **no-obligation** individual blockers whose closing reference was removed or
  downgraded, plus the diff-truncation aggregate only when **no current closing
  references remain**. The aggregate boundary preserves #77's interim
  cross-object-staleness guarantee: linked-issue criteria can change without a
  PR event, so a still-closing aggregate persists until #77 adds revision-aware
  revalidation. Reconciliation deliberately leaves verdict-satisfied threads
  for independent human/lead
  resolution so the review agent cannot self-unblock a PR. That path's
  generation guard ensures an older run never deletes a newer run's valid
  thread. The separate `hasCriteria: false` generic cleanup gets the same #88
  generation comparison in **90.6a-4**, sequenced after aggregate
  reconciliation and before the remaining 90.6b accuracy work (reopened by the
  90.6a-3 self-audit; placement approved 23 Jul). This closes the cross-run
  ownership race but not the pre-existing same-run REST window after the
  no-reference recheck: a body edit can make an older blocker applicable again
  before its DELETE. **90.6a-5** closes that distinct TOCTOU before #47 by
  revalidating after comment pagination at the destructive boundary, stopping
  fail-closed with an accurate partial-delete result on drift (merged as cloud
  #107, 23 Jul). Delete counts cover confirmed successful responses only; a
  failed DELETE response is explicitly indeterminate, and no later candidate is
  attempted. Any partial destructive cleanup force-publishes a PR-visible
  warning even when no prior summary comment exists. The slice also adds
  kind-aware +
  all-paths new-closing-reference revalidation (a body-edit `Refs↔Closes` change
  must not leave a stale gate or stale all-clear), a **complete
  reviewed-closing-set spine contract** (including closing issues with zero
  unmet criteria), runner-observed base-SHA verification, filtered fallback
  accuracy, and count/comment-budget accuracy. The original 90.1–90.6 plan was
  refined during implementation: 90.2 absorbed base provenance; 90.5 split out
  its current-state and TOCTOU hardening; and 90.6 split into bucket/fallback/
  aggregate-reconciliation/no-criteria-generation sub-slices plus final count,
  non-blocking-staleness, and assembled-comment-budget work. Each implementation
  PR remains ≤400 logic lines and routes through `factory-security-reviewer`
  (plus `qa` for accuracy slices). The remaining 90.6b work is serialised as:
  **90.6b-1** one assembled-comment budget (including byte-exact omitted-count
  suffix headroom), **90.6b-2** current-applicable count/exit semantics (#89),
  then **90.6b-3** the non-blocking de-referenced staleness filter. This order
  stabilises the final rendering boundary before sharing one applicability
  representation across count, exit, and non-blocking reporting.
  **90.6b-1 merged as cloud #108 on 23 Jul:** the complete summary now reserves
  every required appended section under one 65,536-character budget and both
  skip-list omission suffixes fit inside their exact shared 2,000-character
  allocation; only whole non-blocking bullets can be omitted, with an explicit
  artifact pointer. **90.6b-2 merged as cloud #109 on 23 Jul:** one
  current-applicable blocker count, derived from the same filtered criteria,
  unreviewed issues, and diff-truncation predicate as inline posting, now drives
  the summary headline, fallback inclusion, logging, and filtered exit status;
  de-referenced/downgraded review-time findings are labeled separately in the
  same finding unit. Inline-thread gating, reconciliation, and fallback payloads
  are unchanged. **90.6b-3 merged as cloud #110 on 23 Jul:** non-blocking
  findings whose issue is absent from the current any-kind reference set are
  omitted before rendering and budget accounting; still-referenced findings,
  including closing references downgraded to non-closing, remain visible. The
  existing pre-write reference-snapshot recheck guards that current-state
  decision, and #89 is complete. **Resolution-aware fallback exclusion merged
  as cloud #111 on 23 Jul, completing #90:** the publisher now queries bounded,
  strictly parsed GraphQL review-thread state using the root comment's
  64-bit-safe `fullDatabaseId`. Freshly created blockers and patched blockers
  confirmed on unresolved threads remain inline-only; patched blockers on
  resolved threads, or whose resolution state cannot be confirmed, stay
  visible in fallback and force the existing nonzero publisher result. The
  classification applies to successful all-PATCH plans as well as degraded
  partial plans, including criterion, unreviewed-issue, overflow aggregate,
  and diff-truncation covering markers. GraphQL/API/schema/pagination
  uncertainty omits nothing. #88, #89, and #90 are complete, so #47 is
  unblocked on the reconciliation-completeness axis while retaining its
  separate factory-bot enable and review-job security work. Process note
  (D104 applied retroactively):
  the original d4 grew to ~1224 logic lines across the review rounds — a
  monolith; the completeness work is deliberately sliced up front instead of
  folded.

**D108 (23 Jul 2026) — F1-S7 remaining-slice decisions.** The operator approved
the following boundaries after the S7 state audit:

- Keep `require_code_owner_reviews` **off** until a second independently
  eligible reviewer or team exists. The single current owner cannot provide an
  independent approval, so enabling enforcement now risks a protected-branch
  deadlock.
- While the Claude GitHub App is suspended, factory-authored PRs stay out of
  the Claude lens. Cloud #47 remains a separately specced redesign: its former
  Option A is not viable because the pinned review plugin relies on
  `gh pr view`, `gh pr diff`, and `gh pr comment`. **Reactivation note:** the
  App was reactivated by 27 Jul (see D142's narrative).
- Cloud #102 was delivered as thin PR #113 (`5262e77`). It replaced the
  best-effort regex pin/allowlist audit with a structural parse using the
  typed, dependency-free `yaml` package, including composite-action discovery,
  fail-closed invalid-YAML reporting, and a schema-correct executable-use
  non-vacuity check.
- Cloud #41 (immutable plugin delivery plus stale-synchronize re-review) and
  #42 (unknown-license fail-closed policy) remain separate follow-ups. Their
  post-#102 PM scope audits moved both to `needs-info`: #41 needs approval for
  a SHA-pinned local-marketplace checkout and a separate upstream-guard story,
  because the pinned action rejects ref-suffixed marketplace URLs; #42 needs
  approval for a deterministic `invalid-license-changes.unlicensed` output
  check and its exact-PURL exception policy. Neither is folded into the parser
  slice or implemented before those decisions. D110 below records the
  operator's subsequent approval of both recommendations.

**D109 (23 Jul 2026) — local composite-action audit boundary.** Review of cloud
#102 / PR #113 established that GitHub can execute a local composite action from
outside `.github/actions`, while #102's operator-approved audit boundary covers
only workflow manifests and `.github/actions/**/action.{yml,yaml}`. The cloud
repo currently has no local-action invocation and no action manifest, so this
is a latent gap rather than a reachable bypass. Cloud #114 records the required
follow-up decision: either constrain local actions to the protected
`.github/actions` root, including traversal and symlink handling, or recursively
trace every reachable local action and extend the protected-path model. That
design stayed out of merged PR #113 rather than silently broadening the parser
slice.

**D110 (23 Jul 2026) — F1-S7 follow-up implementation boundaries.** The
operator approved both post-#102 PM recommendations:

- Split cloud #41. The existing issue becomes the thin immutable-delivery
  story: checkout `anthropics/claude-code` at a source-reviewed full commit SHA
  and pass that checkout as a local `plugin_marketplaces` path. A direct
  `https://...git#<ref>` input is not viable because both the pinned and current
  `claude-code-action` marketplace validator require remote inputs to end in
  `.git`; Claude's marketplace-source contract also has no first-class exact
  `sha` field. Cloud #116 tracks the upstream code-review command's
  head-unaware "Claude has already commented" synchronize guard rather than
  folding a behavioral redesign or vendored command into the delivery pin.
  This immutable-delivery story merged in cloud PR #117 (`4396b1c`) with
  `anthropics/claude-code` pinned at
  `2982f951552e94f38cd972764ae94c1d90c41da3`.
- Implement cloud #42 as a repository-owned, typed, fail-closed parser over the
  pinned dependency-review action's `invalid-license-changes.unlicensed`
  output. Do not add a second scanner. Missing/malformed output and any
  unlicensed dependency fail the check. Exceptions are allowed only as exact
  reviewed PURLs through `allow-dependencies-licenses`, with an adjacent
  rationale; broad names, globs, and wildcard bypasses are forbidden. D111
  supersedes this exception allowance after exact-source review proved the
  action's PURL matcher ignores versions.

Both remain conventional F1 pipeline changes with the mandatory
`factory-security-reviewer` pass. Neither decision restores the suspended
Claude GitHub App, changes required checks, or changes branch protection.

**D111 (23 Jul 2026) — unknown-license exceptions are disabled.** Exact-source
inspection during cloud #42 implementation showed that the pinned
`dependency-review-action` does not implement exact-PURL license exceptions:
its `purlsMatch` comparison deliberately ignores PURL versions and compares
only ecosystem plus normalized package name. An entry such as
`pkg:npm/example@1.2.3` therefore exempts every version of `example`, which is
broader than D110's approved exact-reviewed-PURL boundary. The operator chose
the fail-closed option: cloud #42 permits no unknown-license exceptions. The
repository-owned parser fails on every non-empty `unlicensed` result, and the
workflow must not set `allow-dependencies-licenses`. A future exception
mechanism requires a separate decision and exact version-aware enforcement;
it cannot silently rely on the action's broader matcher. This shipped in cloud
PR #118 (`e7fdbd0`) with strict bounded parsing, sanitized failure reporting,
runner-equivalent structural guards against exception inputs, exact-process
failure tests, full changed-line coverage, and the mandatory
`factory-security-reviewer` findings fixed and re-reviewed.

**D112 (23 Jul 2026) — constrain local actions to the protected audit root.**
The operator chose the narrow policy from cloud #114: workflows and composite
actions may reference repository-local actions only through
`./.github/actions/**`. The structural audit normalizes POSIX and Windows
separators plus dot segments before enforcing that lexical boundary. It fails
closed when a local reference escapes the root, targets a missing or
non-directory action, has zero or multiple `action.yml` / `action.yaml`
manifests, or contains any symlink component. Rejecting symlinks keeps the
lexical path, real filesystem target, audit discovery, and protected-path
boundary identical rather than creating a second trusted resolution model.

Every workflow manifest and every action manifest under `.github/actions/**`
is audited independently. Nested local references and cycles therefore cannot
hide an unaudited manifest and do not require a recursive reachable-action
graph. The protected-path / CODEOWNERS boundary remains `.github/**`; local
actions elsewhere in the repository are forbidden rather than widening that
boundary. Cloud #114 is one conventional thin logic PR with mandatory
`factory-security-reviewer` and QA passes.

**D113 (24 Jul 2026) — D112 includes runner-resolved action entrypoints.**
Draft review of cloud PR #119 established that validating only the local action
directory and manifest leaves the same protected-root boundary open through a
Node action's `runs.main` / `runs.pre` / `runs.post`, or a local Docker action's
`runs.image`: the runner resolves those file-backed values from the action
directory, so traversal, an absolute path, or a symlink can execute mutable code
outside `.github/**`. The #114 slice therefore also requires every declared
file-backed entrypoint to be relative to its action directory, contained after
POSIX/Windows normalization, present, regular, and free of symlink components.
`docker://` images are remote identifiers rather than repository paths and stay
out of this filesystem check. This closes D112's chosen boundary; it does not
add import-graph tracing, shell-command parsing, recursive outside-root action
discovery, or a wider CODEOWNERS boundary. The direct-entrypoint closure shipped
in cloud PR #119 (`377fa77`) after the draft finding was independently triaged,
fixed, and re-reviewed.

Cloud #120 tracks that excluded executable-closure policy across Node imports
and spawns, composite shell, container workspace access, and ordinary
privileged workflow `run:` steps. Until #120 records an operator decision, no
repository-local action may be introduced into a privileged factory job.

**D114 (24 Jul 2026) — complete bounded REST rate-limit handling.** Cloud #54
completes #53's shared-client backoff against GitHub's documented REST
rate-limit response shapes. For a `403` or `429`, a valid `Retry-After` remains
authoritative. Otherwise `X-RateLimit-Remaining: 0` plus a valid
`X-RateLimit-Reset` UTC epoch timestamp identifies primary exhaustion and waits
exactly until reset. Either server-directed wait is honored only when it is at
or below the existing 60-second single-wait ceiling; a longer wait fails
without retrying early. A `429` without either usable timing signal starts with
the documented minimum 60-second wait; a continued failure doubles that wait
per GitHub's guidance and therefore exceeds the ceiling, so it gives up instead
of making an early second retry. "Continued" is consecutive per timing source:
a preceding `Retry-After` or primary-reset retry does not consume the first
headerless-fallback slot. An ordinary `403` without the primary-limit tuple or
`Retry-After` still fails immediately.

The existing five-retry budget remains the total-attempt bound. Invalid reset
headers never turn an ordinary `403` into a retry; a bare `429` still takes the
60-second fallback. This is one conventional thin logic PR in
`scripts/factory/github-api.mts` plus focused unit tests, with the mandatory
`factory-security-reviewer` and QA passes. It does not add GraphQL retry
handling, change call-site idempotency, alter workflow concurrency, or modify
the factory's privileged publish/reconcile paths.

This contract shipped in cloud PR #121 (`ac513fb`) after local security, QA,
and independent PR-triage review plus a clean final-head Codex verdict.

**D115 (24 Jul 2026) — reject literal invisible format characters at CI.**
Cloud #71 adds a conventional, human-directed F1-S7 hardening PR because its
workflow and protected scanner changes are outside the factory implementing
agent's writable boundary. A standalone step in the existing CI gates job
runs a dependency-free scanner from `scripts/factory/` before dependency
installation. The scanner replacement-decodes and examines every pathname
returned by `git ls-files -z`, plus every loaded regular-file and symlink byte
stream, and fails on every decoded literal Unicode
`Default_Ignorable_Code_Point`. Pathnames are scanned before allowlist and
entry-type handling, while their raw Git bytes remain the filesystem identity.
The exact-path allowlist exempts content only, never an invisible name, and a
malformed raw name cannot match through its lossy decoded label. NUL or
malformed UTF-8 bytes do not fail by themselves, but cannot suppress detection
of a valid default-ignorable sequence elsewhere in the same tracked entry.
This categorical boundary includes the
originally reported U+200B-U+200F, U+202A-U+202E, U+2060-U+2064, and U+FEFF
ranges plus sibling bidi controls, combining joiners, variation selectors,
tags, and reserved default-ignorables that have the same invisible-review
risk. It corrects the kickoff enumeration after PR #122's independent triage
applied the range-gap lesson already recorded by #70. Diagnostics identify the
path, line, column, and code point without echoing attacker-controlled source
text.

An exact repo-relative path allowlist exists but starts empty; adding an entry
requires a conventional review of the protected scanner. Source and tests use
visible `\uXXXX` escapes or runtime code-point construction instead of literal
forbidden characters. This slice does not rewrite or normalize files, inspect
untracked/generated/dependency content, reject non-default-ignorable Unicode
merely for being non-ASCII, or change any factory publish/reconcile behavior.
It is one PR under the 400-line logic cap, routed through
`factory-security-reviewer` and QA before opening.

This contract shipped in cloud PR #122 (`c0814869`) after local security and
mandatory QA passes, three independently triaged current-head Codex fixes, a
clean final-head Codex verdict, and exact-head Ubuntu execution of all 1,522
tests including the Linux raw-path regression.

**D116 (24 Jul 2026) — deterministic issue-triage backfill uses manual
dispatch.** Cloud #51 adds a required `workflow_dispatch.issue_number` input to
`triage-issues.yml` while retaining `issues: [opened]`. Manual dispatch is the
only new trigger: `reopened` would require mutating issue lifecycle state and
cannot retrigger an already-open missed issue, while `labeled` risks
self-triggering through the triage pipeline's own readiness-label writes.

Both event paths resolve one target issue number, then the seed job validates
it as a positive decimal integer, rejects REST objects carrying the
`pull_request` marker or a non-open state before any write, and publishes the
only value trusted by seeding, agent context, and privileged verdict
validation. Invalid targets cause no issue write. Every triage execution,
including an Actions re-run of the original `opened` event, establishes the
same two-phase hold before the agent starts. Under a short shared per-issue
privileged-operation lock, seed first removes `ready-to-implement`, ensures
`needs-triage`, removes every other superseded readiness label with per-label
mutations, and verifies that non-authorizing readiness state from a fresh read.
Only then does it write and verify the `hold:<run-id>.<run-attempt>` factory
generation. This suspends stale implementation authorization without replacing
unrelated labels from a stale snapshot; the seed job needs no repository
checkout or `contents: read`.
The triage job fetches the target issue's current title, body, state, author,
and structured comments by that number because a dispatch has no
`github.event.issue` payload and a
re-triage must see human clarification. Before the agent sees that context, a
deterministic filter tags and retains authorized clarifications only from the
non-null issue author (regardless of association) or an `OWNER`, `MEMBER`, or
`COLLABORATOR`; all other commenters are excluded. The factory's own prior
triage verdict is retained separately as non-authoritative history only when
both the `gh issue view` actor login (`github-actions`) and exact hidden triage
marker match, so neither an outsider copying the marker nor another bot comment
can amend the issue. Retained context is capped at 50 comments and 64 KiB of
serialized JSON, failing closed with a visible error rather than truncating.
The implementation agent receives the same provenance-filtered bounded
clarifications, so it cannot discard information that made an issue ready.
Because the tracked filter is executable trust-boundary code used by both
agents, the implementing agent cannot edit anything under
`.claude/skills/triage/`: edit-tool denies provide defense in depth and the
publisher's authoritative applied-tree path guard is the load-bearing control.
The privileged apply boundary re-checks open state before
either its verdict or fallback path writes, closing the seed-to-apply race; the
implementation workflow requires open state alongside `ready-to-implement`
before starting the agent, and the privileged implementation publisher
re-checks both REST open state and the exact current `ready-to-implement` label
from one snapshot immediately before any branch or PR write. Seed, apply, and
publish use the same non-cancelling per-issue concurrency group with
`queue: max`; the lock serializes only the privileged state transitions, not
the long-running read-only agent work. Before generation production lands, a
prerequisite publisher fence treats every valid or malformed generation-marker
line immediately adjacent to the exact bot-owned triage comment's terminal
marker as non-publishable. It traverses the complete bounded comment history
with GitHub's opaque GraphQL connection cursor and fails closed when the
connection cannot be exhausted; offset page numbers are unsafe because a
concurrent deletion before a page boundary could otherwise skip the first
comment on the next page. Generation-like text elsewhere in agent-authored
rationale is data, not trusted syntax. Existing marker-only triage history has
no adjacent generation line and continues to use the readiness boundary, so
the prerequisite changes no current dispatch. The factory stays paused and any
pre-fence publish run is drained before generation production is deployed.

Apply re-checks the open issue and its exact hold, replaces that hold with the
validated verdict plus final `<run-id>.<run-attempt>` generation, then mutates
and verifies readiness. The prerequisite fence makes both hold and final
generations non-authorizing during the producer slice, so a committed label
write with a lost response, or a failed recovery attempt, still cannot publish.
Implementation later captures the final generation at eligibility, and publish
replaces the blanket denial with an exact current bot/marker generation match.
Therefore a publisher and re-triage have a clear ordering: a publisher that
acquired the lock first may finish, while a seed that acquired it first
withdraws and verifies readiness before changing the generation. This is
immediate revocation at the privileged publish boundary without cancelling a
process mid-push. Numeric run-id-only markers remain readable as legacy history,
but every new execution includes
`GITHUB_RUN_ATTEMPT` so an Actions re-run cannot alias the prior attempt.
Dispatches from
non-`main` refs run no job and receive a run-unique rejected concurrency group,
so they cannot cancel or replace an
authorized per-issue run;
the existing `FACTORY_PAUSED` gate and pause notice remain authoritative. The
runbook discovers open issues only and uses explicit per-issue dispatches
against current `main` for both paused and disabled windows, avoiding the
old-run workflow-definition hazard of `gh run rerun`.

Delivery is seven ordered conventional PRs, each independently under the
400-line logic cap:

1. **51a — protected bounded context substrate.** Add the shared deterministic
   provenance/size filter, pass that context to triage and implementation, and
   protect the executable triage skill directory at both enforcement layers.
   This slice retains the existing `issues: [opened]` trigger and existing
   seeding/apply/publish semantics; its PR uses `Refs #51`.
2. **51b-1 — shared privileged lock and publisher eligibility fence.** Move
   only seed, apply, and publish onto the same short queued per-issue lock;
   reject non-canonical implementation targets; and re-check REST open state
   plus the exact readiness label before branch or PR writes. Long agent jobs
   stay outside the shared lock, and existing implementation dispatches remain
   operable. This slice uses `Refs #51`.
3. **51b-2a — generation-era publisher deny fence.** Teach the privileged
   publisher to read the canonical exact-bot/marker triage history and reject
   every valid or malformed adjacent generation-marker line across all comment
   pages through an opaque GraphQL cursor, failing closed before local git work
   when complete bounded exhaustion cannot be proved. Because no generation
   producer exists yet,
   current implementation dispatches remain operable. Pause and drain any
   pre-fence publish run before the producer deploys. This slice uses
   `Refs #51`.
4. **51b-2b-i — apply verification substrate and generation primitives.**
   Harden the existing apply path without activating generation production:
   validate the canonical trusted issue number, re-check open state at the
   privileged boundary, verify readiness PUT outcomes, and recover ambiguous
   authorizing writes to the existing fail-closed state. Add the typed marker
   build/extract primitives needed by the next slice. Existing opened-event
   triage remains generation-free and operable. This slice uses `Refs #51`.
5. **51b-2b-ii-a — opened-event two-phase generation producer core.** Keep the
   existing `issues: [opened]` trigger while atomically adding readiness-first
   verified seed holds, bounded unique-comment discovery, exact comment-id
   threading, final/fallback generation production, and run-id-plus-attempt
   identity for apply. Apply writes the validated final generation before
   replacing and verifying readiness; the 51b-2a publisher fence keeps every
   generated state non-publishable even across ambiguous API outcomes. Keep
   the factory paused through this producer-only rollout. This slice uses
   `Refs #51`.
6. **51b-2b-ii-b — deterministic manual dispatch and backfill activation.**
   Add the required dispatch input and run name, canonical target
   normalization/validation, main-only dispatch gates and per-target
   concurrency, current-context wiring, runbook procedure, and backfill
   execution on top of the already-atomic generation producer. This slice
   uses `Refs #51`.
7. **51b-3 — exact-generation implementation consumer.** Require the current
   dotted authorizing generation before the implementation agent starts and
   have the publisher re-check the same canonical exact-bot/marker history
   under the shared lock. Legacy numeric and hold generations remain readable
   history but cannot authorize publication. This slice records final state
   and closes #51.

Slice 51a shipped in cloud PR #123 (`eec686c2`) with 108 production
insertions. Local factory-security, QA, and independent triage passed; all
required CI and `codecov/patch` passed; the exact-head Codex review was clean.
The intentionally optional Claude review check failed while its App
installation was suspended. Slice 51b-1 shipped in cloud PR #124 (`4d3547f0`)
with 53 production insertions. Local factory-security, QA, and independent
triage passed; all required CI and `codecov/patch` passed. Its exact-head Codex
review incorrectly treated the newly documented job-concurrency `queue: max`
property as unsupported; independent triage verified the current GitHub schema,
recorded the accepted 100-item cap and wait-time FIFO semantics, and resolved
the thread with no code change. Slice 51b-2a shipped in cloud PR #125
(`04264719`) with 216 production insertions. The initial offset-page draft was
stopped before open when local factory-security review found that an unrelated
comment deletion could shift a page boundary and skip generated history; the
shipped publisher uses opaque GraphQL cursors and rejects partial, malformed,
errored, or unexhausted bounded responses before local git work. Local
factory-security, QA, and independent triage passed; all required CI and
`codecov/patch` passed after the five initially partial branches were covered;
the exact-head Codex review was clean. The intentionally optional Claude review
check failed while its App installation was suspended. Slice 51b-2b-i shipped
in cloud PR #126 (`20876886`) with 134 changed production lines. It validates
the canonical open target, verifies label replacements, recovers ambiguous
authorizing writes to the existing fail-closed state, and adds strict marker
primitives without activating generation production. Local factory-security,
QA, and independent triage passed; all required CI and `codecov/patch` passed.
The initially partial non-`Error` normalization branch was covered before
merge, and the exact-head Codex review was clean. The intentionally optional
Claude review check failed while its App installation was suspended. Slice
51b-2b-ii-a shipped in cloud PR #127 (`52facd22`) with 388 effective changed
production lines after the 32-line atomic dead-helper deletion exemption. It
activates verified two-phase generations for the existing opened-event path
only. Two exact-head Codex findings were independently confirmed and folded:
downstream-only re-runs now reuse the seed-established execution, and an
apply-only re-run accepts only that same trusted execution's exact hold or
final generation so it can repair a partial label/fallback failure. Local
factory-security, mandatory QA, and independent triage passed; all required CI
and `codecov/patch` passed; the final exact-head Codex verdict was clean. The
intentionally optional Claude review was skipped while its App installation
was suspended. The factory was paused and verified drained immediately before
merge and remains paused for the remaining rollout. Slice 51b-2b-ii-b shipped
in cloud PR #128 (`fb18fc0b`) with 69 changed production lines including the
validator trust-boundary doc update. It adds current-main per-issue manual
dispatch, rejects non-canonical targets before privileged writes, threads the
seed-validated target through triage and apply, and documents serial backfill
with exact readiness/final-generation verification. Pre-open QA added
behavior-level execution of the validation shell and documented `jq`
verifiers. Independent triage corrected retry guidance to require a fresh
dispatch rather than a downstream-only re-run whose seed generation remains
from attempt 1. Local factory-security, QA, and independent triage passed; all
required CI and `codecov/patch` passed; the exact-head Codex verdict was clean.
The intentionally optional Claude review check failed while its App
installation was suspended. The factory was paused and verified drained
immediately before merge and remained paused for 51b-3. Slice 51b-3 shipped in
cloud PR #129 (`9f49ae73`) with 152 changed production lines. It captures the
unique exact bot-owned final dotted generation before the implementation agent
starts and re-checks the complete canonical history under the shared publisher
lock before any branch or PR write; absent, duplicate, legacy, hold, malformed,
stale, and wrongly-owned history fails closed. Local factory-security, mandatory
QA, and independent triage passed; 1,639 tests passed with one intentional skip,
all changed executable lines were covered, and every required remote check
passed. `codecov/patch` did not post during the worker stall and was non-required
under the temporary operator decision. The spec-grounded review's six
current-head threads were independently dismissed as cross-slice false
positives after verifying the cumulative #123-#128 delivery. Codex's current-head
pagination finding was independently dismissed after a live API trace and the
official GitHub CLI v2.76.0 source confirmed that `gh issue view --json comments`
exhausts the comments connection before returning. All threads were resolved.
The intentionally optional Claude review check failed while its App installation
was suspended. The factory was paused and verified drained immediately before
merge and remains paused; no live triage-agent backfill runs while the Claude App
is suspended. Issue #51 is closed and its project item is Done.

This split was required when the settled 51a+51b draft reached 399 production
insertions before a final exact-head review found the protected-filter,
re-run-alias, cross-workflow race, and partial-write classes. None can be
deferred after merging code that introduces the affected trust boundary.
Reconstructing the corrected 51b design then reached 490 production insertions.
The first attempted split put the generation consumer before its producer, but
mandatory QA rejected that independently inoperable boundary. The corrected
sequence lands the shared readiness lock first, then the generation-era deny
fence, then the apply-verification substrate, opened-event producer, manual
dispatch activation, and exact-generation consumer; every intermediate state
remains operable and fail-closed at its available authorization boundary. All
seven slices route
through `factory-security-reviewer` and mandatory QA before opening and after
review folds. The story does not change triage verdict semantics or readiness
labels;
51a only narrows agent permissions around the new executable sanitizer. Live
agent execution waits for the suspended Claude GitHub App installation to
resume.

The earlier four-slice producer plan relied on readiness alone between 51b-2
and 51b-3. Pre-open factory-security and QA review rejected that boundary:
GitHub can commit an authorizing label write while its response is lost, and a
subsequent fail-closed reset can also fail. No multi-request rollback makes
that outcome atomic. The added prerequisite slice makes generation itself an
interim deny signal, so ambiguous readiness writes cannot authorize
publication. The same review also corrected seed ordering to verify readiness
withdrawal before writing the hold and required preservation of the prior
factory verdict as non-authoritative re-triage context.

The later 51b-2b implementation reached 544 changed production lines despite
staying at 398 insertions. The kickoff cap counts total live-logic churn, not
only insertions; its deletion exemption applies only to an atomically retired
unit. Pre-open independent triage therefore stopped the PR and split a
deploy-compatible apply-verification substrate from generation activation.

After the substrate shipped, the rebased activation draft still reached 421
changed production lines. Independent pre-open triage rejected a no-op manual
dispatch prerequisite as misleading scaffolding. The natural boundary keeps
the seed/apply generation transaction atomic: first produce generations for
the existing opened-event path, then expose deterministic manual dispatch and
its operator runbook on top of that producer. Both intermediate deployments
remain fail-closed behind the 51b-2a publisher fence, and the factory stays
paused until the exact-generation consumer is deployed.

**Must-fix — the factory's OWN PR must actually get reviewed (discovered live,
18 Jul 2026, on the first factory-authored PR #34):**

The publish job opens the PR as `github-actions[bot]` using the built-in
`GITHUB_TOKEN`. GitHub deliberately **suppresses / gates downstream workflow
triggers from `GITHUB_TOKEN`-authored events** (to prevent recursive runs). The
consequence, confirmed on #34: the factory PR's **CI run stalls in
`action_required`** (manual-approval-gated), the **Codex connector does not pick
it up** (same reason it skips Dependabot PRs), and Claude Code Review would not
fire either — so the PR the factory authored autonomously **sails past the entire
review + CI apparatus.** The automation that authors the PR is the same thing that
starves it of review. This is a hole in the review-integrity model, not a nicety.

- **FIX (the linchpin — a real security-posture decision, stays human §2):** the
  publish job must open the PR with a **workflow-triggering identity — a dedicated
  GitHub App token** (recommended: scoped, clean, revocable) or a PAT, **not** the
  built-in `GITHUB_TOKEN`. A PR authored by a proper App identity triggers CI +
  Codex + Claude Code Review exactly like a human-authored PR. Without this, "the
  review roster" cannot run on factory output at all. (Prerequisite for F1-S4;
  needs operator App-creation + secret.)
- **The roster for a factory PR = the same lenses we run on our own** (CI required;
  Codex advisory-but-triaged + the wait-for-verdict rule; Claude Code Review inline,
  not a required check; domain sub-agents routed by the AGENTS.md rubric). **Two
  decisions:** (i) publisher identity = GitHub App (rec) / PAT / live-with-manual-
  CI-approval; (ii) domain sub-agents on factory PRs = auto-run on matching diffs
  vs rubric-routed-for-human-invocation (rec: rubric-routed to start, automate later).
- **Independence is structural here (D23), not a courtesy:** the author of a factory
  PR is ALWAYS an agent, so the implement agent must never triage its own review —
  the human or the `pr-triage` sub-agent adjudicates every finding; the author only
  ever produced the diff. This is the single most important review rule in the
  factory, and the reason `pr-triage` exists.

**Should-add — hardening / correctness of the ramp:**

- **A permanent human spot-audit that survives full autonomy** — 100% of PRs
  touching the security surface (secure views / grants / validation) + ~10%
  random, rotated auditor. The current ramp removes the human at triage and
  never statistically re-inserts one.
- **Re-shape the §10 ratchet gate.** "≥5 with zero overrides" is under-powered:
  n=5 can't distinguish an 80%-good agent from a 50%-good one, and easy tickets
  won't surface the over-eager-on-underspecified-issue mode. Gate on **issue-type
  diversity + a confidence-interval acceptance threshold**; add a **shadow /
  draft-for-audit rung** before auto-chaining; and **weight triage-override-rate
  above first-pass-green** (green-rate is agent-movable — a canary built to be
  gamed; override-rate is a human judgement the agent can't write to).
- **Spec-grounded review** — review against the issue's acceptance criteria, not
  just the diff (green ≠ maintainable/correct-on-edge-cases, per SWE-Atlas).
- Fold at F1: `--ignore-scripts` (malicious postinstall), a guard against
  base64/obfuscated secret leakage in CI logs, and validation of the triage JSON
  at the applier (a prompt-injected verdict must not lie to the privileged job).

**Confirmed good (keep as-is):** the two-workflow trifecta break (§8), the
human-gated merge, the independent pr-triage adjudicator, the different-family
(Codex) reviewer as the *first* independence move, and the
non-safety-critical-repo-as-testbed scoping. hubble.md's
seed/read-only/privileged-publisher attribution verified real in its workflow
YAML. Wording nit: the Warp post *is* the Oz cloud-factory series (uses
`oz-agent-action`) — adapting the pattern without hosted Oz is legitimate, but
soften any implied clean separation.

Sources: Anthropic claude-code-action docs + `security.md`; GitHub Security Lab
two-workflow + pwn-request guidance; GMO Flatt/RyotaK CVE (fixed v1.0.94);
Willison on the lethal trifecta; ImpossibleBench (ICLR 2026); Cursor + Meta on
reward-hacking + mutation testing; "Play Favorites" / "Nine Judges, Two Effective
Votes" on cross-family reviewer correlation; Google SRE canarying-releases.

**D117 (25 Jul 2026) — privileged repository execution is bounded by
credential reachability.** For cloud #120, the operator selected the
protected-glue policy rather than an immutable-artifact system or a general
acceptance of protected code delegating to agent/PR-mutable workspace code.
The policy applies while a secret or a capable GitHub token is reachable, not
indiscriminately to every step in the same job.

The initial issue inventory found twelve jobs with an explicit `secrets.*`
reference or write permission. Pre-implementation security review corrected
that syntactic count: an action step can receive the implicit `github.token`
when its effective job permissions are non-empty even when the workflow never
spells `secrets.GITHUB_TOKEN`. The current boundary therefore covers fifteen
jobs: the eight factory jobs already listed on cloud #120, the DEV Snowflake,
Dependency Review, and CodeQL jobs, plus all four CI jobs. Future jobs fail
closed into the same classification when their effective permissions,
environment, secret expressions, reusable-workflow inputs, containers, or
runtime token production cannot be proven credential-free.

The trust and reachability model is:

- Repository executables have two explicit trusted-source classes. The general
  class is glue protected by the implementing-agent patch guard whose bytes
  come from an exact, already-reviewed revision that the current PR/agent
  cannot choose or mutate. A path named `scripts/factory/**` from PR head is
  not trusted merely because its pathname is protected. The only unprotected
  repository-code class accepted by this decision is `snowflake/**` from an
  exact, already-reviewed main `github.sha`, in the main-only DEV Environment
  job after human approval; this does not authorize unprotected code in any PR
  or agent workflow. Event `base.sha` and that named main `github.sha` are
  acceptable immutable sources only when checkout and any later restore/copy
  operation are verified against the same SHA. Any new trusted-source class
  requires a later operator decision.
- Credential sources include explicit secrets, the implicit `github.token`,
  OIDC request capability, App tokens minted into outputs, checkout-persisted
  credentials and helpers, environment/container/service credentials, and
  tokens or configuration written through output/state/config files.
  Permission inheritance, YAML aliases/merge keys, mapped or inherited
  reusable-workflow secrets, and dynamic secret-context access are part of the
  classifier. Unknown forms fail closed.
- Reachability runs in both directions through time. Mutable code before a
  credentialed step can poison the workspace, `$GITHUB_ENV`, `$GITHUB_PATH`,
  `NODE_OPTIONS`, package/git configuration, installed tools, background
  processes, or containers; a credentialed step can leave equivalent state
  for later mutable execution. A fresh job/runner plus a narrowly validated
  artifact is the default credential cut. In-job cleanup is not initially
  treated as proof.
- Trusted protected code may consume PR/agent-controlled **data** only through
  a typed, bounded contract that rejects unexpected names, types, sizes,
  symlinks, configuration, plugins, hooks, modules, or executables. Parsing
  untrusted diffs, source, coverage, or review artifacts is not itself
  execution; treating executable/configuration input as "data" is forbidden.
- Exact-SHA remote actions are explicit trusted delegation boundaries.
  Repository-local actions are not: `uses: ./...` is forbidden throughout
  every credential-bearing job because composite and container actions inherit
  workspace/context channels too broadly for a step-local textual exception.
  Remote actions that consume workspace data need their own bounded contract.
- Repository Node closure uses a closed supported grammar, not best-effort
  tracing. Literal relative static imports/exports must stay within the trusted
  tree. Dynamic import/`require`/`createRequire`, workers, VM/custom-loader
  paths, native addons, package/bin/script resolution, and child-process shell
  forms are rejected unless a structured exact rule proves the target.
  Approved external commands use a central no-shell executable/argument
  contract; unknown or computed repository execution fails closed.
- Ordinary workflow shell and container execution has its own closed structural
  grammar before any job activates this policy. Aliased or merged `run`,
  `shell`, `working-directory`, job/action containers, services, workspace
  mounts, and environment inheritance are resolved first. Direct scripts,
  `source`/`.`, shell indirection, command substitution, `eval`, package
  scripts/bins, and repository-path arguments must resolve to a trusted source;
  unsupported shell syntax fails closed. A pinned remote container/action is an
  explicit delegation boundary, not evidence that mounted workspace content is
  non-executable.

This decision is specifically the **repository-local executable** boundary.
It names, but does not pretend to cryptographically close, the existing
external trust root: GitHub-hosted runner images, the Actions runner and
expression engine, exact-SHA remote actions and their documented runtime
delivery, declared toolchain installers/versions, and package-manager content
accepted through the existing F1-S7 action-pin, lockfile, install-script,
dependency-review, and license controls. A future hash-complete external
supply-chain closure is a separate decision, not an implied property of D117.

Prompt-controlled misuse of an otherwise trusted credentialed tool is also a
separate capability problem. D117 constrains what repository code can execute;
it does not claim that the current Claude review job's allowed `gh pr` commands
are safe from prompt-driven argument misuse. Cloud #47 owns that Bash/tool
redesign and remains held while the Claude GitHub App is suspended.

Every violation fails the structural CI audit with a source line and no
partial allow. A job is not called compliant merely because its direct
entrypoint is protected while its import/process closure is unattested. The
factory remains paused during this work, and no local action may be introduced
before the first enforcement slice. Delivery is fourteen serial, independently
green conventional PRs off current `main`, each scoped as one coherent review
unit and normally targeting about 400 changed production lines. Every slice
routes through `factory-security-reviewer`, mandatory QA, and independent PR
triage:

1. **120a — credential classifier and all-job local-action ban.** Add the
   minimal semantic YAML classifier for effective permissions, explicit and
   implicit credential sources, environments, aliases/merge keys, reusable
   workflows, containers, and checkout persistence; reject every local action
   in every classified job. Apply this immediately to all fifteen live jobs.
2. **120b — source/reachability/data policy substrate.** Add the typed pure
   analyzer for immutable source provenance, bidirectional state reachability,
   fresh-runner cuts, exact-SHA remote delegation, and bounded data crossings.
   This is analysis substrate only and does not declare a Node entrypoint or
   live job compliant.
3. **120c-1 — closed Node import/provenance verifier.** Add bounded transitive
   static import/export closure, exact module resolution, symlink/realpath
   containment, cycle handling, and canonical closure evidence. It remains
   unactivated until each live boundary migration supplies a complete root set.
4. **120c-2 — Node runtime/process capability verifier.** Reject dynamic
   loaders/code generation and permit only centrally reviewed external process
   capabilities with closed executable, cwd, environment, and argument rules.
5. **120d — workflow-shell/container verifier.** Add the closed whole-step
   grammar and exact allowlist for ordinary `run` roots, working directories,
   shell indirection, package scripts/bins, and job/remote-action
   container/workspace execution. Unknown YAML or shell/container execution
   forms fail closed before any live-job activation.
6. **120e — triage workflow activation.** Enforce the completed classifier and
   closure for `seed`, `triage`, and `apply`: no-checkout inline writes,
   read-only agent/sanitizer execution, and protected exact-SHA apply glue.
7. **120f — implementation-agent credential cut.** The credential-bearing
   pinned Claude action may read and edit the workspace but may not invoke Bash,
   another process tool, package script, or mutable workspace executable.
   Environment scrubbing remains defense in depth rather than the trust
   boundary. Keep agent output as a bounded patch/data artifact and execute the
   resulting tree only in a fresh credential-free job.
8. **120g — implementation publisher activation.** Enforce exact trusted-source
   closure for the write-capable publisher and validate every artifact crossing
   before protected glue, git, or GitHub APIs consume it.
9. **120h — Claude review-agent activation.** Enforce source/data/closure
   contracts for `claude-review` and `spec-grounded-review`, including the
   immutable plugin checkout and the explicit #47 capability residual.
10. **120i — spec-grounding publisher activation.** Enforce the base-SHA
   protected closure and bounded review-artifact contract independently of the
   read-only review jobs.
11. **120j — Dependency Review remediation.** Stop executing a PR-head local
   script in the PR-write job; separate unprivileged validation from a clean
   write-capable pinned-action/reporting boundary with a bounded result.
12. **120k — CI and Codecov credential cut.** Remove unnecessary implicit token
    capability from the four ordinary CI jobs and move Codecov upload to a
    clean job that consumes only a bounded coverage artifact.
13. **120l — CodeQL remote-delegation contract.** Record and enforce the
    exact-SHA remote analyzer as trusted code consuming bounded untrusted source
    data, with no repository-local executable edge in the write-capable job.
14. **120m — DEV Snowflake trusted-main boundary.** Require main-only
    environment approval, exact `github.sha` checkout, and reviewed-source
    verification for every credential-bearing script/migration input; record
    package installation as part of D117's named external trust root. This
    final slice updates state and closes cloud #120.

Slices 120a-120d land the reusable analyzer/enforcement machinery; 120e-120i
activate the eight factory jobs before 120j-120m remediate the adjacent jobs.
Pure analyzer slices make no intermediate compliance claim, and activation
never precedes the closure it depends on. If any measured production diff
materially exceeds the target, the PR plan records whether a responsibility,
security-boundary, dependency-order, or reviewer-load split improves
reviewability. It splits when that analysis identifies a coherent boundary; it
does not split merely to preserve the planned count.

**D118 (25 Jul 2026) — Node closure splits at import provenance versus
runtime capability, with bounded traversal.** The first measured cloud #120
Node verifier was 563 production lines, beyond the then-exact 400-line hard
stop. The operator approved the security-review recommendation to split it
before a PR: 120c-1 owns static import/export and module provenance; 120c-2
owns dynamic loading, code generation, and external process capabilities.
Neither slice activates a live job, and 120d still owns workflow
shell/container launch semantics.

The operator also approved exact 120c-1 traversal ceilings after measuring the
current factory baseline (20 Node files, 18 relative static edges, 844,335
source bytes total, largest file 103,374 bytes):

- at most **128** canonical source files;
- at most **512** runtime static import/export edges;
- at most **1,000,000 bytes** per source file;
- at most **8,000,000 source bytes** across the closure.

The verifier fails closed when any ceiling is exceeded. It rejects symlink or
realpath escape, unsupported/non-explicit local resolution, and ambiguous
external resolution; returns the canonical verified file set so execution-time
byte evidence can be revalidated; and accepts no caller assertion as proof
merely because it is truthy. Package resolution remains within D117's named
lockfile/install external trust root and must resolve to the exact reviewed
package target, not a repository alias or URL-like specifier.

**D119 (25 Jul 2026) — PR size is a reviewability guide, not a binary
cutoff.** The operator superseded D104's binary size and exact-one mapping plus
the size-only parts of D117-D118: conventional PR plans normally target about
400 changed logic lines, but slice boundaries are chosen by coherent
responsibility, security boundary, dependency order, and reviewer load. A materially larger
slice records in its story plan and PR body why it is more reviewable than the
available splits, then passes the applicable domain reviewers and independent
pre-open triage. A large unexplained diff is replanned; a justified cohesive
diff may proceed. Tests remain excluded from the logic estimate. Docs,
fixtures, generated files, and data are excluded only when placed in their own
PR where independently reviewable or at least a dedicated non-logic commit;
atomic deletion remains excluded. The repositories' exact test-volume QA
trigger remains in force. D118's 120c-1/120c-2 split is retained because static
module provenance and runtime/process capability are distinct security
boundaries, not because the original combined draft crossed a line-count
threshold.

**D120 (25 Jul 2026) — execution path is an authorization boundary.**
Conventional-ready work uses the non-authorizing
`ready-for-conventional-implementation` label. Only factory-dispatchable work
may receive `ready-to-implement`. Until the automated publisher gains
independent pre-open review and multi-commit support, it deterministically
enforces the exact factory envelope recorded in §5 against its applied
scratch-index diff and rejects any out-of-envelope patch before push.

**D121 (26 Jul 2026) — factory logic and tests share one 400-line ceiling.**
Every factory patch containing logic or test-source churn is capped at 400
combined changed lines. A changed file under a test root can become
production-reachable through a logic import from either the same patch or an
earlier PR, and the current privileged publisher intentionally does not add a
second, fragile import parser merely to preserve D120's former 600-line
pure-test allowance. This is a conservative temporary authorization boundary:
a larger patch routes to conventional execution, where the existing test-volume
QA trigger still applies. A larger pure-test factory allowance may be
reconsidered after executable-closure enforcement proves test roots are
unreachable from production entrypoints.

**D122 (26 Jul 2026) — every textual factory path shares the ceiling, and
intake exposes the artifact cap.** A path-only inert-output allowlist cannot
prove runtime inertness: an earlier small logic PR can import or read an
allowlisted JSON, fixture, or design document, after which a later output-only
patch changes production behavior. Until executable-closure enforcement exists,
every non-binary changed line therefore contributes to the same 400-line factory
ceiling, including allowlisted data, fixtures, generated output, and design
docs. Path categories remain only to enforce the separate-issue/PR rule for
mixed output plus logic/tests. The publisher's existing 2 MiB captured-patch
limit is also an authorization/intake constraint; work expected to exceed it
routes to conventional execution rather than failing only after implementation.

**D123 (26 Jul 2026) — Node external processes are adapter capabilities, not
per-call exceptions.** The public 120c-1 import verifier remains strict and
continues to reject `node:child_process` everywhere. The combined executable
closure verifier may privately recognize that module only in one exact,
protected central process adapter. No other repository source receives a raw
process API exception.

The adapter exposes typed named capabilities backed by a central reviewed
registry. Each capability closes the executable identity, canonical working
directory, explicit environment, validated argument grammar, and `shell:
false`; callers cannot supply or override raw spawn options. Exact capability
rules are part of the verified executable closure, and an unknown capability,
executable, argument, directory, environment entry, or computed target fails
closed.

The initial supported runtime grammar rejects dynamic `import`, `require`,
`createRequire`, `eval`, `Function` and equivalent code constructors,
`node:vm`, workers, custom loaders/module registration, `process.dlopen`,
native addons, and raw `spawn`/`exec`/`fork` or equivalent external-process
paths outside the protected adapter. A later capability requires its own
reviewed registry rule; it is never authorized by a local call-site allowlist.
120d still owns workflow shell syntax, containers, startup flags, package
scripts/bins, and workflow environment inheritance. This analyzer slice
activates no live job and makes no compliance claim.

**D124 (26 Jul 2026) — runtime analysis precedes the first callable process
capability.** Pre-implementation factory-security review split D118's 120c-2
at a coherent security boundary:

1. **120c-2a** adds one stable-read traversal shared by static provenance and
   a closed, binding-aware repository runtime grammar. The combined verifier
   recognizes the hard-coded protected adapter path and exact allowed
   `node:child_process` import shape in synthetic fixtures only. It does not
   add a production adapter or raw process import.
2. **120c-2b** adds the protected adapter together with its first real named
   capability and migrates one consumer. The executable, canonical working
   directory, fresh explicit environment, command-specific bounded arguments,
   no-shell spawn options, timeout/output/lifecycle behavior, and immediate
   pre-spawn path revalidation are therefore reviewed against a concrete use,
   not an empty registry or generic runner.

The combined verifier analyzes the same canonical path, stable source bytes,
decoded text, and AST for both passes; it never calls the public import
verifier and then re-reads. The adapter identity is internal policy, not a
caller-selected exception, and the public import-only contract remains
universally strict. External locked packages remain terminal exact-resolution
delegations under D117's named lockfile/install trust root, so this repository
AST grammar claims closure over repository-triggered runtime capabilities, not
inspection of arbitrary dependency internals. Both slices remain unactivated
analysis/capability substrate and preserve 120d's separate workflow grammar.

**D125 (26 Jul 2026) — repository runtime analysis is bounded and uses closed
property grammar.** The 120c-2a analyzer admits at most **100,000 AST nodes**
and **256 levels of AST depth** per source file, inside D118's byte ceilings.
The measured current factory maxima are 5,969 nodes and depth 25, so the limits
leave more than 16× node and 10× depth headroom while bounding parser and
analysis amplification. Parser, traversal, or analyzer failure returns a
structured violation and erases all success evidence; it never escapes as an
uncaught availability failure.

Erased ambient declarations do not establish runtime bindings, and default
parameter environments are distinct from function-body `var` bindings.
Non-literal computed member reads, computed destructuring, reflection/code
constructor paths, and identity recovery through `global`, `globalThis`,
`module`, `Object`, or `process` fail closed. Direct `process` and `Object`
properties use exact minimal allowlists derived from the current factory
corpus. The 120c-2a synthetic adapter fixture may prove only the exact protected
named import; every use of its raw process binding remains rejected until
120c-2b adds and verifies the first concrete named capability.

**D126 (26 Jul 2026) — the first process capability is exact Git tracked-path
enumeration.** The operator approved `/usr/bin/git` as the exact executable
identity for 120c-2b. The protected adapter exposes only the typed
`listTrackedPaths(repositoryRoot)` capability and migrates only the
pre-install invisible-format scanner. The publisher's broader Git command
surface remains outside this slice.

The capability canonicalizes the supplied repository root with `realpath`,
requires it to be a directory, and records its device/inode identity. It also
records `/usr/bin/git` as a regular file whose realpath is exactly that path.
Immediately before spawning it revalidates both realpaths, object kinds, and
device/inode identities. The result carries the canonical repository root,
which the scanner must use for every subsequent working-tree load; the
caller-supplied lexical or symlink path is not reused. It runs exactly
`["ls-files", "-z"]` with `shell: false`, a 30-second timeout, `SIGKILL`,
ignored stdin, captured stdout/stderr, a 16 MiB output ceiling, and no
caller-supplied spawn option.

The child receives a fresh environment containing only `LC_ALL=C`,
`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=/dev/null`,
`GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`, and the exact protected
`GIT_CONFIG_COUNT=1` / `GIT_CONFIG_KEY_0=core.fsmonitor` /
`GIT_CONFIG_VALUE_0=false` override. The override prevents a repository-local
`core.fsmonitor` setting from executing an external hook during `ls-files`.
The child inherits no `PATH`, Git routing variable, credential, or other
parent state. Nonzero exit, signal termination, timeout/spawn error,
unexpected output type, or output above the ceiling fails closed through a
sanitized capability error and never echoes child stderr.

The executable-closure analyzer admits one raw `spawnSync` call only in this
exact adapter capability. It pins the adapter with a SHA-256 registry over the
exact UTF-8 source bytes. Any source change,
including whitespace or comments, requires an explicit registry update and
review; this retains line terminators that can affect JavaScript semantics.
The analyzer also retains explicit structural checks
for the exact child-process import, capability call, executable, argv,
environment, cwd binding, lifecycle, and output-bound rule. Aliasing,
re-export, duplicate calls, computed registry access, alternate values, or
raw process use anywhere else remains rejected. This is capability substrate:
it neither activates a workflow nor declares a job compliant.

**D127 (26 Jul 2026) — workflow execution evidence precedes exact
authorization.** The operator approved the pre-implementation
factory-security recommendation to split 120d at a responsibility boundary:

1. **120d-1** adds a bounded workflow execution-surface canonicalizer. It
   strictly parses YAML with merge-key and alias resolution, then emits typed
   evidence for jobs, run and action steps, exact effective run text, explicit
   or inherited shell and working-directory values, effective environment and
   action inputs, reusable-workflow references, and job/service container
   configuration. A malformed, ambiguous, excessive, or unknown execution
   shape fails closed and erases success evidence. This slice authorizes no
   execution.
2. **120d-2** matches that canonical evidence against protected exact
   whole-step capabilities and trusted-target contracts. Matching shell text
   alone never authorizes a mutable package script, binary, sourced file, or
   repository path. Exact-SHA remote actions remain trusted delegation
   boundaries, but their workspace access requires its own reviewed contract.

The canonicalizer admits at most **1 MiB** of UTF-8 workflow source,
**256 jobs**, **2,048 total steps**, **4,096 effective environment/input
bindings**, and **100 YAML alias expansions**. A `run` value may contain at
most GitHub's documented **21,000 Unicode characters**. The current maxima
are 65,045 source bytes, four jobs, 28 steps, 22 environment bindings, and no
workflow-level default, job container, or service.

The initial authorization grammar in 120d-2 accepts only explicit
`shell: bash`, with static `run`, `shell`, and `working-directory` fields.
GitHub's implicit Linux shell is not equivalent: it uses `bash -e` with an
`sh` fallback, whereas explicit Bash uses a no-profile, no-rc,
`-eo pipefail` invocation. Workflow/job `defaults.run`, non-Bash or custom
shells, job containers, and services are initially unsupported and fail
closed. The 120d-1 evidence still detects and represents those forms so the
policy cannot miss them. Container actions are likewise not presumed safe:
GitHub automatically mounts `GITHUB_WORKSPACE`, so a pin proves source
identity rather than non-execution of mounted repository content.

This is a responsibility/security split, not a line-count split. Both slices
remain analyzer-only, activate no live workflow, and make no compliance claim.

**D128 (26 Jul 2026) — ordinary shell evidence precedes delegated execution
context.** Actual-diff factory-security review reproduced an evidence collision
in D127's first implementation shape. Two workflows varied only a
`strategy.matrix` payload, passed that payload into a pinned action input, and
produced byte-identical canonical evidence despite executing different
JavaScript. The same draft also accepted non-finite and unsafe YAML numbers
whose JavaScript values collapse during serialization. Neither class may reach
an exact authorization registry.

The operator-approved 120d-1/120d-2 boundary is therefore refined at a second,
security-relevant responsibility boundary:

1. **120d-1a** canonicalizes bounded ordinary `run` jobs only: strict YAML,
   exact runner labels, workflow/job/step environment precedence, run defaults,
   step controls, exact run text, shell, and working directory. Action steps,
   reusable-workflow jobs, strategy/matrix, job outputs/needs/environment or
   lifecycle controls, containers, services, and every other unmodeled
   execution/context producer fail closed with no success evidence. Scalar
   evidence rejects non-finite or unsafe numeric values.
2. **120d-1b** adds the delegated/context surfaces as typed, bounded,
   injective evidence: action inputs, reusable-workflow inputs/secrets,
   expression producers and job controls, containers/services, and remote
   workspace delegation. It must prove that execution-affecting accepted fields
   cannot vary while serialized evidence remains equal.
3. **120d-2** remains the exact whole-step authorization policy and does not
   activate until both evidence slices are complete.

This split is not driven by the draft's 1,258 production lines. It isolates the
delegation/context machinery where a concrete collision existed. The
intermediate ordinary-shell canonicalizer is independently safe because it
authorizes nothing and rejects, rather than ignores, every deferred form.

**D129 (26 Jul 2026) — workflow identity is canonical execution evidence.**
Independent pre-open triage of 120d-1a reproduced a second identity collision:
two byte-identical accepted workflow bodies at different repository paths
produced equal evidence even though GitHub exposes the path through
`GITHUB_WORKFLOW_REF`; when top-level `name` is absent, `GITHUB_WORKFLOW` also
falls back to the workflow path. Content-only evidence is therefore
insufficient for an exact authorization registry.

The 120d-1a canonicalizer must take a bounded, validated repository-relative
path directly under `.github/workflows/`, include that exact path in success
evidence, and fail closed when the path is absent or malformed. Tests must prove
that named and unnamed byte-identical bodies at different paths cannot collide.
The path does not authorize the workflow: 120d-2 still owns exact whole-surface
authorization, after 120d-1b completes delegated/context evidence.

**D130 (27 Jul 2026) — ordered context evidence is injective and
fail-closed.** The operator approved all five 120d-1b contracts and the
pre-implementation factory-security decomposition:

1. **120d-1b1** adds a bounded ordered canonical-value grammar; complete
   trigger declarations; exact opaque expression/template strings; effective
   workflow/job permissions and concurrency; and ordinary-job
   `needs`, `if`, matrix, outputs, environment, runner, and lifecycle context.
2. **120d-1b2** adds static full-SHA remote action and reusable-workflow
   delegation evidence, including ordered inputs/secrets, workspace-capability
   markers, and a separate reusable caller-token delegation marker.
3. **120d-1b3** adds job containers, service containers, and mounted-workspace
   evidence.

The five contracts are: ordered canonical values preserve every
execution-significant mapping and sequence distinction; expressions remain
exact opaque strings rather than being parsed or evaluated; matrix evidence
preserves the exact declarative specification without expansion; delegated
execution uses distinct typed unions with no analyzer-authored `trusted`
assertion; and effective permissions are canonical evidence using the same
resolution semantics as 120a's credential classifier. In particular, absent
`permissions:` resolves to that conservative default, and a read-effective
action step still carries the implicit `github.token`.

Injectivity is a hard acceptance property: two materially different accepted
execution surfaces, including a near-miss differing only in a
security-relevant field, must never serialize to identical evidence. Evidence
admits at most **16,384 canonical values**, **32 levels of canonical-value
depth**, **256 services**, **4,096 effective bindings**, and D127's **1 MiB**
source ceiling. Unsafe integers, fractions, malformed values, or any exceeded
bound produce an explicit conservative `unanalyzable` / `over-limit`
violation and erase all success evidence; no path truncates, skips, or emits a
partial success surface.

Local or dynamic `uses` remain rejected. Every accepted action or container is
marked workspace-capable, reusable calls carry their separate caller-token
marker, and the analyzer never asserts that a target is trusted. These slices
remain conventional, analyzer-only, activate no workflow, make no compliance
claim, and cannot resume the paused factory. **120d-2 remains the sole owner of
authorization.** Every 120d-1b slice references cloud issue #120 and receives
factory-security, QA, and independent pre-open triage.

**D131 (27 Jul 2026) — trigger normalization, emission accounting, and token
presence clarify D130.** This decision clarifies D130 without reversing it.
The injectivity requirement is one-way: materially different execution
surfaces must not collide, while materially identical spellings should
canonicalize identically so an authorization rule cannot be evaded by syntax.

For trigger declarations only, an event with a null body and the same event
with an empty mapping have the same no-filter execution surface and normalize
to the same canonical event declaration. The equivalent sequence spelling
does too: `on: [push, pull_request]` equals a mapping whose `push` and
`pull_request` values are null/empty. This is a per-construct rule, never a
global `null == {}` rule. Every construct that admits both forms requires its
own explicit tested decision; otherwise the unfamiliar form fails closed.
In particular, absent `permissions:` remains distinct from `permissions: {}`
and from every declared permission map.

The per-workflow-file **16,384 canonical-value** limit counts each emitted
collection, scalar/null, and mapping key. Root depth is **1**. Traversal counts
the expanded canonical emission incrementally and aborts at the first crossing;
an anchor referenced N times costs N emissions. It never builds an unbounded
intermediate structure and measures it afterward. Exactly 16,384 values and
depth 32 are accepted; value 16,385 and depth 33 are rejected independently.
Equivalent trigger spellings that normalize to the same evidence also consume
the same count. The existing 4,096-binding and 1 MiB source/evidence ceilings
remain independent backstops. Whichever ceiling binds first returns one
bounded `resource-limit` violation, no evidence, and no truncation.

Permission evidence has two orthogonal axes. **Token material presence** is
true for every job because GitHub creates a job token and exposes it through
`github.token`, including when declared repository permissions are empty or
read-only. **Declared repository capability** is the axis already used by
120a's `permissionsCarryCredential`: an empty/all-`none` declaration has no
declared repository capability, while a non-`none`, unresolved-default, or
malformed declaration is conservatively capable. 120d-1b1 adds the presence
axis; it does not re-label 120a as having classified token material.

One shared resolver supplies both axes to 120a and 120d-1b1. It preserves
120a's existing fixture verdicts, applies one byte-identical unknown-key
failure rule, and emits a distinct typed `unresolved-default` variant when
permissions are absent rather than fabricating a concrete map. A job
declaration replaces rather than merges with a workflow declaration. The
acceptance corpus includes absent versus declared-equal-to-current-default,
workflow inheritance, explicit empty job override, read/write token presence,
unknown keys, and permission-map reorder normalization. Malformed permissions
remain conservatively capable for 120a but make 120d-1b1 unanalyzable with no
success evidence.

**D132 (27 Jul 2026) — 120d-1b1 closes the ordinary run-step grammar.** This
clarifies D130's scope without changing the 120d-1b responsibility boundary.
120d-1b1 owns exactly these ordinary run-step keys: `run`, `if`, `env`,
`continue-on-error`, `timeout-minutes`, `working-directory`, `shell`, `id`,
and `name`. The list covers both the live corpus and GitHub's documented
ordinary run-step grammar. Any other step key fails closed. In particular,
`uses` and `with` remain delegated-action fields: b1 rejects the whole step,
and b2 may later reuse the context helpers only after accepting the distinct
action-step union.

Step-level `if` is included for **evidence injectivity**, not because its
absence would under-approximate reachability. Without it, two workflows that
differ only in whether an ordinary run step executes emit identical canonical
evidence. Rejecting every conditioned step would also be fail closed, but
would exclude thirteen current run steps and leave the ordinary surface
needlessly incomplete.

Condition evidence is descriptive and never exculpatory. The analyzer records
an `if` but never marks the step non-executing, and no later consumer,
including 120d-2, may prune the execution surface from that condition without
a separate contract. Conditions such as boolean `false` and
`github.event.pull_request.head.repo.fork == false` remain part of the
execution surface because runtime contexts may vary and may be
attacker-influenced.

Expression syntax is preserved, not interpreted or normalized. A bare
condition and a `${{ ... }}` spelling carry distinct typed markers and exact
source strings; structural normalization is reserved for constructs whose
equivalence is decidable without expression semantics, such as D131's trigger
null/empty rule. Boolean `true`/`false` conditions are accepted as typed
booleans and remain distinct from the strings `"true"`/`"false"`. Safe
integer conditions remain typed integers; fractions, unsafe/non-finite
numbers, negative zero, collections, and null fail closed under D130's scalar
rules.

**D133 (27 Jul 2026) — structurally equivalent job-control spellings use one
richer evidence shape.** This extends D131's per-construct normalization rule.
Where GitHub defines a scalar as shorthand for a one-element richer
declaration, 120d-1b1 canonicalizes both spellings to the richer shape and
charges the expanded canonical emission identically. Specifically,
`needs: prep` equals `needs: [prep]`; `runs-on: X` equals `runs-on: [X]`;
`environment: prod` equals the single-key map
`environment: {name: prod}`; and scalar `concurrency: group` equals the
single-key map `concurrency: {group: group}`. Each pair requires equal-evidence
and equal-count tests.

These equivalences are narrow. A runner group/labels map remains rejected in
1b1. An environment map carrying `url` or any other additional field remains
materially distinct and must not collide with the scalar spelling; normalized
environment names still pass through 120d-1a's portable-ASCII and case-fold
collision admission path. A concurrency map carrying
`cancel-in-progress: true` is materially distinct. Explicit
`cancel-in-progress: false` may normalize to omission because `false` is a
fixed platform default.

The runner normalization is evidence-only and deliberately diverges from
120a's conservative credential-reachability predicate:
`runs-on: ubuntu-latest` is approved there, while
`runs-on: [ubuntu-latest]` remains credential-carrying because every
non-string runner declaration fails closed. 120a does not change in this
slice. Both analyzer suites pin that exact divergent pair so neither model can
drift silently; the array conservatism is a possible false positive, not a
fail-open defect.

Default collapsing is permitted only when the platform specification fixes
the default and repository or organization state cannot change it.
`cancel-in-progress: false` qualifies. Permissions do not: absent
`permissions:` remains D131's distinct `unresolved-default` variant because
repository defaults are mutable external state.

`concurrency.queue` remains held from normalization pending an explicit
operator confirmation. GitHub's current
[concurrency specification](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
documents `single` and `max`, calls `single` the default, and forbids
`queue: max` with `cancel-in-progress: true`; nevertheless, 1b1 must continue
to fail closed on the field until the operator confirms that this documented
fixed default satisfies the rule above. An unrecognized or held field is never
silently erased from evidence.

**D134 (27 Jul 2026) - 120d-1b2 admits repository actions only.** The
operator approved one 120d-1b2 slice, **120d-1b2a**, for the repository-action
step union covering the 46 live action steps and 117 declared inputs.
The proposed reusable-workflow sub-slice is cut because the repository has no
live reusable-workflow call. Reusable-workflow jobs remain unconditionally
rejected until a real call is introduced; that introduction owns its evidence
slice rather than pre-building an unused delegation model.

The action-step grammar is closed: `uses`, `with`, `env`, `if`,
`continue-on-error`, `timeout-minutes`, `id`, and `name` are the only accepted
keys. A step with both `run` and `uses`, neither execution key, or any other key
fails closed. There is no held or accept-but-ignore form. Reusable-workflow
jobs, local or dynamic references, direct `docker://` references, mutable refs,
and malformed targets remain rejected with no evidence.

An accepted repository target has exactly
`owner/repository[/action/path]@40-hex-sha`. Parsing is anchored: one `@`,
exactly 40 hexadecimal characters, no empty, dot, or dot-dot segment, no
backslash or repeated separator, and no expression marker. Owner, repository,
and SHA case normalize to lowercase because they are identity components;
action-path case is preserved because it names repository content. 120d-1b2a
matches 120a's case-insensitive owner/repository/SHA comparison for case
variants. The existing 120a Claude-action pin audit also accepts backslash and
repeated-separator spellings after path normalization; 120d-1b2a deliberately
rejects those spellings. That divergence is fail closed on the execution
surface side, is pinned in both suites, and does not change 120a as a side
effect.

Declared action inputs use a mapping whose portable-ASCII identifiers are
sorted in ascending ECMAScript UTF-16 code-unit order with `<` and `>`. Input
order is not execution-significant, unlike matrix declaration order, and
sorting never uses locale or case-insensitive comparison. Identifiers use the
bounded portable grammar and fail closed on case-fold collision. Values
preserve exact typed strings, booleans, safe integers, or null. Null is
distinct from the empty string and an input key is never silently dropped.
Expressions remain exact opaque strings, including secret-referencing
expressions. The acceptance corpus includes an otherwise-identical pair with
and without a secret-referencing input, plus a pair differing only in the
referenced secret name, and requires distinct evidence for both. Absent `with`
and an explicit empty mapping normalize to the same empty richer form and
consume the same budget because the no-input default is fixed by the SHA-pinned
action declaration. The canonical-value budget charges the input mapping
collection once, then one key and one typed value per declared input. Each
declared input separately consumes one of the shared 4,096 bindings.

Every accepted repository action carries unconditional
`workspaceCapability: "read-write"` and
`githubTokenMaterialAccessible: true` metadata. Both are conservative
over-approximations, not observations that a particular target reads or writes
the workspace or explicitly binds the token. They do not replace exact input
evidence, and no analyzer-authored `trusted`, `safe`, or `authorized` assertion
is permitted.

Run and repository-action steps, and ordinary and any future delegated jobs,
use explicit discriminants before 120d-2 has a live evidence consumer. The
discriminants change the serialized schema but not verdicts or canonical
counts. **Only source-derived canonical values consume D131's value/depth
budget; analyzer-emitted type tags, capability metadata, and other fixed schema
keys do not.** Tests pin unchanged live-corpus verdicts and counts across that
schema change, and every union variant receives its discriminant in the same
commit.

The cut reusable-workflow design remains recorded for future use: a remote
call would require an exact full-SHA
`owner/repository/.github/workflows/file.yml@40-hex-sha` or
`owner/repository/.github/workflows/file.yaml@40-hex-sha` target, the
documented closed call-job key set, sorted typed inputs, a distinct
named-secrets versus `inherit` union, effective permission evidence, and
separate caller-context and caller-token delegation markers. It would claim
neither shared caller workspace nor successful checkout. None of that evidence
is implemented until a real call exists.

120d-1b2a remains conventional and analyzer-only. Any violation or resource
limit erases the whole success surface. 120d-2 remains the sole authorization
owner, and the factory stays paused.

**D135 (27 Jul 2026) - one live status authority replaces duplicated
narratives.** Effective when the cloud registry/issue-pointer migration lands,
the operator designates
`roastpilot-cloud/docs/state/registry.md` as the single source of truth for
current story and slice status. GitHub issue bodies retain stable scope,
acceptance criteria, contracts, verification expectations, and a pointer to
the registry; they do not carry live merged/active status. Issue comments may
record dated outcomes, but they are historical evidence rather than a second
status source.

Each normalized registry status cell contains one status label from `Not
started`, `In progress`, `Blocked`, `Deferred`, or `Done`; one current-state
sentence; and compact links to the relevant merged PRs and decision numbers.
Detailed rationale remains in these append-only decision records. The PR that
lands a slice updates its registry row in the same PR; catch-up status commits
are not an accepted operating path.

Before changing status, the owner verifies merged PRs, issue open/closed state,
status labels, and the project item against the GitHub API. Discrepancies found
before merge are reported in the PR body. After merge the owner reads those
same fields again, writes a dated reconciliation comment on the story issue,
and only then completes the project transition. An API read or write failure
is reported at that location and stops the status transition; it is never
treated as success. Plan epic tables contain stable scope plus a registry link
rather than duplicating live delivery narratives. This normalization changes
tracking mechanics only; it does not authorize a workflow, alter issue
acceptance criteria, or unpause the factory.

**D136 (27 Jul 2026) - F1-S6 and F1-S11 are ordered before
implementation.** The operator's S6 additions are part of the stable #9
contract: the first supervised DEV dispatch, owner-only PR question/task
feedback, an advisory Codex-verdict status, #58's remaining optional
hardening, the confidence-based ratchet, a shadow/draft audit rung, and the
permanent security-plus-random human spot audit. They are not one
implementation unit.

After the D135 migration and #120 complete, F1-S6 is delivered serially. Any
remaining live-review/S7 prerequisite must complete before activation. Only
external review/App availability or another explicitly named acceptance-only
dependency may receive an operator waiver in 9b; #47's security/exfiltration
acceptance and every other non-availability S7 control are not waivable:

1. **9a / #58 - remaining DEV-grant/workflow hardening** (about 10-40 logic
   lines). L1's delimiter-safe boundary is already present; decide L3
   explicitly and either move L2's `umask` before `mktemp` or remove the dead
   defense. Schema-migration, factory-security, and QA review.
2. **9b - metrics, ratchet, audit, and capture contract** (0-200 logic lines).
   Define issue-type diversity, confidence threshold, override-first
   promotion, shadow/draft audit, permanent sampling, a repeatable capture
   helper, and the runbook skeleton. Product-PM, factory-security, and QA.
3. **9c - pure Codex-verdict reducer** (250-350 TypeScript logic lines).
   Identity, commit SHA, trigger, staleness, and accepted signal evidence;
   factory-security and QA. Missing, stale-head, wrong-identity,
   unsupported-channel, malformed, or API-indeterminate evidence yields an
   explicit unknown/pending result, never clean/success, and is ineligible for
   the ratchet.
4. **9d - advisory status publisher/workflow** (200-300 logic lines), consuming
   9c. It never becomes a required check; factory-security and QA.
5. **9e - owner-command intake and question path** (300-400 logic lines).
   Closed command grammar, eligible PR/branch checks, read-only agent, and
   bounded comment publisher; factory-security and QA.
6. **9f - existing-PR task publisher substrate** (250-350 logic lines).
   Exact-head authorization, existing self-modification/anti-gaming guards,
   and idempotent publish; factory-security and QA.
7. **9g - task workflow extension** (250-350 logic lines), producing a bounded
   patch artifact through the read-only agent for 9f; factory-security and QA.
8. **9h - supervised evidence session** (zero logic; docs/evidence only).
   Run the sacrificial issue/PR, first live DEV dispatch, question, task, and
   advisory-status paths; then record the observed runbook, baseline, plan
   feedback, and registry transition. Human PM, factory-security, and QA.
   A per-path evidence manifest pins run identifiers, PR/head SHAs, bounded
   artifacts, expected assertions, and observed results. #9 and #11 close only
   when every required live assertion succeeds.

Under D140, D117-D134 analyzer output remains drift-detection evidence rather
than an authorization/admission gate, and 120d-2 is not required. Before any
new 9d/9e/9g job activates, the operator must ratify that job's platform
disposition: remove the credentialed path; disable the job; place an
Environment-only named secret behind required reviewers where that actually
withholds the credential; establish another base-controlled non-bypassable
boundary; or admit a manual path only with an explicit trusted-ref, authorized
identity, approval, and mutable-data/execution contract. An Environment
attachment does not durably gate the built-in `GITHUB_TOKEN`. Each job remains
`FACTORY_PAUSED`-gated and inactive until the supervised 9h window.
Evidence-session defects produce a new coherent fix slice and a fresh 9h run;
9h never mixes a code fix into operational evidence. Generated baseline data
is delivered separately from logic under the repository hygiene rule.

Before 9b/9c/9e, the operator must decide the exact `@claude question|task`
grammar and eligible PR/branch/fork set; the accepted Codex event channels
(GitHub Actions has no native reaction event); the confidence method,
threshold, and issue-type diversity; audit sampling/enforcement; and whether
Claude review availability is an S6 acceptance prerequisite. These are
contract gates, not implementation discretion.

F1-S11 follows S6 and is delivered serially:

1. **14a - eval authorization/product contract** (decision-only). Pin the
   model and base-SHA semantics, expected-label isolation, scorer tolerance,
   credential boundary, and baseline-update authority. Missing cases,
   provider/OAuth failure, malformed or partial output, exact-base mismatch,
   scorer failure, retry/tolerance exhaustion, or an absent baseline is
   non-pass and cannot update the baseline. Define immutable as-of issue input
   snapshots and a case manifest; physical input/expectation separation; the
   producer's network and repository-history access; an isolation test proving
   it cannot read scorer expectations; per-case and aggregate score algebra,
   case floors, timeout/retry aggregation, the drift threshold, and baseline
   comparison.
2. **14b - held-out corpus** (data-only PR). About twelve issue-type-diverse
   historical cases with exact base SHAs and expected outcomes kept outside
   the agent workspace; product-PM and QA.
3. **14c - bounded schema/loader and deterministic scorers** (300-400 logic
   lines). Triage-label and PR outcome scoring under 14a's exact algebra;
   factory-security and QA.
4. **14d - publisher/GitHub-write-credential-free triage replay producer**
   (300-400 logic lines), consuming 14b/14c. A provider credential is admitted
   only under 14a's explicit contract; factory-security and QA.
5. **14e - implementation patch-artifact replay producer** (300-400 logic
   lines). No publish/write credential; factory-security and QA.
6. **14f - fresh-checkout outcome runner** (250-350 logic lines). Deterministic
   compile, test, diff-bound, and mutation-score checks using existing gates;
   factory-security and QA.
7. **14g - orchestration and drift gate** (300-400 logic lines). Skill,
   prompt, and model-path triggers; baseline comparison and bounded report;
   factory-security and QA.
8. **14h - supervised baseline proof** (zero logic; data/evidence only).
   Pin run identifiers, inputs, model/prompt versions, artifacts, score
   components, and assertions; prove the unchanged positive control reproduces
   the baseline within 14a's tolerance and a targeted deliberate degradation
   crosses the drift threshold for the intended scorer before completing the
   registry transition; product-PM, factory-security, and QA.

Under D140, D117-D134 analyzer output remains drift-detection evidence rather
than an authorization/admission gate, and 120d-2 is not required. Before any
new 14d-14g job activates, the operator must ratify that job's platform
disposition: remove the credentialed path; disable the job; place an
Environment-only named secret behind required reviewers where that actually
withholds the credential; establish another base-controlled non-bypassable
boundary; or admit a manual path only with an explicit trusted-ref, authorized
identity, approval, and mutable-data/execution contract. An Environment
attachment does not durably gate the built-in `GITHUB_TOKEN`. In addition, 14a
must decide whether those jobs honor `FACTORY_PAUSED` or a separate fail-closed
eval pause; no eval job activates without one of those explicit pause gates.
The 14g path remains manual/inactive through the supervised 14h proof and may
activate only in a separate explicit transition after that proof succeeds.

14a must resolve whether replay calls the pinned provider or consumes recorded
outputs; safe OAuth use on PR-triggered changes; stochastic tolerance/retry;
historical exact-base checkout; expected-answer isolation; and who may approve
baseline updates. Recorded outputs may test the harness but cannot alone satisfy
#14's model/prompt regression acceptance; that requires pinned-provider
execution unless the operator explicitly changes the issue contract. A defect
found in 14h produces a new coherent fix slice and a repeated evidence run;
baseline data remains separate from logic. Until 14a resolves these gates #14
stays `Not started`/`wait-to-implement`.

**D137 (27 Jul 2026) - same-PR registry updates use merge-relative
wording.** D135's first use in cloud PR #138 exposed a timing defect: a row
that says a slice "is active" is accurate while reviewing the branch but
becomes stale at the instant that same PR merges. The post-merge API check
reported the discrepancy on cloud #120 and stopped the transition as D135
requires.

Future slice PRs describe the state that becomes true when the PR lands:
delivery is complete *through* the slice, the next planned slice is named,
and any pause/authorization boundary is restated. The row includes the current
PR in its merged link list. This proposed branch wording does not alter the
live authority before merge because only the default-branch registry is live;
on merge it becomes true atomically with the implementation.

One reviewed mechanism-repair PR is required to correct #138's first-use drift
and record this rule. It is not precedent for routine status-only catch-up
commits: later drift remains a D135 process failure, must be reported, and
stops the transition. Post-merge verification still checks PR state, issue
state, labels, project item, registry wording, and links before the next slice
begins.

**D138 (27 Jul 2026) - unused container and service evidence is rejected,
not pre-built.** The operator cuts 120d-1b3. The measured live workflow corpus
contains zero job containers and zero service containers, so a dedicated
evidence slice would model a producer with no current consumer. The existing
canonicalizer's unconditional rejection is the complete fail-closed behavior
for those forms.

This applies the direction test: rejecting an unused execution form may create
a future false positive when a real container job is proposed, but it cannot
admit an unmodeled credential-reachable surface. Pre-building container,
service, mount, and workspace evidence would add maintenance and review load
without reducing current exposure. If a real container or service job is
introduced, that change must first own a new evidence contract and adversarial
acceptance tests; it cannot weaken or bypass the rejection as a side effect.

The workflow analyzer track therefore ends at the merged 120d-1b2a evidence
surface for now. This retirement does not authorize any workflow, activate any
factory path, or adjudicate the separately held 120d-2 policy decision. The
factory remains paused.

**D139 (27 Jul 2026) - factory rigor is calibrated by failure direction and
live exposure.** Security rigor remains mandatory, but implementation depth is
chosen proportionally rather than by accumulating hypothetical forms or
finding counts. Every factory kickoff and review applies these rules:

1. **Direction test.** State whether a rejected or deferred form can create a
   false negative (unsafe admission), a false positive (safe work rejected), or
   only loss of availability. Unknown execution, source provenance,
   credential/identity/permission derivation, persisted state, and
   data-crossing schema forms fail closed; a false-positive reopen is cheaper
   than silently admitting an unmodeled privileged surface. Classify a failure
   as availability-only only after proving it cannot skip or bypass an
   authoritative gate.
2. **Reject what is not used.** Measure the live corpus first. An execution
   class with zero instances remains unconditionally rejected until the change
   that introduces its first real use owns the reviewed contract and
   adversarial tests.
3. **Static constraint before computed decision.** Prefer a simpler
   base-controlled platform or structural constraint when it provides the
   required property. Do not build a computed policy producer before its
   enforcing consumer exists; if there is no consumer, do not build the
   producer yet. A required-reviewer Environment durably withholds an
   Environment-only named secret, but attaching an Environment is not by
   itself a base-controlled gate for built-in `GITHUB_TOKEN` permissions:
   PR-head YAML can remove the attachment and retain that token.
4. **Blast radius uses two axes.** Assess both the data exposed and the
   identity/capability that can act. Evaluate data confidentiality, integrity,
   and sensitivity separately from principal scope, lifetime, and
   revocability. Read-only public data with a short-lived token is not
   equivalent to a publisher key, provider credential, or write-capable
   principal even when every case remains credential-reachable.
5. **Kickoff stopping rule.** Enumerate the live surface and the cited closed
   grammar once, decide every key/form in that boundary, then stop. A new
   zero-instance or speculative class requires an explicit scope decision; it
   is not folded one spelling at a time. Record the base/head SHA, deterministic
   query or source paths, observed counts, and the closed key/form table, then
   revalidate that evidence at final head after any rebase or relevant surface
   change.
6. **Triage by failure direction, not severity count.** One credible
   fail-open or credential-identity finding outweighs many availability or
   false-positive findings. Counts never substitute for adjudicating the
   mechanism and reachable consequence.
7. **Scope-creep tripwire.** A finding that introduces a new execution class,
   consumer, credential, identity, or operator action stops the current slice
   for re-scoping. Adjacent hardening does not enter merely because it is
   nearby.

For every newly admitted or claimed-compliant path, the non-negotiable floor
is unchanged: unknown forms fail closed; evidence and state are never silently
dropped or truncated; credentials never cross into unreviewed mutable
execution; a human still merges; applicable full gates and domain reviews run;
and tests assert real behavior rather than the implementation's internal
shape. The accepted Claude OAuth, Codecov, and built-in-token paths inventoried
on cloud issue #120 are explicit held residuals, not evidence that the live
corpus already satisfies this admission floor.

Because trusted runtime instructions and live state determine what the
privileged publisher may attempt, the untrusted implementing-agent patch
artifact is denied from instruction/configuration basenames `AGENTS.md`,
`AGENTS.override.md`, `CLAUDE.md`, `CLAUDE.local.md`, `.claudeignore`,
`.mcp.json`, and `.npmrc` at any repository depth; all of `.claude/` and
`.codex/`; and exact `docs/state/registry.md` by the publisher's applied-tree
path guard. This closes the direct alias, nested-instruction, and project-config
bypass found in pre-open review rather than protecting root `AGENTS.md` alone.
Conventional human-directed PRs may still change those paths under the normal
review policy.

Recognized runtime instruction/configuration paths remain wholly outside
untrusted agent-authored output. A registry update may enter a factory PR only
through trusted deterministic state-transition logic or a conventional
human-directed amendment in that same PR. Until trusted transition logic
exists, no factory-generated slice PR may land without that same-PR amendment;
D135 is never waived. Tests must pin the basename/exact/prefix path predicate
(including nested positives and near-miss negatives) and the publisher-facing
normalized forbidden-path result.

D139 neither authorizes, retires, nor schedules 120d-2. The separately held
operator decision remains controlling; the generic producer/consumer rule
cannot revise D127, D128, or D136 by implication.

**D140 (27 Jul 2026) - workflow analyzers freeze as drift detection and
platform disposition owns activation.** The operator ratifies the proposed
revision to D127, D128, and D136 with one residual-risk amendment.

The workflow analyzer track freezes at merged 120d-1b2a. Merged 120a, 120b,
120d-1a, 120d-1b1, and 120d-1b2a stay in service as evidence-only drift
detection for new credential-reachable workflow surfaces. They authorize no
execution and make no compliance claim. Reusable-workflow jobs remain
unconditionally rejected under D134, and job container/service forms remain
unconditionally rejected under D138. 120d-1b3 stays cut. 120d-2 is held: it is
not started or designed further.

Activation enforcement moves to an operator-ratified platform disposition for
each credential-reachable job. The disposition removes the credentialed path;
disables the job; places an Environment-only named secret behind required
reviewers where that actually withholds the credential; establishes another
base-controlled non-bypassable boundary; or admits a manual path only with an
explicit trusted-ref, authorized identity, approval, and mutable-data/execution
contract. `workflow_dispatch` alone is not a security boundary: it can execute
workflow code from a selected ref. Analyzer output informs the disposition as
drift evidence; it is not an exact-authorization prerequisite. This decision
authorizes no repository setting, secret-scope, Environment, or
branch-protection change.

The measured non-Environment-gatable residual is accepted at its current
size, rather than reopening 120d-2:

- fork pull requests receive no secrets and a read-only token under GitHub's
  platform behavior, so that external threat is closed by the platform;
- for actors who already have repository push access, the operator accepts the
  current built-in repository-scoped `GITHUB_TOKEN` authority as no escalation
  over pushing directly. This equivalence does not apply to external
  identities such as Claude provider OAuth/OIDC-derived material or the
  Codecov upload credential; those remain separately accepted residuals; and
- the genuine remaining sub-case is a restricted factory actor, bounded by
  the applied-tree protected-path denies, attempting to exceed those bounds.
  Direct workflow/glue edits are only one route: allowed application or test
  code can still execute in current PR jobs, influence credentialed actions,
  or poison shared job state without touching a protected path. The denies are
  partial containment, not closure. Human merge limits what lands but is
  downstream of pre-merge execution. Exact `FACTORY_PAUSED=true` is what makes
  the restricted factory author unreachable today.

This residual acceptance is **conditional on the factory remaining paused**.
The current implementation runs when `FACTORY_PAUSED != 'true'`, so absence,
deletion, misspelling, an indeterminate API read, or any value other than the
literal `true` also reopens the residual and blocks factory dispatch pending
#47; the switch is not fail-closed on absence. Before cloud issue #120 closes,
the owner must verify through the GitHub API that the value is exactly `true`.
That read does not cancel a queued or already-running job, which retains its
existing operator cancellation requirement. Re-evaluating the complete
current inventory is a named prerequisite of cloud issue #47 before the
factory-bot enable decision makes the restricted-actor case live. That review
must cover read-only and PR-write/security-events built-in token capabilities,
the Codecov upload credential, Claude OAuth/OIDC-derived identity, and mutable
application/test/action-input execution or data reachability; it is not limited
to direct workflow self-grant. It is not a prerequisite of cloud issue #120,
which closes after the ratification and state records reconcile. This
acceptance is limited to the measured current surfaces; a new job, credential,
identity, or execution class requires its own operator disposition and cannot
inherit D140 by analogy. A separate operator decision to unpause into
unsupervised dispatch also reopens the residual.

The credential inventory established two corrections that remain explicit.
Moving `FACTORY_PUBLISHER_PRIVATE_KEY` or
`SNOWFLAKE_PREVIEW_PRIVATE_KEY` to Environment scope is not a current
pre-merge control because neither secret is referenced by a PR-triggered job.
Attaching an Environment cannot durably gate the built-in `GITHUB_TOKEN`:
PR-head workflow YAML can remove the attachment while the job token still
exists.

D136's 9d/9e/9g and 14d-14g activation clauses are revised accordingly:
120d-2 exact authorization is no longer required. Each job instead requires
the operator-ratified platform disposition above, plus its existing pause and
supervised-evidence gates. F1-S6 remains eight ordered slices and becomes the
next implementation backlog item only after separate operator confirmation.

**D141 (27 Jul 2026) - agent topology, harness allocation, and enforced model
pins.** Two changes make the previous sub-agent roster insufficient, and a
third adds an axis.

Codex moves off implementation duty. The interactive agent becomes both author
and lead on its own PRs, which removes D23's independence: the author must
never decide what counts as resolved. The `pr-triage` role referenced by
`AGENTS.md` did not exist as a definition. It is added, pinned `sonnet`, and is
a Claude sub-agent rather than Codex - triage is adjudication against a known
rubric, whereas Codex's diverse-lens value is in finding, so its capped quota is
better spent there.

Sub-agent model pins become enforced rather than documented. An agent
definition with no `model:` inherits the parent, so an unpinned definition
spawned from an Opus main loop silently runs Opus across an entire fan-out.
`tests/factory/agent-model-pin.test.ts` asserts that every definition carries an
explicit `model:` from the allowed set, that `factory-security-reviewer` and
`schema-migration-reviewer` remain `opus`, that a required adversarial reviewer
cannot be removed, and that an empty roster fails rather than passing
vacuously. This is the same claim-versus-enforcement correction D139 applied to
the calibration rules.

The roster is two tiers, `opus` and `sonnet`. No Haiku tier is introduced:
nothing in this repository is both high-volume and correctness-insensitive, and
mechanical extraction is better served by `gh` or `grep` than by a third model.
**Supersession note:** superseded: AGENTS.md topology v2 (#159, 28 Jul) adds a
third `fable` tier for `story-planner`; the two-tier claim is stale.

The Opus triggers are not narrowed to reduce cost. Both adversarial reviewers
fire on F1-S6's first slice, because #58 changes a workflow file and grants.
The operator accepts that: quality and safety lead. Narrowing a security
trigger is a permissive scope change under D139's direction test and therefore
requires an explicit operator decision supported by evidence, not a cost
argument. The position is monitored and re-evaluated, not pre-emptively
relaxed.

Codex is available locally as an MCP server and as `codex review --base
<branch>`, drawing on a separate weekly-capped subscription. Allocation follows
the observed cost behaviour: Codex spends its budget on ambiguity rather than
volume, shipping settled contracts efficiently while an unsettled contract costs
a full design round. Decisions, contracts, and ambiguous design therefore stay
with the interactive agent; fully-specified implementation may be delegated;
pre-open `codex review` is reserved for diffs touching the credential or
pipeline boundary, because the same findings arriving post-open become
merge-blocking threads requiring stale re-posts to be hand-resolved. A local
`codex review` never satisfies the Codex merge wait, which requires a
bot-authored verdict naming the exact head sha. Below roughly twenty percent
remaining quota, implementation delegation stops and the remainder is reserved
for pre-open review.

D141 changes no execution boundary. The factory remains paused, D140's
residual acceptance is unaffected, and no repository setting, secret,
Environment, or branch protection is altered.

**D142 (27 Jul 2026) - Codex's ready-transition trigger, and the review
roster it belongs to, correct D103's rationale.** Operator-confirmed against
PR #150 (roastpilot-cloud, 27 Jul 2026): Codex reviews automatically the
moment a PR is opened ready-for-review, or the moment a draft is marked
ready; it does not trigger on opening a draft. A manual `@codex review`
comment is not needed for that first review; it remains the mechanism to
re-trigger a review on a new head after the automatic one, exactly as the
once-on-final-commit discipline already requires.

The trigger is not Codex-specific. Marking a PR ready fires the whole review
roster, not one lens: on PR #150, while the PR sat in draft, `claude-review`,
`Spec-grounded review (read-only)`, and `Publish spec-grounded review
(privileged)` all reported SKIPPED, and Codex did not review. The moment it
was marked ready, a new Claude Code Review run started, spec-grounded review
ran to SUCCESS, the privileged publish step started, and Codex's automatic
review became due. Meanwhile the build/correctness gates, CI (lint,
typecheck, unit), Playwright, Snowflake migrations (offline), CodeQL,
dependency review, and codecov, plus mutation testing, ran on every draft
push throughout. The accurate model is therefore a clean split: **draft**
runs the build/correctness gates and suppresses the review roster; **ready**
fires the review roster on that head in one step.

This corrects D103's rationale, not its conclusion. D103 (19 Jul 2026)
justified opening as a draft as the way to fold Codex before ready, via an
explicit `@codex review` comment on the draft. That mechanism does not
survive, for two reasons: a local `codex review --base <branch>` gives the
cross-family lens even earlier, before the branch is pushed at all; and the
ready-transition trigger established above means a draft cannot converge the
review roster even in principle, because the roster does not run there.
D105's 19 Jul finding, that an explicit `@codex review` comment left on a
draft still produced a findings-review without ever completing to a clean
verdict, is not re-tested by this decision; PR #150 observed the default
path with no manual comment, so the two observations describe different
mechanisms and neither retracts the other. What D142 changes is the reason
draft is still correct: not to fold Codex early, but because draft is the
only window in which the runner-only gates can be folded without spending
any review lens, and marking ready is what commits the whole roster to that
head. Mark ready only once the head is expected to hold.

PR #150 supplies both the general proof and a supporting illustration. The
general proof is its own mutation-gate failure: the baseline was
environment-dependent (a mutant on `shutil.which("schemachange")` is
behaviourally invisible on the runner, because pip installs the console
script exactly where the code's fallback looks), so five identical local
runs still produced the wrong number, and only the runner could reveal it;
it was found and fixed on the draft before any review lens had been spent.
The supporting illustration is the Codex-spend count: opening ready
immediately would have had Codex review head `07f1802`, then the mutation
gate failure would have forced a push to `4d26670`, stranding that verdict
on a dead head and requiring a manual re-trigger, two spends against the
weekly-capped subscription. Opening as a draft let the mutation failure
surface and fold first, so Codex reviewed only `4d26670` once ready, one
spend. The spend count is illustrative, not the rule; the rule is the
draft/ready split above.

The wait-for-verdict rule itself (bot-authorship on both channels, the 👀
in-progress bound, the 👍/`Reviewed commit:` clean-verdict definitions, a
posted `pull_request_review` with inline threads counting as findings, and
never arming auto-merge on green CI alone) is unchanged and stays recorded
once, in the cloud repo's `AGENTS.md` PR Merge Policy section; this decision
only replaces "the signal must postdate the final-commit trigger" with "the
signal must correspond to the current head AND postdate the event that
started this PR's automatic review" (a `Reviewed commit:` sha matching the PR
head, or a 👍 reaction, which carries no sha and is valid only while the head
is unchanged), because a ready PR's first review has no manual trigger for a
signal to postdate. CORRECTED IN PLACE, same day, after Codex raised it as a
P1 on the agent repo's port (#682): the first draft of this decision required
only a head match, which is NOT sufficient. A manually requested review on a
DRAFT posts findings against the very same sha, so where nothing needed
changing before marking ready, a head-match-only rule would let that
pre-ready verdict satisfy the wait while the automatic review the ready
transition just started was still in flight. Both conditions are required. CORRECTED AGAIN, same day (Codex P1 on cloud
#155): the boundary event is not always `ready_for_review`. A PR CREATED
ready, which every factory-authored PR is, emits `opened` and never emits
`ready_for_review` at all, so naming that transition as the sole boundary
would be unsatisfiable and would block every untouched factory PR
permanently. The boundary is therefore per PR shape: `opened` for a PR
created ready, `ready_for_review` for a draft marked ready, and the fresh
single re-trigger on the new final commit after any later push. The same
review also corrected an over-categorical claim that Codex does not review
drafts at all: that holds for the AUTOMATIC trigger only, while a manual
`@codex review` on a draft does run and post findings, exactly as D105
recorded. Both facts stand together.
Claude Code Review's own
workflow-edit skip (#139, already recorded in that same `AGENTS.md` roster
table) is unaffected and is not restated here.

D142 changes no execution boundary. It corrects the documented trigger model
and the D103 draft-phase rationale; no repository setting, secret,
Environment, or branch-protection configuration is altered.

**D143 (27 Jul 2026) - F1-S6's ratchet, audit, and review-lens gates are
settled.** Three of D136's five contract gates are decided by the operator,
which unblocks slice 9b. The remaining two, the accepted Codex event channels
and the `@claude question|task` grammar with its eligible PR, branch, and fork
set, stay open and continue to block 9c/9d and 9e respectively.

**Confidence method: a Wilson 95 percent lower bound on the triage-agreement
rate, with at least three distinct issue types before any promotion step.** The
ratchet advances only when the lower bound clears the threshold, not when a raw
count does. This replaces the under-powered counting gate D136 already
criticised: n=5 with zero overrides cannot distinguish an eighty percent agent
from a fifty percent one, and a lower bound is honest at small n rather than
flattering. Triage override rate stays weighted above first-pass green, because
green rate is agent-movable and override rate is not. The first observed sample
(27 Jul 2026, recorded on cloud #9) illustrates why diversity is a hard
requirement rather than a preference: it covered one hardening slice, one
security fix, and one documentation reconciliation, with no feature, migration,
or schema work, so a count-based reading of it would have been meaningless.

**Audit sampling: one hundred percent of PRs touching the security surface plus
approximately ten percent random with a rotated auditor, and the sampling is
ENFORCED rather than conventional.** A required check fails when an audit is
owed and no audit record exists. An unenforced audit rule is the same defect
class D141 had to correct for model pins, where a documented default that
nothing enforced was not a default. The 27 Jul session produced two independent
cases of a green signal that meant nothing ran, so a convention-only audit rule
has a measured poor record in this repository specifically.

**A working Claude review lens IS a hard acceptance prerequisite for the
supervised 9h session, and cloud #146 must be fixed before it.** The fix has two
parts, and the second is load-bearing: close the allowlist gap so the review
loop holds the tools it needs, and make the job FAIL when it terminates without
posting findings or a summary, rather than reporting success. Observed 27 Jul on
cloud PR #150: the job exited zero after four permission denials, having
completed two of five steps, while its own comment read "Claude finished" and
the check rendered green. A control run on PR #152 hit denials too and degraded
gracefully by disclosing exactly what it could not verify, which narrows the
defect to a denial landing on the core review loop with no obligation to report
being blocked. The supervised session is precisely where the review pipeline
should be proven rather than excused, so no operator exception is granted.

D143 changes no execution boundary. It settles product and security contract
gates, adds cloud #146 as a 9h prerequisite, and alters no repository setting,
secret, Environment, or branch-protection configuration. The factory remains
paused and `FACTORY_PAUSED` stays exactly `true`.

## D145: Codex-MCP is the default factory implementer; Claude is PM plus the safety floor (credit pivot)

**Decision (operator, evening 30 July 2026; recorded here 31 July):
implementation delegation defaults to Codex-MCP, and the scarce Claude budget is
reserved for orchestration and the review floor.** Anthropic credits are the
scarce resource and the Codex subscription is weekly-capped but comparatively
plentiful, so the expensive, high-volume work, writing the code and tests from a
ratified contract, goes to Codex (`mcp__codex__codex` / `codex-reply`), each task
in its own git worktree off `origin/main`, with the orchestrator driving the
commits because the Codex sandbox blocks its git-metadata writes. This supersedes
ledger learning 6, which had kept implementation on the Claude `implementer`
agent on the reasoning that the whole F1 backlog is protected or
security-adjacent; the pivot routes that same protected work to Codex and moves
the Claude spend onto the review floor instead.

**The safety floor is NOT a credit variable, and it becomes the load-bearing
cross-family lens precisely because Codex now authors.** Every PR keeps the same
pre-open floor and independent triage: a local `codex review --base origin/main`,
a mandatory `factory-security-reviewer` (opus) pass on any protected or security
diff, a `qa` pass where test quality is load-bearing, and an independent
`pr-triage` (never Codex, D23) before merge. The same-family author and its own
review are one lens; the opposite-family adversarial reviewer is the interlock,
and the interlock is the family boundary, not the head count. A resource
optimisation on the actuator must not thin the sensor. That floor is currently
enforced by the ORCHESTRATOR, which re-derives reviewers from the real diff's
content and adds the appropriate Claude DOMAIN reviewer (`factory-security-
reviewer` for the factory pipeline, `schema-migration-reviewer` for schema and
grants, `privacy-auditor` for the app's reviewer-data and deletion surface) so
the cross-family lens fits the change rather than being a floor in name only. A
security-sensitive change under none of those domains is orchestrator judgment
today, and making that mechanical before reviewer routing is autonomous is
tracked with #47, so this interlock is orchestrator-enforced, not yet
path-mechanical.

**The Claude `implementer` (opus) agent is retained as the FALLBACK, not the
default.** It is used when Codex is unavailable, or when the Codex weekly
allowance drops below the Axis-A budget stop threshold (roughly twenty percent),
at which point implementation delegation stops routing to Codex and the whole
remainder is reserved for the every-PR review floor, the last thing the budget
cuts. The orchestrator still never implements under topology v2 in either case.

**Evidence: proven across two hard security PRs.** On cloud #80 (PR #186) and #77
sub-problem B (PR #187), Codex authored every implementation line from the D104
contracts; the Claude opus `factory-security-reviewer` independently reproduced
fail-opens that the author's own same-family review saw only in part or missed
entirely, a mutable-title publisher bypass on #80, and on #187 a legacy-form
retirement fail-open plus a linked-issue revert-race fail-open, the second of
which the reviewer had itself passed on an earlier round and had to withdraw. The
pivot's premise, that the diverse Claude lens earns its cost even when Codex does
the writing, is the measured result, not an assumption.

D145 changes no execution boundary. It records a credit-allocation and
delegation-default decision, alters no repository setting, secret, Environment,
or branch-protection configuration, and does not change which agent may write
which path: the pipeline-self-modification protections and the permanent human
merge are unchanged, so a protected agent-instruction or workflow file is still
never touched by any implementing agent, Codex included. The factory remains
paused and `FACTORY_PAUSED` stays exactly `true`.

## D146: claude-review's tool grant narrowed to shut the public-commenter exfil/injection axis; the tag-mode Read residual stays open

**Decision (operator, 1 Aug 2026): fast-track a fix that removes claude-review's `gh pr comment|diff|view` Bash grant, over the ENV_SCRUB alternative.** The #192 probe (executed on throwaway PR #198) empirically confirmed a LIVE exfiltration primitive: with `Bash(gh pr comment:*)` granted, a prompt-injected review runs `gh pr comment <PR> --body-file /proc/self/environ` and publishes `CLAUDE_CODE_OAUTH_TOKEN`. ENV_SCRUB was ruled out as the fix (it requires bubblewrap, absent on the standard runner; triage-issues had already removed it as "breaks the job outright", and it would also scrub the token gh itself needs). The chosen fix (PR #199, merged `2d7829e`): `--allowedTools` is exactly `mcp__github_inline_comment__create_inline_comment`; `--disallowedTools` ends in a blanket `Bash`; and T24/T25 (a mutation-proven contract test) pin the no-Bash property so a later refactor cannot silently re-open it.

**This is defense-in-depth, NOT closure of #194/#192, and the boundary is documented as such.** #199 shuts the Bash-reachable axis: the `gh pr comment --body-file` exfil, the `gh pr view --comments` public-commenter injection re-admission (#194's live channel), and the `gh pr comment --edit-last` tracking-comment forgery. It does not touch the exfil PRIMITIVE: tag mode still injects a bare `Read` (probe-confirmed to read arbitrary absolute paths), and the inline-comment + `update_claude_comment` write channels remain, so `Read(env) -> comment` survives for any residual injection vector, and step-B completion-forgery merely moved from Bash to the MCP channel. #194 and #192 stay OPEN by design (verified via `closingIssuesReferences`, not PR wording); the deeper closure is tag-mode territory, tracked there.

**Evidence discipline of note.** codex-review and factory-security-reviewer disagreed on whether removing `gh pr diff` blinds the review; the disagreement was settled by an evidence gate rather than by argument — the fix PR's own `claude-review` run reviewed the actual diff with no Bash/gh in-session and said so, confirming the summary posts via `update_claude_comment` and the diff arrives via the action's prefetch. The doc sync (#202) records the residual honestly and does not claim step-B sound or #194/#192 closed.

D146 changes no execution boundary beyond the one PR #199 already shipped under human review. It records the security-boundary decision and the documented residual; alters no repository setting, secret, Environment, or branch-protection rule; and leaves `FACTORY_PAUSED` untouched.

**Extended by #204 (#192 Units 1+1b, merged 4 Aug 2026): a structural closure of the tool-grant axis, not of #194/#192.** #204 replaced #199's blanket `Bash` deny with a full deny of the 37-tool SDK-init catalog, so the bare `Read` D146 recorded as surviving is now denied and the read end of `Read(env) -> comment` is shut; `ToolSearch` is the single deliberate §1.3 residual and surfaces no denied tool. Unit 1b additionally restores base-owned configuration from a retarget-hardened trusted revision (the event-pinned `base.sha` only when `base.ref` byte-equals the default branch, else the default-branch tip; `--no-renames`; rm-before-checkout) before the action runs, closing the startup-execution vector by which a PR's own `.claude/settings.json` hooks or `.mcp.json` command-servers would otherwise run. What stays open: the two write sinks (inline comment and `update_claude_comment`) still admit PR title/body injection and a forgeable model-authored tracking comment, so #194 remains open (verified via `closingIssuesReferences`); the completion assertion reds non-deterministically under the metadata-only lens and is non-blocking (#163). #192's completion-assertion robustness fix subsequently shipped as Unit 2 (PR #211, squash `0918e141`), closing #192; and the raw-`base.sha` retarget weakness in the `spec-grounded-review` sibling restore and the write-token publish job was closed by #205 (via PR #209, squash `36cdf58`), leaving #210 the accepted concurrency residual. #204 alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` untouched.

## D147: F1-S6's four "decisions required before implementation" resolved; the Claude review lens is required for 9h, so #47 lands first

**Decision (operator working session, 5 Aug 2026).** F1-S6 (#9) lists four product/security gates as "not implementation discretion". All four are now resolved, unblocking the 9b-9h slice specs.

1. **`@claude question|task` grammar and eligibility (gates 9e/9f/9g).** A closed two-verb grammar: `question` produces one bounded answer comment and no patch; `task` produces a bounded patch artefact that the privileged publisher applies to the exact head SHA through the existing anti-gaming and self-modification guards, as one idempotent commit. Any other verb is ignored; the verb is case-insensitive; only the first command in a comment is honoured; and commands inside quoted or fenced blocks are ignored (anti-injection). Authors are a named allowlist, initially `{syamaner}`, held in base-owned protected configuration (inside the pipeline-self-modification surface, exact byte-compared) so a task patch can never add its own author, extended only by a human-reviewed base change. Forks are excluded for both verbs. Eligible PR states are open including draft, never closed or merged.

2. **Accepted authenticated Codex event channels (gates 9c/9d).** Three surfaces are accepted, each gated on an exact `chatgpt-codex-connector[bot]` authorship byte-compare: the `pull_request_review` event; a bot-authored top-level comment carrying `Reviewed commit: <sha>` matching the head; and a bot-authored thumbs-up, valid only when both the preceding eyes reaction and the thumbs-up are bot-authored (verified through the reactions-API `user.login`, so that on a public repo no stranger can supply half the verdict). Because a reaction fires no Actions event, 9d needs a poll path (scheduled, dispatched, or piggy-backed on the PR's other events) rather than event triggers alone. Fail closed: with no bot-validated signal within roughly 30 minutes of the boundary event, the reducer yields unknown/pending, never clean, and the result is ineligible for the ratchet.

3. **Confidence, diversity, ratchet, and audit (gates 9b).** A four-rung autonomy ladder, with merge never automatic: R0 (`FACTORY_PAUSED`, today), R1 (human-dispatch and human-merge, auto-chaining off, which is F1-S6's rung), R2 (shadow / draft-for-audit), R3 (auto-chaining triage-to-implement, still human-merge, out of F1-S6 scope). Promotion across a window of K factory PRs spanning at least D distinct issue types is gated primarily on the human triage-override rate (override-first: if humans keep overriding, confidence cannot rise whatever CI reports), together with the first-pass CI-green rate, the post-open review-round median, and zero security-audit escapes. Confidence is measured from observed artefacts over a window, never a model self-reported score. Every security-surface PR (the `factory-security-reviewer` routing set) is spot-audited at 100 per cent, plus a random R per cent sample of the rest, and the ratchet mechanically refuses to advance if the required audits were not recorded. Starting defaults, to be ratified inside 9b against real baseline data: K of 10, D of at least 3, override at most 10 per cent, first-pass green at least 80 per cent, review-round median at most 1, R of 20 per cent.

4. **The Claude review lens as a 9h acceptance prerequisite (gates 9h; ties to #47).** Required, not waived: the Claude lens must be live for a genuinely end-to-end supervised session, so #47 lands before 9h. #192 already closed #47's non-waivable security and exfiltration prerequisite (the `Bash` and `gh pr comment|diff|view` grants are gone, the write-capable token is off the environment, and the OAuth token is unreadable), so #47's residual work is the `roastpilot-factory[bot]` allowlist widening, a fresh `factory-security-reviewer` D140 residual re-evaluation against the current implementation, and the operator's explicit enable. 9h's sacrificial PR then validates #47 live and closes F1-S8 (#11) in the same pass, dissolving the "#47 needs a consumer" ordering problem.

**Resulting critical path to C2:** #47 (body refresh, spec, fresh factory-security re-evaluation, operator enable), then F1-S6 9b-9h, then S11, then C2 (whose to-issues draft is already prepared for filing).

D147 records decisions only. It changes no execution boundary, alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` exactly `true`.

## D148: 9d demotes D147 gate-2's thumbs-up surface to corroborating (comment-only clean); anchored certification held

**Decision (operator working session, 8 Aug 2026), refining D147 gate 2.** During F1-S6 slice 9d's implementation (the advisory Codex-verdict status publisher that consumes the merged 9c reducer), the pre-open review floor established — with two evidence-confirmed fail-opens — that head-freshness for the **sha-less thumbs-up reaction** cannot be reliably determined from the available GitHub signals. A check suite proves a commit object materialised at a time, not that it was the PR head then; an append-push can leave no server-timestamped trace (the documented `GITHUB_TOKEN`-fallback path suppresses downstream workflows); and a pending review carries an old `commit_id`. No pure-snapshot rule certifies a sha-less thumbs-up as being about the current head.

D147 gate 2 accepted three clean surfaces, including "a bot-authored thumbs-up". For the 9d advisory status specifically, that third surface is **narrowed from clean-sufficient to corroborating**:

- The only mechanical `success` advisory is the sha-verified clean **comment** ("Codex Review: Didn't find any major issues" carrying a `Reviewed commit: <sha>` byte-equal to the current head) — head-safe by construction, because a stale comment names a different sha and is rejected.
- A bot eyes/thumbs-up pair never yields `success`. Absent a clean comment it produces a distinct, visible `pending / reaction-clean-unconfirmed / advice=verify` status the operator resolves by reading the PR per the Merge Policy. Every such occurrence is loud, so the empirical question "does the connector ever signal clean by thumbs-up alone" is self-instrumented and recorded per clean episode in the 9h evidence manifest.
- 9d removes check-suite timestamps from its evidence set entirely and derives head-change only from visible, server-timestamped `head_ref_force_pushed` / `head_ref_deleted` / `head_ref_restored` events (with `pr.created_at` as the floor). This is the class both fail-opens came from.

This is the strict, fail-closed direction (fewer signals read clean), so it removes an unsafe-admission class at a bounded, observable availability cost that is nonzero only if a clean verdict is ever signalled by thumbs-up alone. It requires **no change to the merged 9c reducer** (the demotion is a post-reducer mapping inside 9d).

**Held upgrade (not built): anchored certification.** If the 9h supervised session shows thumbs-up-only cleans occur at a material rate, the reaction channel can be made reliable by adding, as a new evidence source, 9d's own prior advisory statuses on the current head (an "head == H at T" attestation whose creator is byte-compared to the workflow identity), and gating the reaction pair's **eyes** on that anchor. That upgrade requires its own story-planner contract and a separate, fully-reviewed change to the merged 9c reducer (adding an eyes-postdates-anchor conjunct to the reaction-pair predicate); it is specced and deliberately deferred, activating only on ratified 9h evidence.

D148 records decisions only. It changes no execution boundary, alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` exactly `true`.

## D149: 9e refines D147 gate-1 to command-first (visible-lead), closing the render-DOM masking class

**Decision (operator, AskUserQuestion, 9 Aug 2026).** F1-S6 slice 9e's owner-command parser narrows D147 gate-1's accepted command position: the `@claude question|task` command must be the **leading content** of the comment (after stripping only a leading run of newlines), not "the first command anywhere in the comment". Any `@claude` marker not at the lead is ignored.

**Why.** The D147-as-written any-position rule forced a mask-then-scan parser, which is an unbounded denylist against GitHub's rendered DOM. Three pre-open review rounds with two diverse security lenses (a local `codex review` and an adversarial `factory-security-reviewer`) each surfaced a fresh instance of one class: content GitHub renders hidden, quoted, or as code that markdown-it exposes (the `<details>` / `<blockquote>` type-6 blank-line DOM-nesting seam, raw inline code containers, link destinations, reference definitions), letting a smuggled `@claude task` be honoured under owner authority. The class is not closable by enumeration; the next collapsible or quoting construct leaks.

**The refinement is a pure fail-closed tightening.** A line beginning at column 0 with `@` cannot open any CommonMark container or hiding leaf block (block quote, list, ATX heading, fenced or indented code, thematic break, HTML block, link reference definition all need a different lead character or a four-space indent), so it opens a top-level paragraph GitHub renders as visible text, with nothing before it; the raw-HTML nesting divergence cannot arise, and the only honoured command is always the visible first line, so the owner cannot be tricked into authorising a command they cannot see. The cost is that the "paste logs in `<details>`, then `@claude question`" idiom no longer works; the inversion "`@claude question …`, then logs" does. Over-rejection of a non-leading command is availability only and retryable.

This refines only the accepted command **position**. Every other D147 gate-1 rule stands: the closed two-verb set, the case-insensitive verb, first-(leading-)command-only, the named base-owned byte-compared allowlist, forks excluded, and open-including-draft PRs only. The mechanism was chosen over two rejected alternatives: a positive token-walk with raw-HTML container-balance tracking (re-instantiates the failed class, since proving `<details>` / `<blockquote>` balance against GitHub's browser DOM is unbounded) and a GFM-faithful renderer such as cmark-gfm (structurally inadmissible: the import-closure verifier rejects any `.node` native target, and a WASM build is a large new supply-chain surface).

D149 records decisions only. It changes no execution boundary, alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` exactly `true`.

## D150: D143's 9h Claude-review-lens prerequisite is re-scoped to a fail-closed metadata-only lens; substantive review is the pre-open floor + connector (#217)

**Decision (operator, AskUserQuestion, 11 Aug 2026), amending D143's review-lens gate.** During F1-S6's 9h-precondition backlog, #217 surfaced two defects in the `claude-review` lens. **Defect A — a silent no-op passes green:** the #211 metadata-only completion gate short-circuited step B on `metadata_only && result_clean` alone, so a zero-turn run whose tracking comment stayed the action's harness placeholder (`"I'll analyze this and get back to you."`, which passes the non-empty-body guard because it is a genuine `github-actions[bot]` comment) was accepted as complete and the check rendered green. That is a live instance of the exact #146 fail-open D143 part-2 marks *no operator exception* ("make the job FAIL when it terminates without posting findings, rather than reporting success"). **Defect B — the lens cannot read the diff:** since #204/#211 the lens is metadata-only (every reader denied, no diff injected — the deliberate #194 `Read(env)→comment` exfil closure), so it structurally cannot post substantive line-level findings against the Code Review Rubric.

Defects A and B expose a genuine tension: D143 part-1 ("close the allowlist gap so the review loop holds the tools it needs") and the #194 exfil closure are in direct conflict — restoring a reader to make the lens content-reviewing reopens a closed P0. The operator resolves it as follows.

- **Defect A is closed as a mechanism repair, not re-scoped.** The metadata-only early-accept now additionally requires the #183 terminal completion sentinel as positive, model-authored completion evidence, and falls through to the existing checklist/sentinel branches on any failed conjunct (fail-closed); a zero-turn placeholder carries no sentinel and reds. This closes the un-exceptionable D143 part-2 #146 regression for the metadata-only shape, entirely within the metadata-only posture (no reader re-grant, no diff injection, no credential change, no tool-grant change). Delivered dark on the #217 branch (conventional/orchestrator-driven, `.github/**`), non-activating.
- **Defect B is re-scoped, not rebuilt.** D143's "working Claude review lens" 9h prerequisite is **re-scoped**: it is satisfied by a metadata-only `claude-review` whose completion assertion fails closed on a no-op (Defect A) — an explicit metadata-only consistency check — together with the substantive cross-family review being the pre-open floor (`factory-security-reviewer` (opus) MANDATORY + `qa` + local `codex review`) and the Codex connector. The lens is not required to read diff content. Re-granting a reader to make it content-reviewing is **rejected**: it reopens the #194 exfil axis, a permissive scope change under D139's direction test that this decision explicitly declines.

Residuals stay tracked, not folded: #184 (the checklist-branch truncation fail-open — a truncated prose review quoting a ticked box) and #212 (cross-check assistant `tool_use` invocations vs the permitted residual). The adversarial sentinel / tracking-comment forgery via the model-authored `update_claude_comment` channel remains the #194-adjacent residual — Defect A's bar is benign-truncation-soundness, not adversarial authentication, unchanged in both directions by the sentinel gate.

D150 amends D143's review-lens prerequisite only. It changes no execution boundary, alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` exactly `true`.

## D151: D150's "no diff injection" is superseded for `claude-review` — the lens is restored to content-reviewing by trusted diff-as-DATA injection, with the tool-grant closure byte-intact (#266)

**Decision (operator, AskUserQuestion, 13 Aug 2026), superseding D150's Defect-B disposition on one axis only.** D150 declined to make the `claude-review` lens content-reviewing because it equated "content-reviewing" with "re-granting a reader", which reopens the #194 `Read(env)→comment` exfil axis, and recorded "no diff injection" as a property of the accepted metadata-only posture. #266 restores content-review by a **different mechanism D150 did not consider**, and the operator ratifies it in place of that one clause.

**What D150 got right and stays untouched.** The metadata-only TOOL posture is unchanged and byte-identical: `--allowedTools` is exactly the inline-comment sink, `--disallowedTools` is the 37-name deny, the step-C init-catalog residual is exactly `[ToolSearch]`, and steps A/B/C (evidence, catalog-closure, completion-assertion) are byte-for-byte as shipped — including Defect A's #183 terminal-sentinel gate. No reader, egress, execution, or sub-agent tool is re-granted; no credential changes; #157's `GITHUB_TOKEN`-only posture is intact. The substantive cross-family review remains the pre-open floor (`factory-security-reviewer` (opus) MANDATORY + `qa` + local `codex review`) and the Codex connector; this decision does not lean on the lens as an authenticated gate.

**Why the exfil-reopening reason does not hold for this mechanism.** #266 computes the review diff deterministically from the payload-frozen PR base SHA (`github.event.pull_request.base.sha`, the actual PR target) and the payload-frozen `github.event.pull_request.head.sha`, **object-store-only** (`git fetch` + `merge-base` + `git diff`; no `checkout`/`restore`/`merge` and no execution of head content), and injects it as **inert prompt DATA** behind a per-run 128-bit nonce fence. The diff reaches only the model's prompt context; the model's only reachable write sinks remain the two comment channels the metadata-only posture already permits. The adversarial `factory-security-reviewer` returned **CONFIRMED-SOUND**: it could construct no exfil and no new sink — the diff crosses the *same* channel, with the *same* same-repo-PR-author principal and the *same* two sinks, as the already-accepted #194 PR-title/body injection residual. So injecting the diff re-grants no reader and opens no `Read(env)→comment` path; D150's stated reason for rejection is specific to reader re-grant and does not reach the data-injection shape.

**The accepted cost, ratified with the decision.** The diff is a larger and more ergonomic injection surface than the title/body, so it **widens the VOLUME** of the #194 injection channel — not its principal set and not its sinks. This is accepted because the lens verdict is explicitly **non-authenticated** (#194) and **non-required** (branch protection does not gate on it), and the real gates — human merge, `required_conversation_resolution`, the Codex connector, and the pre-open floor — are unchanged. #194 remains the tracked home for "the review verdict is not adversarially authenticated", unchanged in both directions; this decision does not close it, enlarge it into a new sink or credential, or claim to authenticate the verdict.

**Security envelope ratified with the decision** (the shape the implementation must keep): the review diff is computed from the payload-frozen PR base SHA (`github.event.pull_request.base.sha`, the actual PR target) + the payload-frozen head SHA — never a mutable ref, and **never the #209 resolver's `trusted-sha`** for the diff, because that value is the default-branch tip for a non-default-target PR and would compute an empty diff against the wrong base, silently skipping the review (a review-bypass the base-SHA source closes); the resolver's `trusted-sha` stays reserved for the base-owned config restore, which must remain retarget-hardened. Object-store-only, no head materialisation or execution; size-bounded **fail-closed** at 64 KiB (over-cap reds the job before the action runs, never truncates); nonce-fenced with a `GITHUB_OUTPUT` collision guard that fails closed on a delimiter/fence collision; emptiness carried as a **trusted `changeset_empty` step output** computed by the workflow, never inferred from PR-controlled diff content (closing the forgeable in-band-marker review-bypass the floor caught pre-open); and the **complete** Code Review Rubric injected into the prompt — the architecture-invariant must-blocks plus the pipeline self-modification blocker, the latter gated on the trusted server-assigned author so it flags a `roastpilot-factory[bot]` protected-path change without false-flagging conventional human-directed work.

**The 9h prerequisite is strengthened, not weakened.** D143's "working Claude review lens" prerequisite (re-scoped by D150 to a fail-closed metadata-only consistency check plus the floor + connector) is now satisfied by a genuinely **content-reviewing** metadata-only lens together with that same floor + connector — a strictly stronger posture than D150's, reached without touching the tool-grant closure the floor + connector protect.

**Provenance worth recording.** The conflict between #266 and D150 was caught pre-open by the local `codex review` floor reading this plan repo — i.e. the very floor D150 established as the substantive review is what protected the plan's own integrity. The orchestrator had mis-framed #266 as *serving* D143/D150; it does not, and this decision is the filed correction (AGENTS.md §"If this file and the plan repo disagree, the plan repo wins — file a correction").

Delivered conventional / orchestrator-driven (`.github/workflows/claude-code-review.yml` + `tests/factory/**`), `factory-security-reviewer` MANDATORY + `qa` pre-open, human-merged. D151 supersedes only D150's "no diff injection / content-reviewing rejected" clause for `claude-review`; every other part of D150, D143, #204/#211, #194, and #157 stands. It changes no execution boundary, alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` exactly `true`.

**Post-merge validation discharged (13 Aug 2026).** Slice 1 (PR #267, squash `5ea8d7e`) could not self-validate — its own carrying PR was a workflow-edit change, whose `claude-review` no-ops by the documented workflow-edit confound. The accepted cost above (widened #194 injection VOLUME) was ratified contingent on the benefit — a genuinely content-reviewing lens — actually materialising, so that benefit was verified on a deliberate non-workflow probe: PR #268 (one line of `README.md`, no protected path) against `main` @ `5ea8d7e`. The [claude-review run](https://github.com/syamaner/roastpilot-cloud/actions/runs/31729183755/job/94545039613) met every conjunct of the falsifiable criterion — `num_turns: 3` (not the `num_turns:1` no-op baseline), step C `metadata_only=true`/`result_clean=true`, step B green, and a real rubric-reasoned tracking comment ending in the #183 `REVIEW-COMPLETE` sentinel. The lens content-reviews non-workflow PRs as designed; the probe PR was closed without merging (purpose served). Evidence recorded on #266 (`issuecomment-5284596630`).

## D152: D150's Defect-A "no operator exception" #146 disposition is narrowly amended — the PROVEN-INERT, annotated zero-turn no-op exits success; every review that actually started still fails closed (#274)

**Decision (operator, AskUserQuestion, 15 Aug 2026), narrowly amending D150's Defect-A disposition on one axis only.** D150 closed "Defect A — a silent no-op passes green" by making the zero-turn placeholder red, and marked it a live instance of the #146 fail-open D143 part-2 holds to be *un-exceptionable* ("make the job FAIL when it terminates without posting findings, rather than reporting success"). New evidence and a new mechanism, neither before D150, justify one narrow exception; the operator ratifies it in place of that single disposition.

**The new evidence (#274 characterisation).** A controlled probe (4 add-only throwaway PRs, each re-run 4× on byte-identical heads) established that the `claude-review` zero-turn no-op is **stochastic, not content-determined**: byte-identical diffs flip both ways across re-runs (pooled prose no-op rate ~67%), and in every observed instance the trusted SDK envelope showed `metadata_only=true`, `result_clean=true`, `num_turns==1`, and **zero tool invocations**. This is not a truncated or degraded review; it is a **provably-inert non-event** in which the model made no tool call and produced nothing, occurring at a high content-independent rate that reds a large fraction of factory PRs as pure noise. (Evidence: #274 `issuecomment-5299278432`, `-5299468486`.)

**Why the #146 rationale does not reach this narrow case.** The purpose of D143 part-2 / #146 — reaffirmed by the #150 incident D150 cites — is that a green-plus-"finished" check would let a reader **reasonably conclude the PR was reviewed and clean when it was not**: a *silent* fail-open that misleads. D150 applied it to the zero-turn placeholder because the placeholder body reads as benign and a bare green would be misread. The #274 mechanism changes only the exit code, only on the five-conjunct proven-inert signature, while emitting a **mandatory, tested, load-bearing annotation on both channels** ("benign inert zero-turn no-op: the model made zero tool calls; NO review was produced; this is not a clean review verdict"). The green therefore provably means "the gate proved the run inert", never "reviewed and clean" — which closes the exact hazard the #146 principle exists to prevent. The principle's PURPOSE (a no-review must not masquerade as a clean review) is preserved by the annotation; what is amended is only the mechanical success/failure exit on a signature adversarially distinguishable from any real or truncated review.

**This is knowingly an exception to a rule marked "no operator exception."** The operator records it as such. It is admissible because it is narrow, adversarially bounded, and preserves the principle's purpose — not because the "no operator exception" language was loose. It does **not** weaken the #146 principle generally: every review that actually *started* — truncated, degraded, sentinel-missing — still fails closed.

**Security envelope ratified with the decision (the shape the implementation must keep):**
- Success is admitted ONLY on the **five-conjunct** signature `metadata_only==true && result_clean==true && result_num_turns=="1" && tool_invocations=="0" && substantive_output=="0"`, all derived from the **trusted SDK execution transcript** (base-action-authored, not model-authored). The fifth conjunct (`substantive_output==0`: no top-level assistant `text`/`thinking`/`redacted_thinking` block carries non-whitespace content) enforces THIS decision's own "produced nothing" premise, which the first four fields do not capture — they prove the model POSTED nothing (made no tool call), not that it PRODUCED nothing (a one-turn run emitting a substantive text review without posting it passes the four fields yet is not inert). It is strictly more fail-closed (a superset of rejections, never of acceptances). `tool_invocations` counts every recognised invocation discriminator (`tool_use`/`server_tool_use`/`mcp_tool_use`) plus any top-level user `tool_result` (tool-execution evidence), under a closed content-block allowlist that WITHHOLDS on any unrecognised or malformed block shape. Any missing / malformed / ambiguous field fails **closed** (falls through to the existing checklist/sentinel grammar). (The four→five-field correction was made during implementation, before the implementing PR merged, after the pre-open `codex review` floor flagged the four-field envelope as under-capturing this decision's own premise; ratified by the operator with this correction.)
- A genuinely **truncated** review still fails closed, byte-for-byte as D150/D151 shipped: a review that actually started called ≥1 tool (`invocations>=1`, `num_turns>=2`) and cannot reach the accept, and a truncation does not present `subtype=="success" && is_error==false` so `result_clean` is false regardless. Defect A's #183 sentinel gate for the real-review path is **unchanged**.
- The three new envelope fields (`result_num_turns`, `tool_invocations`, `substantive_output`) are double-gated to canonical closed values (jq validity + `^(0|[1-9][0-9]*)$` for the two counts, `^(0|1)$` for `substantive_output`) before write — no `$GITHUB_OUTPUT` injection, no model-derived bytes.
- `factory-security-reviewer` (opus) returned **CONFIRMED-SOUND**: the signature is non-forgeable (the metadata-only lens gives the model no write path into the SDK transcript; the independent `num_turns==1` conjunct backstops even the tracked zero-instance #212 residual). `qa` PASS: every guard a genuine sole-catcher, including the dangerous-direction undercount (G7 / SC-P2).
- The lens stays **non-required** and **non-authenticated**; the real gates (human merge, `required_conversation_resolution`, the Codex connector, the pre-open floor) are unchanged. #194 (verdict not adversarially authenticated), #212, and #184 remain tracked, unchanged in both directions.

**Provenance worth recording.** The conflict between #274 direction (1) and D150 was caught **pre-open by the local `codex review` floor reading this plan repo** — the same floor D150 established as the substantive review, catching the same class of orchestrator mis-framing it caught for #266 (see D151's provenance note). The orchestrator had mis-framed direction (1) as compatible with D150; it is not, absent this amendment, and this decision is the filed correction (AGENTS.md §"If this file and the plan repo disagree, the plan repo wins — file a correction").

Delivered conventional / orchestrator-driven (`.github/workflows/claude-code-review.yml` + `AGENTS.md` + `tests/factory/**`), `factory-security-reviewer` MANDATORY + `qa` pre-open, human-merged. D152 amends only D150's Defect-A success/failure disposition for the proven-inert zero-turn signature; every other part of D150, D151, D143, #204/#211, #194, and #157 stands. It changes no execution boundary, alters no repository setting, secret, Environment, or branch-protection rule, and leaves `FACTORY_PAUSED` exactly `true`.
