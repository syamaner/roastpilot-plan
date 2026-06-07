# User Feedback Learning: Corrections and Clarifications

## Summary

The User Feedback-Based Learning system has been updated to clearly distinguish between:
- **Loop A** (ratings → reference roasts): Well-scoped, agent-side, ready for Phase 1
- **Loop B** (FC overrides → model improvement): Requires significant MCP enhancements, Phase 2+

---

## Key Corrections Made

### 1. Identified Phase 1 Minimal MCP Change

**Issue**: Phase 1 description said "works with existing pattern" but didn't note that
the manual `mark_first_crack` tool doesn't currently add source markers to event payloads.

**Current code** (`mcp_server.py:672`; the `_record_session_event` helper at
`mcp_server.py:835` does not accept a payload parameter today, so events are
recorded with an empty payload):
```python
@mcp.tool()
def mark_first_crack(ctx: Context[ServerSession, ServerContext]) -> EventCommandResult:
    ...
    _record_session_event(ctx, "first_crack_detected")  # No payload support
```

**Required change** (small contract change: extend the helper to accept an
optional payload, or call the session store's event recording directly, plus
the corresponding test updates):
```python
@mcp.tool()
def mark_first_crack(ctx: Context[ServerSession, ServerContext]) -> EventCommandResult:
    ...
    _record_session_event(
        ctx,
        "first_crack_detected",
        payload={"source": "operator_override"},  # Requires helper to gain payload support
    )
```

**Rationale**:
- Phase 1 needs to disambiguate auto-detected vs operator override FC events
- Export function extracts override data from event payload
- Without source marker, can't tell which events are overrides
- This is a small but real contract/test change, essential for Phase 1

**Note**: The auto-detection path already records source implicitly (comes from model).
Need to ensure both paths are marked consistently.

---

### 2. Added Warning About MCP Enhancements

**Location**: `roastpilot-agent-orchestration-plan.md` § MCP Layer Responsibilities

**Added**:
```
⚠️ Note: The following requires new capabilities in coffee-roaster-mcp that don't
exist yet. This is future work, not existing code.
```

**Purpose**: Prevent confusion about what exists vs. what's proposed.

---

### 3. Documented Three Architecture Gaps (Phase 2+)

#### Gap 1: `get_audio_buffer()` Doesn't Exist (Most Significant)

**Current state**:
- `AudioCapturePipeline.drain_windows()` feeds processed windows to detector and discards
- No raw PCM ring buffer exists

**Required**:
- Add ~1MB circular buffer to audio pipeline (NOT directly to runtime)
- Implement `get_audio_buffer(center_timestamp, window_seconds)` method
- Thread-safe: audio thread writes, MCP thread reads
- Timestamped samples aligned with `session.monotonic_start`

**Architecture nuance**:
- Audio data flows through `FirstCrackAudioPipeline` (Protocol)
- The `get_audio_buffer()` method should be added to:
  - The `FirstCrackAudioPipeline` protocol interface, OR
  - A new sibling abstraction that wraps the pipeline with buffering
- `FirstCrackSessionRuntime` consumes the pipeline; it doesn't own audio flow
- **Correct boundary**: Protocol interface (audio operations belong there)

**Alternative**: Stream raw audio to disk continuously, extract clips after override
- Avoids ring buffer complexity
- Requires more disk I/O
- Enables longer capture windows

**Decision point**: Phase 2 implementation planning

---

#### Gap 2: `mark_first_crack` Signature Mismatch

**Current**:
```python
def mark_first_crack(ctx: Context[ServerSession, ServerContext]) -> EventCommandResult:
```

**Proposed**:
```python
def mark_first_crack(
    ctx: Context[ServerSession, ServerContext],
    operator_hint: str | None = None,  # NEW
    capture_audio: bool = True,  # NEW
) -> str:
```

**Migration**: Backward compatible (new parameters are optional)

**Note**: Also changes from synchronous to string return (simplified for agent use)

---

