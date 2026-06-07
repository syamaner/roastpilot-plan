# RoastPilot Agent v2 Orchestration Plan Updates

## Summary of Changes

Based on analysis of the Hottop KN-8828B-2K+ hardware specifications, the pyhottop reference implementation, and the coffee-roaster-mcp codebase, the following updates were made to the orchestration plan:

---

## 1. Controller Tick Rate Specification (§ Controller Loop)

**Changed from**: Unspecified "fixed-rate scheduler"

**Changed to**: **1.0 second intervals**

**Rationale**:
- Hottop KN-8828B-2K+ uses dual K-type thermocouples with 0.5-2 second response times
- pyhottop reference library uses 0.6-1.0 second polling (changelog: "adjusted default interval to 1 second to avoid buffer issues")
- MCP server polls at 0.3s but consecutive reads often return identical values within ~1 second
- Physical sensor limitations mean unique temperature readings occur at ~1 Hz

**Impact**: Prevents wasted CPU cycles polling faster than hardware can provide unique data.

---

## 2. Advisory Call Frequency Policy (NEW § Advisory Call Frequency)

**Added explicit policy** for when to call the LLM advisor:

### Call advisor when:
- **Temperature change**: Bean temp changed ≥ 1.0°C since last call
- **RoR change**: Rate of rise changed ≥ 2.0°C/min since last call
- **Phase transition**: Roast phase changed
- **Minimum interval**: 15-30 seconds elapsed during development phase
- **Manual trigger**: Operator explicitly requests input

### Do NOT call advisor:
- ❌ Every tick (wasteful given sensor update rate)
- ❌ When no meaningful changes have occurred
- ❌ When advisor is already processing

**Rationale**: Advisory calls are expensive (network + LLM latency). Only call when the advisor has new, meaningful information to consider.

**Impact**: Reduces latency, cost, and prevents advisor from seeing duplicate data.

---

## 3. T0 Debounce Window Update (§ T0 Debouncing)

**Changed from**: 2 consecutive ticks

**Changed to**: **3 consecutive ticks** (3 seconds at 1.0s tick rate)

**Rationale**:
- 2 seconds may be too short for noisy temperature readings
- Door openings or airflow changes can cause transient temperature drops
- 3-second confirmation window provides better stability without excessive delay

**Impact**: Reduces false T0 detections from sensor noise or transient events.

---

## 4. AdvisorContext Model Definition (§ PydanticAI Advisory Layer)

**Added explicit model** for advisor context (was previously referenced but undefined):

```python
class AdvisorContext(BaseModel):
    """Structured context provided to the advisory layer."""
    phase: str  # Current RoastPhase
    roast_elapsed_seconds: float
    development_elapsed_seconds: float | None
    current_bean_temp_c: float
    current_env_temp_c: float
    bean_ror_c_per_min: float | None
    env_ror_c_per_min: float | None
    target_drop_temp_c: float
    profile_name: str
    recent_telemetry_samples: list[dict]  # Last N samples for context
    first_crack_detected: bool
    first_crack_timestamp_seconds: float | None
```

**Impact**: Clarifies exactly what data the advisor receives; enables implementation to begin.

---

## 5. Configuration Model (NEW § Configuration Model)

**Added explicit configuration** for all timing-sensitive parameters:

```python
class ControllerConfig(BaseSettings):
    """Controller timing and advisory configuration."""
    tick_interval_seconds: float = 1.0
    advisory_min_temp_delta_c: float = 1.0
    advisory_min_ror_delta_c_per_min: float = 2.0
    advisory_min_interval_seconds: float = 15.0
    advisory_timeout_seconds: float = 10.0
    t0_debounce_ticks: int = 3
    telemetry_log_interval_seconds: float = 5.0
    max_stale_telemetry_seconds: float = 3.0
```

**Rationale**: Makes all timing decisions explicit and configurable; enables tuning without code changes.

**Impact**: Easier testing, deployment, and field tuning.

---

## 6. Hardware Characteristics Section (NEW § Hardware Characteristics)

**Added comprehensive documentation** of Hottop KN-8828B-2K+ hardware constraints:

- K-type thermocouple response times
- Serial protocol characteristics
- Reference implementation polling rates
- MCP server behavior
- Relationship between "real-time display" and unique sensor readings

**Sources**:
- Hottop KN-8828B-2K+ Manual (KN-8828B-2K+Manual_0_1g.pdf)
- pyhottop library source code and changelog
- coffee-roaster-mcp driver implementation

**Impact**: Documents the rationale for timing decisions; prevents future "why not poll faster?" questions.

---

## Testing Implications

### New Test Coverage Needed

1. **Advisory Call Frequency Tests**:
   - Verify advisor NOT called on consecutive ticks with unchanged temps
   - Verify advisor IS called when temp delta ≥ 1.0°C
   - Verify advisor IS called when RoR changes ≥ 2.0°C/min
   - Verify minimum interval enforcement (15-30s)

2. **T0 Debounce Tests**:
   - Verify T0 rejected if only 1-2 consecutive ticks report it
   - Verify T0 accepted after 3 consecutive ticks
   - Verify debounce counter resets if T0 drops out

3. **Tick Rate Tests**:
   - Verify controller runs at 1.0s ± acceptable jitter
   - Verify stale data detection when MCP polling fails
   - Verify consecutive reads may have identical temps (expected behavior)

4. **Configuration Tests**:
   - Verify all timing parameters are configurable
   - Verify invalid configs are rejected (e.g., tick_interval ≤ 0)

---

## Migration Notes

### From Previous Plan Version

1. Update controller tick rate from unspecified to **1.0 seconds**
2. Implement advisory call frequency logic (don't call every tick)
3. Update T0 debounce from 2 to **3 ticks**
4. Define `AdvisorContext` in `models.py`
5. Add `ControllerConfig` to `config.py`
6. Document hardware characteristics in README or architecture docs

### No Breaking Changes

These updates **clarify** the existing plan rather than fundamentally changing the architecture. All core decisions (LLM advisory-only, deterministic safety, local-first, etc.) remain unchanged.

---

## Summary

| Aspect | Before | After | Benefit |
|--------|--------|-------|---------|
| **Tick rate** | Unspecified | 1.0s (explicit) | Hardware-aligned, prevents waste |
| **Advisory calls** | Unclear | Change-driven policy | Reduces cost & latency |
| **T0 debounce** | 2 ticks | 3 ticks | Better noise rejection |
| **AdvisorContext** | Referenced | Fully defined | Implementation-ready |
| **Configuration** | Implicit | Explicit model | Testable, tunable |
| **Hardware docs** | Minimal | Comprehensive | Clear rationale |

---

## Next Steps

1. Review and approve these changes
2. Begin Milestone 1 implementation with updated parameters
3. Validate tick rate and advisory frequency with mock roasts
4. Tune debounce windows and advisory thresholds based on test data
5. Document field tuning guidance for production deployments
