# User Feedback-Based Learning: Extension Summary

## Overview

This document summarizes the comprehensive user feedback-based learning system added to the RoastPilot Agent v2 orchestration plan. The system implements two parallel learning tracks that continuously improve the roasting experience.

---

## Two Learning Tracks

### Track 1: Roast Curve Learning → Advisory Improvement
**Goal**: Use tasting ratings to guide future roast recommendations

**How it works**:
1. Users rate roasts (1-5 stars) and tasters provide detailed feedback
2. Cloud aggregates high-rated roast curves by bean origin and roast level
3. Before a roast, agent downloads reference summaries of similar successful roasts
4. PydanticAI advisor receives these as context for better recommendations

**Example**:
```
"You're roasting Ethiopian Yirgacheffe. Similar roasts rated 4.5+ stars 
reduced heat to 60% at 340°F and increased fan before first crack."
```

### Track 2: First-Crack Detection Model → ML Model Improvement
**Goal**: Use operator overrides to improve first-crack detection accuracy

**How it works**:
1. When operator manually marks first crack (override), MCP captures ±30s audio window
2. Audio + metadata uploaded to cloud (with user consent)
3. Human annotators validate the timing
4. Validated samples added to training dataset
5. Model fine-tuned and published to Hugging Face
6. Updated model downloaded by MCP (manual or auto)

**Result**: Model accuracy improves from 92% → 94% → 96% over time

---

## Architecture: Who Does What

### MCP Layer (`coffee-roaster-mcp`)

⚠️ **Important**: The following describes **proposed enhancements** to `coffee-roaster-mcp`,
not existing code. These capabilities need to be added in Phase 2.

**Would own** (after enhancements):
- ✅ Recording first-crack overrides with precise timestamps
- ✅ Capturing audio windows (±30s) when override occurs
- ✅ Saving audio as WAV files (16kHz mono) with metadata JSON
- ✅ Exporting override data in roast log summary
- ✅ Buffering raw audio in memory for on-demand capture

**Required enhancements**:
1. **Raw audio ring buffer**: Current audio pipeline drains and discards windows after
   processing. Need to add ~1MB circular PCM buffer to `FirstCrackSessionRuntime`.
2. **Extended `mark_first_crack` signature**: Current signature is synchronous with
   only `ctx` parameter. Need to add `operator_hint` and `capture_audio` parameters.
3. **Session-level FC metadata**: Current `RoastSession` doesn't distinguish model vs
   operator sources. Need fields: `first_crack_source`, `first_crack_model_timestamp_seconds`,
   `first_crack_model_confidence`, `first_crack_audio_capture_path`.

**Proposed MCP tool signature**:
```python
# Current: mark_first_crack(ctx: Context[...]) -> EventCommandResult
# Proposed:
mark_first_crack(
    ctx: Context[ServerSession, ServerContext],  # Existing
    operator_hint: str | None = None,  # NEW: "heard first pop"
    capture_audio: bool = True,  # NEW: save audio window
) -> str
```

**Proposed data structures**:
```python
# NEW MODEL (does not exist yet in coffee-roaster-mcp)
class FirstCrackOverride(BaseModel):
    override_timestamp_seconds: float
    override_source: Literal["operator", "manual_mark"]
    model_detected_timestamp_seconds: float | None
    model_confidence: float | None
    operator_hint: str | None  # User's reason for override
    audio_window_captured: bool
```

### Agent Layer (`coffee-roaster-agent-v2`)

**Owns**:
- ✅ User privacy controls (opt-in/opt-out for data sharing)
- ✅ Uploading roast data to cloud (with anonymization)
- ✅ Uploading FC override audio (if consent given)
- ✅ Downloading reference roast summaries before roasts
- ✅ Providing reference context to PydanticAI advisor
- ✅ Managing local cache of reference roasts

**New configuration**:
```python
class FeedbackConfig(BaseSettings):
    contribute_roast_curves: bool = True  # Share anonymized roast data
    contribute_audio_overrides: bool = False  # Share FC audio (off by default)
    download_reference_roasts: bool = True  # Use community data
    auto_update_fc_model: bool = False  # Auto-download model updates
```

### Cloud Data Plane