#### Gap 3: Session Fields Don't Exist

**Current `RoastSession` has**:
- `first_crack_monotonic_seconds: float | None` (accepted timestamp)
- `monotonic_start: float` (session start time, NOT `started_at_monotonic`)

**Missing** (needed for Loop B):
- `first_crack_source: Literal["auto", "operator_override"] | None`
- `first_crack_model_timestamp_seconds: float | None`
- `first_crack_model_confidence: float | None`
- `first_crack_audio_capture_path: Path | None`

**Workaround for Phase 1**: Extract override data from event timeline payload
- Works without new session fields
- `source` can be in event payload
- Model timestamp/confidence can be in event payload

**Full solution for Phase 2**: Add new session fields for efficient access

---

### 4. Updated Code Examples

All code examples in the MCP Layer Responsibilities section now marked as:
- `# PROPOSED: ...` (header comments)
- `# NEW PARAMETER` (inline comments for new params)
- `# NEW FIELD` (inline comments for new session fields)
- `# CORRECT FIELD` (inline comments for existing fields used correctly)
- `# REQUIRES: ...` (comments noting missing capabilities)

**Example**:
```python
# PROPOSED: Enhanced mark_first_crack in mcp_server.py
# Current signature: mark_first_crack(ctx: Context[...]) -> EventCommandResult
# Proposed signature:

@mcp.tool()
def mark_first_crack(
    ctx: Context[ServerSession, ServerContext],
    operator_hint: str | None = None,  # NEW PARAMETER
    capture_audio: bool = True,  # NEW PARAMETER
) -> str:
    ...
    override_timestamp_seconds=time.monotonic() - session.monotonic_start,  # CORRECT FIELD
    ...
```

---

### 6. Corrected Audio Pipeline Architecture

**Issue**: Original plan suggested adding `get_audio_buffer()` to `FirstCrackSessionRuntime`.

**Architecture reality**:
- Audio data flows through `FirstCrackAudioPipeline` (Protocol)
- Runtime consumes the pipeline; it doesn't own audio flow
- The correct boundary for audio operations is the pipeline protocol

**Corrected approach**:
```python
# WRONG: Adding to runtime
class FirstCrackSessionRuntime:
    def get_audio_buffer(self, ...) -> np.ndarray:  # ❌ Wrong boundary
        ...

# CORRECT: Adding to pipeline protocol
class FirstCrackAudioPipeline(Protocol):
    def get_audio_buffer(self, center_timestamp: float, window_seconds: float) -> np.ndarray | None:
        """Retrieve audio window from ring buffer."""  # ✅ Correct boundary
```

**Updated code examples**:
```python
# Caller side (in mark_first_crack):
audio_path = _capture_audio_window(
    session=session,
    override=override,
    window_seconds=30,
    audio_pipeline=server_context.first_crack_runtime.audio_pipeline,  # ✅ Correct
)

# Helper function:
def _capture_audio_window(
    ...,
    audio_pipeline: FirstCrackAudioPipeline,  # ✅ Correct interface
) -> Path | None:
    audio_samples = audio_pipeline.get_audio_buffer(...)  # ✅ Correct call
```

**Rationale**: Protocols should own their domain operations. Audio capture/retrieval
belongs in the audio pipeline abstraction, not in the runtime that consumes it.

---

### 7. Updated Implementation Phases

#### Phase 1 (Milestone 2): Basic Feedback Loop
**Scope**: Loop A only (ratings → reference roasts → advisory context)

**Agent-side**:
- Cloud roast upload (summary + telemetry)
- Reference roast download and caching
- Extended `AdvisorContext` with reference data

**Cloud-side**:
- Tasting review collection
- Reference roast queries and summaries

**MCP-side** (minimal change required):
- Add `{"source": "operator_override"}` to `mark_first_crack` event payload
- **Location**: `mcp_server.py:672` in `mark_first_crack` tool
- **Change**: One-line addition to `_record_session_event()` payload
- **Rationale**: Disambiguate auto-detected vs operator override in event timeline
- **Current**: Event is recorded without source marker
- **After**: Event payload includes source for downstream extraction
- No audio capture, no new session fields required

