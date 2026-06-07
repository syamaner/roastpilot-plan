# roastpilot-agent — Component Plan

**Repo (to create)**: `github.com/syamaner/roastpilot-agent`
**Milestone**: M1 — critical path, July 2026
**Status**: ✅ Drill-down complete (6 June 2026) — see [`plan.md`](plan.md)

## Documents

- [`plan.md`](plan.md) — full component plan: decisions D5–D8, verified MCP
  contract, agent↔MCP phase mapping, module design, SQLite schema v1, REST+SSE
  API contract, SPA page inventory + replay harness, test plan, epic/story
  breakdown (E1–E12), sub-agent definitions, remaining open items.
- [`ui-prompts.md`](ui-prompts.md) — Gemini UI sketch prompt pack (dashboard,
  recovery/fault, detail, history + bonus cloud review page).
- `sketches/` — (to create) generated UI sketches with prompt/variation notes.

## Decisions made in drill-down

- **D5**: Advisor via **OpenRouter** (PydanticAI, model slug configurable;
  deterministic FakeAdvisor for tests/demo).
- **D6**: Agent **spawns MCP as stdio child process** (one systemd unit).
- **D7**: **Minimal static profiles** for M1 (no curve targets).
- **D8**: SPA = **dashboard + detail + history**; settings stay in config file.
- **D9** (7 June 2026): UI prototyping with **Figma Make** (tried, decent
  results). Exported React code serves as the reference spec for E10 coding-
  agent rebuilds — not as seed code. See `ui-prompts.md` § Tips.

## Remaining open items (tracked in plan.md §11)

1. OpenRouter model slug + structured-output settings (resolve at E8).
2. `drop_beans` cooling behavior on real hardware (E12 verification story).
3. Hatchling build hook for `web/dist` packaging (E11).
4. SSE reconnect behavior on Safari/iPad (E10).