**Owns**:
- ✅ Storing roast curves with ratings
- ✅ Storing FC override audio samples
- ✅ Aggregating roast data across users (privacy-respecting)
- ✅ Annotation service for validating FC overrides
- ✅ Building reference summaries by bean/roast level
- ✅ Serving reference data to agents

**New tables**:
```sql
-- FC training samples
fc_training_samples (
    audio_file_url,
    override_timestamp_seconds,
    operator_hint,
    annotation_status,  -- 'pending', 'validated', 'rejected'
    ...
)

-- Reference roast summaries
reference_roast_summaries (
    bean_origin,
    roast_level,
    avg_rating,
    first_crack_temp_avg,
    drop_temp_avg,
    development_percent_avg,
    key_patterns,  -- JSONB: common successful adjustments
    ...
)
```

---

## Data Flow Diagrams

### Roast Curve Learning Flow

```
┌─────────────┐
│ Local Roast │
└──────┬──────┘
       ▼
┌─────────────┐
│ Export Logs │
└──────┬──────┘
       ▼
┌──────────────┐      ┌──────────┐
│  Cloud Sync  │─────▶│ Cloud DB │
└──────────────┘      └────┬─────┘
                           ▼
                    ┌────────────────┐
                    │ Aggregate &    │
                    │ Correlate      │
                    │ (high ratings) │
                    └────┬───────────┘
                         ▼
                    ┌────────────────┐
                    │ Reference      │◀───┐
                    │ Summaries      │    │
                    └────┬───────────┘    │
                         │                │
      Next Roast         │                │
         ▼               ▼                │
    ┌─────────────┬──────────────┐       │
    │ Query Cloud │ Local Cache  │       │
    └─────────────┴──────┬───────┘       │
                         ▼                │
                    ┌────────────┐        │
                    │ Advisor    │        │
                    │ (PydanticAI)│       │
                    └────┬───────┘        │
                         ▼                │
                    Better Roast ─────────┘
                    (creates feedback loop)
```

### First-Crack Model Improvement Flow

```
┌───────────────────┐
│ Operator Override │ (marks FC manually)
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ MCP Captures      │
│ Audio Window      │ (±30 seconds)
│ + Metadata        │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Agent Uploads     │ (if opted-in)
│ to Cloud Storage  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Annotation Queue  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Human Annotator   │
│ Validates Timing  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Training Dataset  │
│ Augmented         │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Model Fine-Tuning │
│ (coffee-first-    │
│  crack-detection) │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ Publish to        │
│ Hugging Face Hub  │
└─────────┬─────────┘
          ▼
┌───────────────────┐
│ MCP Downloads     │ (next restart or manual)
│ Updated Model     │
└─────────┬─────────┘
          ▼
     Better FC Detection
```

---

## User Experience Flows

### Flow 1: Contributing Feedback (Operator Perspective)

**Week 1: Roast Coffee**
1. Start roast with Ethiopian Yirgacheffe, targeting medium
2. At 8:35, hear first crack but model hasn't detected it yet
3. Press "Mark First Crack" button
4. Optional: Add hint "Heard first clear pop"
5. MCP automatically captures ±30s audio window (if opted-in)

**Week 1: Rate Roast**
6. After cooling, operator self-rates: 4/5 stars
7. Notes: "Good body, slightly bright"

**Week 2: Share with Tasters**
8. Brew coffee and share with 3 friends
9. Send them unlisted link to rate the roast
10. Friends submit reviews (no account needed):
    - Alice: 5/5 - "Amazing floral notes, clean finish"
    - Bob: 4/5 - "Bright acidity, balanced"
    - Carol: 5/5 - "Best Ethiopian I've had"

**Week 3: Cloud Processing**
11. Cloud aggregates: 4.5 avg rating for this roast
12. Roast curve added to "Ethiopian Yirgacheffe - Medium" reference summaries
13. Audio override queued for annotation

**Week 4: Annotation**
14. Human annotator reviews audio clip
15. Confirms first crack at 8:35 (operator was correct)
16. Sample added to training dataset

**Week 6: Model Update**
17. New model published with improved accuracy
18. Operator downloads update (manual or auto-update if enabled)

**Week 7: Next Roast**
19. Operator starts another Ethiopian roast
20. Agent downloads reference: "5 similar roasts rated 4.5+ stars suggest..."
21. Advisor recommends reducing heat at 340°F based on successful patterns
22. FC detection is more accurate (fewer overrides needed)