---

#### Phase 2 (Milestone 3): Audio Capture
**Scope**: Loop B foundation (audio capture for future model improvement)

⚠️ **This phase requires significant MCP enhancements**

**MCP enhancements required**:
1. Add raw audio ring buffer to `FirstCrackSessionRuntime` (~1MB circular buffer)
2. Implement `get_audio_buffer(center_timestamp, window_seconds)` method
3. Add `operator_hint` and `capture_audio` parameters to `mark_first_crack`
4. Add session fields: `first_crack_source`, `first_crack_model_timestamp_seconds`,
   `first_crack_model_confidence`, `first_crack_audio_capture_path`
5. Implement `_capture_audio_window()` helper function
6. Enhance `export_roast_snapshot()` to include override metadata

**Agent enhancements**:
- Privacy controls and opt-in (`FeedbackConfig`)
- Audio file upload to cloud storage (with anonymization)
- Privacy dashboard (view contributions)

**Cloud enhancements**:
- Audio file storage (S3 or equivalent)
- `fc_training_samples` table
- Basic annotation UI (play audio, confirm timestamp)

**Design decision to make**: Ring buffer vs continuous disk streaming

---

#### Phase 3 (Milestone 4): Model Improvement
**Scope**: Annotation pipeline and fine-tuning

**coffee-first-crack-detection changes** (in that repo):
- Script to download validated samples from cloud
- Augment training dataset with new samples
- Fine-tuning script (documented process, manual initially)
- Evaluation on held-out test set (require improvement over baseline)
- Publish to Hugging Face Hub with version tag (manual review)

**MCP changes**:
- Check for model updates on startup (if enabled)
- Download new model from Hugging Face
- Fallback to current model if download fails

**Cloud changes**:
- Multi-annotator workflow (3 annotators per sample)
- Inter-annotator agreement scoring
- Metrics dashboard (override frequency, accuracy trend)

---

#### Phase 4 (Milestone 5): Advanced Learning
**Scope**: Automated pattern extraction and personalization

