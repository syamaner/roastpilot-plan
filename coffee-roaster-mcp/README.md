# coffee-roaster-mcp — Component Plan (small, M2 prerequisite)

**Repo**: `github.com/syamaner/coffee-roaster-mcp` (exists; PyPI + MCP Registry)
**Milestone**: one small contract change, needed for Loop A (M2)
**Status**: Change identified and verified against code; not yet implemented.

## The single agreed change

Add a source marker to manual first-crack events so Loop A can disambiguate
auto-detected vs operator-override FC in exported logs.

- **Where**: `mark_first_crack` (`mcp_server.py:665`) currently calls
  `_record_session_event(ctx, "first_crack_detected")` with no payload; the
  helper (`mcp_server.py:835`) does not accept a payload parameter today.
- **Change**: extend `_record_session_event` to accept an optional payload (or
  call the session store directly) so manual FC events include
  `{"source": "operator_override"}`. Ensure the auto-detection path marks
  source consistently.
- **Also**: surface the source in `export_roast_snapshot()` output; update
  event-contract tests.
- **Release**: backward-compatible → patch/minor PyPI bump.

This is a small but real contract + test change — not a one-line edit (see
`archive/FINAL_CORRECTIONS_SUMMARY.md`).

## Explicitly out of scope (Loop B backlog)

Audio ring buffer, `get_audio_buffer()`, `operator_hint`/`capture_audio`
parameters, FC session metadata fields, `_capture_audio_window()`. If ever
implemented, the buffer belongs on the `FirstCrackAudioPipeline` protocol, not
the runtime (boundary already corrected in the draft plans).