### Flow 2: Benefiting from Community (New User Perspective)

**First Roast Ever**
1. New user selects "Colombian - Medium"
2. Agent queries cloud: "12 successful roasts found with 4.5+ avg rating"
3. Downloads compact summaries (not full logs)
4. Advisor receives context: 
   - "Similar roasts dropped at 403-408°F"
   - "Common pattern: reduce heat at 335°F to 65%"
5. User follows advisor recommendations
6. **Result**: First roast turns out great (benefits from community knowledge)

---

## Privacy and Ethics

### User Controls

| Setting | Default | Description |
|---------|---------|-------------|
| `contribute_roast_curves` | `True` | Share anonymized roast telemetry and ratings |
| `contribute_audio_overrides` | `False` | Share FC audio clips for model training |
| `download_reference_roasts` | `True` | Use community roast data for recommendations |
| `auto_update_fc_model` | `False` | Automatically download model updates |

**Key principles**:
- ✅ Granular opt-in (separate controls for each type of data)
- ✅ Audio sharing OFF by default (more sensitive)
- ✅ Revoke consent anytime (user can delete all contributions)
- ✅ View contributions (dashboard shows what was shared)
- ✅ Local-only mode (disable all cloud sync)

### Data Anonymization

**Roast Curves**:
- User ID → Hashed or stripped
- Location → Removed
- Timestamps → Normalized to roast-relative time
- Only aggregate statistics published

**Audio Clips**:
- No user PII in audio (only roaster sounds)
- Metadata stripped of identifying info
- Roast ID → One-way hashed
- Secure storage (encrypted at rest, access-controlled)

**Reference Summaries**:
- Aggregated across multiple roasts (no individual curves)
- Bean origin and roast level retained (needed for matching)
- Statistical summaries only (avg, stddev, patterns)

---

## Success Metrics

### Advisory Improvement

| Metric | Target | Measurement |
|--------|--------|-------------|
| Reference roast usage | >70% | % of roasts that query references |
| Rating improvement | +0.5 stars | Avg rating with references vs without |
| Override reduction | -30% | Fewer manual heat/fan adjustments |
| Consistency | σ < 0.3 | Reduced variance in outcomes |

### Model Improvement

| Metric | Target | Measurement |
|--------|--------|-------------|
| Override frequency | <5% | % of roasts with FC override |
| Model precision | >95% | True positive rate |
| Model recall | >98% | Catch all first cracks |
| Timing accuracy | >90% | Within ±2s of ground truth |
| Dataset growth | +50/month | Validated samples added |

---

## Implementation Phases

### Phase 1: Basic Feedback Loop (Milestone 2)
**Scope**: Roast curve learning without audio

- Cloud roast upload (summary + telemetry)
- Tasting review collection (rating + notes)
- Simple reference roast queries (by bean + level)
- Manual FC override recording (MCP side)

**MCP changes** (minimal - no audio capture yet):
- Add `operator_hint` parameter to `mark_first_crack` (optional enhancement)
- Record override metadata in event timeline payload (works with existing pattern)
- Export override data in roast summary (extract from event payload)

**Agent changes**:
- Upload roast data to cloud (with privacy controls)
- Download reference roasts before starting
- Extend `AdvisorContext` with `reference_roasts` field

**Cloud changes**:
- Store roast curves with ratings
- Build reference summaries (manual or batch job)
- API: `query_reference_roasts(bean_origin, target_level, min_rating)`

### Phase 2: Audio Capture (Milestone 3)
**Scope**: Loop B foundation (audio capture for future model improvement)

⚠️ **This phase requires significant MCP enhancements** (see details below).

**MCP enhancements required**:
- Add raw audio ring buffer to `FirstCrackSessionRuntime` (~1MB circular buffer)
  - Current: AudioCapturePipeline drains windows and discards
  - Proposed: Keep 60s of raw 16kHz mono PCM in circular buffer
  - Thread-safe: audio thread writes, MCP thread reads
- Implement `get_audio_buffer(center_timestamp, window_seconds)` method
- Add `operator_hint` and `capture_audio` parameters to `mark_first_crack`
- Add session fields for FC source tracking and audio path
- Implement `_capture_audio_window()` helper function
- Enhance `export_roast_snapshot()` to include override metadata