- Automated pattern extraction from high-rated roasts
- Multi-modal learning (audio + telemetry correlation)
- Personalized recommendations (user's past roasts)
- Community gallery and leaderboards (opt-in)

---

## Groundedness Assessment

| Area | Groundedness | Notes |
|------|--------------|-------|
| Controller, state machine, safety | ✅ Solid | Based on existing architecture |
| Loop A: ratings → reference roasts | ✅ Well-scoped | Agent-side, no MCP changes needed |
| Loop B: conceptual story | ✅ Technically plausible | Standard ML fine-tuning workflow |
| Loop B: MCP code examples | 🟡 Aspirational but documented | Now clearly marked as "PROPOSED" |
| Audio ring buffer design | ⚠️ Requires design decision | Ring buffer vs disk streaming |
| Session field enhancements | ⚠️ Requires schema changes | New fields needed in `RoastSession` |

---

## What Changed in the Plan

### Before (Implied MCP Code Existed)

```python
# In mcp_server.py (implied this exists)

@mcp.tool()
async def mark_first_crack(
    session_id: str | None = None,
    operator_hint: str | None = None,
    capture_audio: bool = True,
) -> str:
    ...
    audio_samples = server_context.first_crack_runtime.get_audio_buffer(...)
    ...
```

**Problem**: This implied:
- `mark_first_crack` already had these parameters (it doesn't)
- `get_audio_buffer()` method exists (it doesn't)
- Session fields for source/confidence tracking exist (they don't)

---

### After (Clear About What's Proposed)

```python
# PROPOSED: Enhanced mark_first_crack in mcp_server.py
# Current signature: mark_first_crack(ctx: Context[...]) -> EventCommandResult
# Proposed signature:

@mcp.tool()
def mark_first_crack(
    ctx: Context[ServerSession, ServerContext],
    operator_hint: str | None = None,  # NEW PARAMETER
    capture_audio: bool = True,  # NEW PARAMETER
) -> str:
    ...
    # PROPOSED METHOD (DOES NOT EXIST YET):
    audio_samples = runtime.get_audio_buffer(...)
    ...
```

**Improvement**: Now clearly marked as proposed, with notes about:
- What exists today
- What needs to be added
- What the enhancement looks like

---

## Design Decisions for Phase 2

### Decision 1: Audio Ring Buffer Implementation

**Option A: Circular PCM Buffer**
- Pros: Simple, low latency, post-hoc capture
- Cons: ~1MB memory overhead, limited window (60s)
- Implementation: Add `collections.deque` with max size to `FirstCrackSessionRuntime`

**Option B: Continuous Disk Streaming**
- Pros: Unlimited window, lower memory
- Cons: More disk I/O, requires cleanup, slower extraction
- Implementation: Write raw PCM to temp file during roast, delete after export

**Option C: Hybrid**
- Pros: Best of both
- Cons: More complexity
- Implementation: Ring buffer for last 60s, optional disk streaming for full roast

**Recommendation**: Start with Option A (simpler), add Option C later if needed

---

### Decision 2: Session Field Strategy

**Option A: Add New Session Fields**
```python
class RoastSession:
    # Existing:
    first_crack_monotonic_seconds: float | None
    
    # New:
    first_crack_source: Literal["auto", "operator_override"] | None
    first_crack_model_timestamp_seconds: float | None
    first_crack_model_confidence: float | None
    first_crack_audio_capture_path: Path | None
```

**Option B: Extract from Event Payload Only**
```python
# Find override event
fc_override = next(
    (e for e in session.event_timeline if 
     e.kind == "first_crack_detected" and 
     e.payload.get("source") == "operator_override"),
    None
)
```

**Recommendation**:
- **Phase 1**: Use Option B (no MCP schema changes)
- **Phase 2**: Add Option A fields for efficiency

---

### Decision 3: Backward Compatibility

**Question**: Should `mark_first_crack` stay synchronous?

**Current**: `def mark_first_crack(ctx) -> EventCommandResult`

**Option A**: Keep synchronous, add parameters
```python
def mark_first_crack(
    ctx, 
    operator_hint=None, 
    capture_audio=True
) -> EventCommandResult  # Keep existing return type
```

**Option B**: Simplify return type
```python
def mark_first_crack(
    ctx, 
    operator_hint=None, 
    capture_audio=True
) -> str  # Simpler for agent consumption
```

**Recommendation**: Option A (backward compatible with existing MCP patterns)

---

## Summary

The plan is now **grounded and honest** about what exists vs. what needs to be built:

✅ **Loop A** (ratings → reference roasts):
- Agent-side implementation
- Works with existing MCP
- Ready for Phase 1

⚠️ **Loop B** (FC overrides → model improvement):
- Requires MCP enhancements (audio ring buffer, new session fields)
- Design decisions needed (ring buffer vs disk streaming)
- Phase 2+ work

The conceptual story remains solid. The implementation path is now clear about
dependencies and prerequisite work.

---

## For the Talk/Presentation

When discussing Loop B:

**Say**:
- "This is the planned architecture for continuous model improvement"
- "Phase 2 will add audio capture capabilities to the MCP layer"
- "This requires a raw audio ring buffer in FirstCrackSessionRuntime"
- "We're considering ring buffer vs disk streaming approaches"

**Don't say**:
- "The MCP server captures audio" (implies it exists today)
- "Just call get_audio_buffer()" (method doesn't exist yet)
- "This is fully implemented" (it's planned, not built)

**Do emphasize**:
- Loop A (ratings → references) is ready for Phase 1
- Loop B builds on proven ML fine-tuning techniques
- The architecture preserves determinism and safety
- User privacy is granular and opt-in by default
