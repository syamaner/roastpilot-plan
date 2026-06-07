# AGENTS.md — roastpilot-plan

Rules and context for coding agents working in this repository.

## What this repo is

The RoastPilot **program repository**: agreed plans, decision records
(D1–D14), cross-repo epics, and UI prototypes. It contains no production
code — implementation lives in `roastpilot-agent`, `roastpilot-cloud`,
`coffee-roaster-mcp`, and `coffee-first-crack-detection`.

## Rules

- **The agreed plans are the source of truth.** Where a prototype, draft, or
  generated artifact disagrees with a plan document, the plan wins. Where two
  plan documents disagree, the newer decision record wins
  (`00-repository-structure.md` decisions table → component plans).
- **Decisions are numbered** (D1, D2, …). Any new agreed decision gets the
  next number and a row/entry in the relevant plan document. Never renumber.
- **`archive/` is read-only history.** Never update archived documents to
  "fix" them; supersede them in the live plans instead.
- **Accuracy boundaries apply to anything that could become public** (READMEs,
  slides, posts): LLM is advisory-only and never controls hardware; no
  determinism percentages; no "fully autonomous"; no "production-ready" before
  end-to-end hardware validation; the FC detector has a fixed-window ~2 s
  latency trade-off, not "real-time".
- UI prototypes under `roastpilot-agent/sketches/` are **reference specs,
  never seed code**; locally-made extensions to the raw Figma Make exports
  are documented in `sketches/README.md`.
- Temperatures are Celsius in every plan, schema, and example.
- Cross-repo epics (LA-1, LA-2) are tracked here; single-repo epics live in
  their home repositories.

## Conventions for the implementation repos (D14)

- `AGENTS.md` is the canonical agent-instruction file in every roastpilot
  repository (template: `coffee-roaster-mcp`'s AGENTS.md).
- `CLAUDE.md` contains exactly one line — `@AGENTS.md` — never rules.
- Claude-specific assets (sub-agents, skills) live under `.claude/`.