**Design decision**: Ring buffer vs continuous disk streaming
- Ring buffer: 1MB memory overhead, simple implementation
- Disk streaming: More I/O, but enables longer capture windows
- **Recommendation**: Start with ring buffer (simpler)

**Agent changes**:
- Add `FeedbackConfig` with audio opt-in control
- Upload audio files to cloud storage (if consented)
- Display privacy dashboard (what was shared)

**Cloud changes**:
- Store audio files (S3 or similar)
- Create `fc_training_samples` table
- Basic annotation UI (play audio, confirm timestamp)

### Phase 3: Model Improvement (Milestone 4)
**Scope**: Annotation pipeline and model fine-tuning

- Annotation pipeline (multi-annotator validation)
- Fine-tuning workflow (coffee-first-crack-detection)
- Model versioning and publishing (Hugging Face)
- Auto-update mechanism (opt-in)

**coffee-first-crack-detection changes** (in that repo):
- Script to download validated samples from cloud annotation service
- Augment training dataset with new samples (merge with existing data)
- Fine-tuning script (documented process, not automated initially)
- Evaluation on held-out test set (require improvement over baseline)
- Publish to Hugging Face Hub with version tag (manual review before release)

**MCP changes**:
- Check for model updates on startup (if enabled)
- Download new model from Hugging Face
- Fallback to current model if download fails

**Cloud changes**:
- Multi-annotator workflow (3 annotators per sample)
- Inter-annotator agreement scoring
- Metrics dashboard (override frequency, model accuracy trend)

### Phase 4: Advanced Learning (Milestone 5)
**Scope**: Automated pattern extraction and personalization

- Automated pattern extraction from high-rated roasts
- Multi-modal learning (audio + telemetry correlation)
- Personalized recommendations (user's past roasts)
- Community gallery and leaderboards (opt-in)

---

## Testing Strategy

### Roast Curve Learning Tests

**Unit Tests**:
- Mock cloud API with reference roasts
- Verify `AdvisorContext` includes references
- Test anonymization (no PII in uploaded data)

**Integration Tests**:
- End-to-end: Upload roast → Cloud aggregation → Download references → Advisor receives
- Privacy: Verify opt-out prevents upload
- Fallback: Cloud unavailable → agent continues without references

### FC Model Improvement Tests

**Unit Tests** (MCP):
- Mock audio capture during override
- Verify metadata is complete (timestamp, hint, temps)
- Test audio file format (16kHz mono WAV)

**Unit Tests** (Agent):
- Verify privacy controls prevent upload when opted-out
- Test audio file upload with metadata

**Integration Tests**:
- End-to-end: Override → Capture → Upload → Annotation → Training → Download
- Privacy: Verify opt-out at each stage
- Graceful degradation: Audio capture fails → roast continues

**Model Tests** (coffee-first-crack-detection):
- Verify new samples are added to dataset
- Test fine-tuning doesn't degrade performance
- Evaluate on held-out test set before publishing

---

## Benefits Summary

### For Individual Users

1. **Better roasts faster**: Learn from community successes
2. **Reduced trial-and-error**: Reference data guides decisions
3. **Improved FC detection**: Model gets better over time
4. **Personalized insights**: System learns user's preferences

### For the Community

1. **Collective learning**: Everyone benefits from shared knowledge
2. **Improved models**: FC detection accuracy improves continuously
3. **Data-driven roasting**: Evidence-based recommendations
4. **Knowledge preservation**: Best practices captured and shared

### For the Project

1. **Product differentiation**: Unique learning system
2. **Network effects**: More users → better data → better product
3. **Continuous improvement**: System gets better without code changes
4. **User engagement**: Contributors feel invested in the ecosystem

---

## Architecture Gaps and Mitigations

### Gap 1: Audio Ring Buffer (Most Significant)

**Current state**: `AudioCapturePipeline.drain_windows()` feeds processed windows to
the detector and discards them. No raw PCM ring buffer exists.

**Required**: Add circular buffer to `FirstCrackSessionRuntime`
- Buffer size: 60 seconds @ 16kHz mono = 960KB
- Thread-safe: audio capture thread writes, MCP tool thread reads
- Timestamped: samples aligned with `session.monotonic_start`
- Method: `get_audio_buffer(center_timestamp, window_seconds) -> np.ndarray | None`

**Alternative**: Stream raw audio to disk continuously during roast, extract clips
after override. Avoids ring buffer but requires more disk I/O.

**Decision point**: Phase 2 implementation planning

### Gap 2: MCP Tool Signature

**Current**: `mark_first_crack(ctx: Context[...]) -> EventCommandResult` (synchronous)

**Proposed**: Add optional parameters:
```python
mark_first_crack(
    ctx: Context[...],
    operator_hint: str | None = None,
    capture_audio: bool = True,
) -> str
```

**Migration**: Backward compatible (new parameters are optional)

### Gap 3: Session Fields

**Current state**: `RoastSession` has:
- `first_crack_monotonic_seconds: float | None` (accepted timestamp)
- `monotonic_start: float` (session start time)

**Missing** (needed for Loop B):
- `first_crack_source: Literal["auto", "operator_override"] | None`
- `first_crack_model_timestamp_seconds: float | None`
- `first_crack_model_confidence: float | None`
- `first_crack_audio_capture_path: Path | None`

**Workaround for Phase 1**: Extract override data from event timeline payload
(works without new session fields)

**Full solution for Phase 2**: Add new session fields for efficient access

## Risks and Mitigations

### Risk 1: Privacy Concerns

**Concern**: Users uncomfortable sharing roast data

**Mitigation**:
- ✅ Granular opt-in controls (separate for curves vs audio)
- ✅ Audio sharing OFF by default
- ✅ Clear transparency (what data, how used)
- ✅ Revoke consent anytime
- ✅ Local-only mode available

### Risk 2: Low Participation Rate

**Concern**: Not enough users contribute data

**Mitigation**:
- ✅ Make roast curve sharing opt-in by default (less sensitive)
- ✅ Show clear benefits (better recommendations)
- ✅ Community leaderboard (opt-in gamification)
- ✅ Badges/recognition for contributors

### Risk 3: Annotation Quality

**Concern**: Human annotators make mistakes

**Mitigation**:
- ✅ Multi-annotator validation (3+ per sample)
- ✅ Inter-annotator agreement scoring
- ✅ Only high-confidence samples added to training
- ✅ Periodic model evaluation on test set

### Risk 4: Model Degradation

**Concern**: Fine-tuning makes model worse

**Mitigation**:
- ✅ Always evaluate on held-out test set before publishing
- ✅ Require improvement over baseline (e.g., +0.5% precision)
- ✅ Version models (can roll back if needed)
- ✅ Manual review of model updates before auto-deploy

### Risk 5: Data Storage Costs

**Concern**: Audio files are large, storage expensive

**Mitigation**:
- ✅ 30-second clips at 16kHz mono ≈ 1MB each
- ✅ Estimate 100 overrides/month = 100MB/month = $0.02/month (S3 pricing)
- ✅ Delete after annotation complete (1-2 weeks retention)
- ✅ Compress older annotations (keep metadata only)

---

## Open Questions for Future Consideration

1. **Model update frequency**: Weekly? Monthly? On-demand?
2. **Annotation incentives**: Paid annotators? Community volunteers?
3. **Multi-bean models**: Fine-tune separate models per bean origin?
4. **Transfer learning**: Use overrides to improve other detection tasks?
5. **Personalization depth**: How much to weight user's own history vs community?
6. **Data retention**: How long to keep raw audio? Indefinitely for research?

---

## Summary

This user feedback-based learning system creates a **virtuous cycle**:

1. Users roast coffee and contribute data (opt-in)
2. Cloud aggregates and learns patterns
3. Models improve, recommendations get better
4. Users get better results
5. More users join and contribute
6. Cycle repeats → continuous improvement

**Key design principles**:
- ✅ Privacy-first (granular opt-in, anonymization)
- ✅ User benefit (contributors see improvements)
- ✅ Community benefit (everyone helps everyone)
- ✅ Safety-maintained (learning doesn't compromise control)
- ✅ Determinism-preserved (advisor still advisory-only)

**Implementation approach**:
- Phase 1 (Milestone 2): Basic roast curve learning
- Phase 2 (Milestone 3): Audio capture
- Phase 3 (Milestone 4): Model fine-tuning
- Phase 4 (Milestone 5): Advanced features

The system enhances RoastPilot v2 without changing its fundamental deterministic architecture. The LLM advisor gets better context, and the FC model gets better accuracy—but the safety-critical controller remains fully deterministic and local-first.
