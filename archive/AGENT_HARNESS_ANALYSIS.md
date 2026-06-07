# RoastPilot Agent v2: Agent Harness Architecture Analysis

## Overview

This document analyzes how RoastPilot Agent v2 positions itself relative to modern agent frameworks and the determinism spectrum. It evaluates the architectural choice of using a "Deterministic Controller with Advisory AI" pattern rather than traditional agentic frameworks.

---

## Agent Framework Positioning

### The Determinism Spectrum

```
┌─────────────────────────────────────────────────────────────┐
│                  DETERMINISM SPECTRUM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Fully Deterministic          Hybrid           Fully Agentic│
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  [Traditional Control]    [RoastPilot v2]    [OpenAI Swarm] │
│  [PID Controllers]        [LangChain]         [AutoGPT]     │
│  [State Machines]         [PydanticAI]        [n8n Agents]  │
│                          [Temporal]                          │
│                                                              │
│  ← More Safe/Predictable        Less Safe/Unpredictable →   │
└─────────────────────────────────────────────────────────────┘
```

**RoastPilot Agent v2 Classification**: Deterministic Harness with Advisory AI

**Position**: Hybrid/deterministic zone, closer to traditional control systems than agentic frameworks.

---

## Comparison to Agent Frameworks

### 1. vs. OpenAI Agents SDK / Swarm

| Aspect | OpenAI Agents SDK | RoastPilot Agent v2 |
|--------|-------------------|---------------------|
| **Loop control** | LLM owns the loop | ✅ Deterministic state machine owns loop |
| **Tool access** | LLM can call tools directly | ✅ LLM returns typed recommendations only |
| **Safety** | Prompt-based guardrails | ✅ Hard-coded safety policy |
| **State management** | Conversation history | ✅ Explicit state machine with typed transitions |
| **Recovery** | Retry prompts | ✅ Typed fault states with operator workflows |
| **Hardware control** | Possible via tools | ❌ **Never** exposed to LLM |

**Verdict**: RoastPilot v2 is **much more deterministic**. OpenAI Agents would be dangerous for hardware control.

**Rationale**: Giving LLMs direct tool access for hardware control introduces unacceptable risk:
- LLM hallucinations could trigger dangerous commands
- Prompt injection vulnerabilities
- No deterministic safety boundary
- Recovery depends on LLM behavior

---

### 2. vs. LangChain / LangGraph

| Aspect | LangChain/LangGraph | RoastPilot Agent v2 |
|--------|---------------------|---------------------|
| **Orchestration** | Graph-based LLM routing | ✅ Code-owned state machine |
| **Tool execution** | LLM decides when to call | ✅ Controller decides when to ask LLM |
| **State persistence** | Memory stores | ✅ SQLite with explicit schema |
| **Determinism** | Graph is deterministic, LLM decisions are not | ✅ State machine is deterministic, LLM is advisory |
| **Safety** | Middleware/callbacks | ✅ Safety layer runs before LLM sees context |

**Verdict**: RoastPilot v2 is **more deterministic**. LangGraph's graph structure is deterministic, but LLM decisions still drive tool execution.

**Rationale**: LangChain excels at orchestrating LLM-driven workflows, but this inverts the control relationship needed for safety-critical systems. RoastPilot requires deterministic control with optional LLM input, not LLM-driven control with validation.

---

### 3. vs. PydanticAI (What RoastPilot Uses)

| Aspect | Pure PydanticAI | RoastPilot Agent v2 |
|--------|-----------------|---------------------|
| **LLM role** | Can call tools via function calling | ✅ Returns typed data only (no tool access) |
| **Validation** | Pydantic output validation | ✅ Pydantic output + safety layer validation |
| **Loop control** | Application code manages loop | ✅ State machine + tick scheduler manages loop |
| **Determinism** | Tool calls are LLM-driven | ✅ Tool calls are controller-driven after LLM advice |

**Verdict**: RoastPilot v2 **uses PydanticAI correctly** — for typed output validation, not tool orchestration. The controller wraps PydanticAI in a deterministic harness.

**Rationale**: PydanticAI provides excellent typed output validation but doesn't dictate architecture. RoastPilot uses it as a library within a deterministic framework, not as the orchestration layer.

---

### 4. vs. Temporal Workflows

| Aspect | Temporal | RoastPilot Agent v2 |
|--------|----------|---------------------|
| **Durable execution** | Yes (event sourcing) | ✅ Yes (SQLite WAL + event log) |
| **State machine** | Code-as-workflows | ✅ Explicit state enum + transitions |
| **Restart recovery** | Automatic replay | ✅ Manual recovery state + operator confirmation |
| **Determinism** | Fully deterministic replays | ✅ Deterministic state machine |
| **LLM integration** | Activities can call LLMs | ✅ LLM is isolated, advisory-only activity |

**Verdict**: RoastPilot v2 is **similar in determinism philosophy** to Temporal. The plan even mentions "revisit Temporal if local durable-lite recovery becomes insufficient."

**Key differences**:
- **Temporal**: General-purpose durable execution with external coordinator
- **RoastPilot v2**: Hardware-control-specific with local-first SQLite (no external coordinator)
- **Recovery**: Temporal auto-replays; RoastPilot requires operator confirmation for safety

**Rationale**: Temporal would be an excellent fit if cloud-based orchestration becomes necessary, but for Milestone 1, local SQLite provides sufficient durability without external dependencies.

---

### 5. vs. Legacy n8n-style Orchestration

| Aspect | n8n Agent Loops (Legacy) | RoastPilot Agent v2 |
|--------|--------------------------|---------------------|
| **Loop location** | External orchestrator | ✅ Local Python process |
| **LLM authority** | Could trigger commands | ✅ Advisory only |
| **Safety** | Prompt-based | ✅ Hard-coded policy |
| **Cloud dependency** | Required for orchestration | ✅ Local-first (cloud optional) |
| **Recovery** | Manual intervention | ✅ Typed recovery states |

**Verdict**: RoastPilot v2 is a **massive improvement in determinism and safety** over the legacy n8n approach.

**Rationale**: The legacy prototype demonstrated the concept but had unacceptable safety characteristics for production use:
- Cloud dependency for active roast control
- LLM could directly trigger hardware commands
- No deterministic safety boundary
- Recovery required external intervention

---

## Determinism Analysis

### Deterministic Components (100% Predictable)

✅ **State machine transitions**
- Enum-based phases with explicit transition rules
- Transitions triggered by MCP state, not LLM decisions
- Test coverage ensures all transitions behave correctly

✅ **Safety policy**
- Hard-coded temperature limits
- Clamp/reject logic is pure code
- Emergency stop is hardware-triggered
- No LLM involvement in safety evaluation

✅ **Tick scheduler**
- Monotonic 1.0s intervals
- Jitter measurement and rejection
- Predictable timing regardless of LLM latency

✅ **MCP client**
- Typed tool calls with validation
- Controller decides which tools to call and when
- No LLM decides which tools to call

✅ **Persistence**
- SQLite with WAL mode
- Event sourcing for audit trail
- Deterministic commit ordering

✅ **Recovery logic**
- On restart: query last state, enter `operator_recovery_required`
- Explicit operator actions required (no auto-resume)
- Never auto-resume heat/fan control

---

### Non-Deterministic Components (LLM-Influenced)

⚠️ **Advisory recommendations**
- LLM suggests heat/fan targets
- Same context may produce different outputs (temperature parameter)
- **Mitigated by**: Safety layer validates/clamps/rejects all recommendations

⚠️ **Advisory call timing**
- Triggered by temperature/RoR changes
- LLM latency varies (network + inference time)
- **Mitigated by**: 10-second timeout, controller continues on failure

⚠️ **Rationale text**
- LLM-generated explanations for UI display
- Purely informational, doesn't affect control decisions
- **Mitigated by**: Not used in control logic, UI-only field

---

### Determinism Score

> **Caveat**: The percentages below are qualitative heuristics for internal
> reasoning, not measured values. Do not present them in talks or public
> material as quantified results — describe the boundary qualitatively instead
> ("the control loop, safety policy, and hardware commands are deterministic
> code; only the advisory recommendation is model-generated, and it is
> validated before use").

```
Core Control Loop:      100% deterministic
Safety Policy:          100% deterministic
State Management:       100% deterministic
Hardware Commands:      100% deterministic (after safety validation)
Advisory Influence:     ~20% (suggestions only, validated/clamped)
Overall System:         ~85-90% deterministic
```

**For comparison**:
- Traditional PID controller: **100%**
- OpenAI Agents SDK: **~30%**
- LangChain with tools: **~50%**
- Temporal + LLM activities: **~70%**
- **RoastPilot Agent v2: ~85-90%**

---

## Agent Harness Pattern

### Pattern Definition

RoastPilot v2 implements a **Deterministic Controller with Advisory AI** pattern:

```python
# Pseudocode demonstrating the pattern

class DeterministicControllerWithAdvisoryAI:
    """
    Core pattern: Deterministic harness wraps advisory AI.
    The controller owns the loop; the LLM is a consulted service.
    """
    
    def tick(self):
        # 1. DETERMINISTIC: Read sensors
        state = self.mcp_client.get_roast_state()
        
        # 2. DETERMINISTIC: Persist
        self.store.persist(state)
        
        # 3. DETERMINISTIC: Safety first (before any LLM involvement)
        safety_verdict = self.safety.evaluate(state)
        if safety_verdict.should_fault():
            return self.enter_fault_state(safety_verdict)
        
        # 4. DETERMINISTIC: State transitions
        new_phase = self.state_machine.evaluate_transitions(state)
        if new_phase != self.current_phase:
            self.transition_to(new_phase)
        
        # 5. CONDITIONAL NON-DETERMINISTIC: Advisory (only if meaningful change)
        if self.should_call_advisor(state):
            try:
                context = self.build_advisor_context(state)
                recommendation = await self.advisor.get_recommendation(context)  # LLM call
            except TimeoutError:
                recommendation = None  # Deterministic fallback
        else:
            recommendation = None
        
        # 6. DETERMINISTIC: Validate advisory output
        if recommendation:
            validated_command = self.safety.validate_and_clamp(recommendation)
        else:
            validated_command = self.deterministic_fallback_policy(state)
        
        # 7. DETERMINISTIC: Execute validated command
        self.mcp_client.execute_command(validated_command)
        
        # 8. DETERMINISTIC: Persist and emit
        self.store.log_command(validated_command)
        self.event_bus.emit(state_updated_event)
```

**Key insight**: The LLM is **inside** the deterministic harness, not **driving** it.

---

### Pattern Characteristics

**Control Flow**:
```
┌─────────────────────────────────────────────────────────┐
│         DETERMINISTIC OUTER LOOP (Controller)           │
│                                                          │
│  ┌────────────┐                                         │
│  │   Tick     │                                         │
│  └──────┬─────┘                                         │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │  Read MCP State    │  ◄── Deterministic             │
│  └──────┬─────────────┘                                │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │  Safety Policy     │  ◄── Deterministic             │
│  └──────┬─────────────┘                                │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ State Transitions  │  ◄── Deterministic             │
│  └──────┬─────────────┘                                │
│         ▼                                               │
│  ┌────────────────────────────────────────┐            │
│  │  Should Call Advisor?                  │            │
│  │  (temp delta ≥ 1°C? RoR change?)       │            │
│  └──────┬─────────────────────────────────┘            │
│         ▼                                               │
│    YES  │  NO                                           │
│         ▼                                               │
│  ┌──────────────────┐                                  │
│  │ ╔══════════════╗ │                                  │
│  │ ║   ADVISOR    ║ │  ◄── Non-Deterministic          │
│  │ ║   (LLM Call) ║ │      (but isolated)             │
│  │ ╚══════════════╝ │                                  │
│  └──────┬───────────┘                                  │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ Validate & Clamp   │  ◄── Deterministic             │
│  └──────┬─────────────┘                                │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │ Execute Command    │  ◄── Deterministic             │
│  └──────┬─────────────┘                                │
│         ▼                                               │
│  ┌────────────────────┐                                │
│  │  Log & Emit        │  ◄── Deterministic             │
│  └────────────────────┘                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Safety Properties**:
1. LLM is consulted, not in control
2. Safety policy runs before and after LLM
3. LLM failure → deterministic fallback
4. State machine transitions are independent of LLM
5. Operator can override at any time

---

### Why Not a Traditional Agent Framework?

Traditional agent frameworks (OpenAI Agents SDK, LangChain, AutoGPT) give the LLM authority over tool execution and loop control. For hardware control, this is unsafe:

❌ **LLM hallucinations** could trigger dangerous commands
❌ **Prompt injection** could bypass safety guardrails
❌ **Network failures** could block critical safety actions
❌ **State management** depends on conversation history
❌ **Recovery** requires LLM to understand system state
❌ **Debugging** is difficult (what did the LLM decide and why?)

**RoastPilot v2 inverts the relationship**: The deterministic controller owns the loop and calls the LLM as an advisory service, not the other way around.

---

## Safety Properties Analysis

### Safety Properties Preserved

✅ **1. LLM failure ≠ system failure**
- Advisory timeout (10s) → deterministic fallback
- Malformed output → rejected → fallback policy
- Advisory layer crash → controller continues uninterrupted
- Network outage → local fallback (or local model if configured)

✅ **2. Operator override always possible**
- Emergency stop is hardware-level (bypasses all software)
- Operator drop command executes immediately (no advisor delay)
- Recovery states require explicit human confirmation
- Manual heat/fan adjustments bypass advisory

✅ **3. Audit trail is complete**
- Every advisory call logged with input hash + output
- Every safety rejection logged with reason
- Every state transition logged with trigger
- SQLite provides durable, queryable history
- Post-roast analysis can replay decisions

✅ **4. Restart recovery is safe**
- Never auto-resume heat/fan control after restart
- Always enter `operator_recovery_required` state
- Require explicit operator action to continue or abort
- MCP state queried to understand hardware state

✅ **5. Cloud outage ≠ roast failure**
- Local-first architecture (no cloud required for active roast)
- Advisory can run locally with local model (future)
- MCP server is always local (USB serial to roaster)
- Cloud sync is async, best-effort, post-roast

---

### Failure Mode Analysis

| Failure Mode | Impact | Mitigation |
|--------------|--------|------------|
| **LLM API timeout** | Advisory recommendation not available | Deterministic fallback policy (continue current heat/fan) |
| **LLM malformed output** | Pydantic validation fails | Rejection → fallback policy |
| **LLM unsafe recommendation** | Safety layer detects out-of-bounds | Clamp to limits or reject entirely |
| **Network outage** | No cloud LLM access | Use local model or fallback policy |
| **MCP read failure** | No current state | Mark telemetry stale, retry, or fault if persistent |
| **MCP write failure** | Command not executed | Log failure, retry, or enter fault state |
| **SQLite write failure** | Persistence fails | Continue control, log to stderr, alert operator |
| **Process crash** | Controller stops | Restart → `operator_recovery_required` state |
| **Power loss** | Hardware and software stop | Manual restart, recovery state, operator decides next action |

**Key insight**: All failure modes have **deterministic recovery paths** that don't depend on LLM behavior.

---

## Comparison to Industrial Control Standards

### Industrial Control Systems (ICS/SCADA)

RoastPilot v2 follows **ICS best practices**:

✅ **Safety PLC pattern**: Hard safety limits execute before logic control
✅ **Deterministic scheduling**: Fixed-rate tick (1.0s) with jitter monitoring
✅ **Fail-safe defaults**: Emergency stop, operator recovery states
✅ **State machine**: Explicit phases with guarded transitions
✅ **Audit logging**: Complete event timeline for incident analysis

**Difference from traditional ICS**:
- ICS typically uses **PID controllers** for continuous control
- RoastPilot uses **LLM advisor** for control suggestions
- But both wrap the control logic in a **deterministic safety harness**

**Similarity**: The safety architecture is isomorphic to industrial control:

```
Industrial ICS              RoastPilot v2
─────────────              ──────────────
Safety PLC        ═══>     safety.py (hard limits)
Logic PLC         ═══>     controller.py (state machine)
Control Logic     ═══>     advisor.py (LLM recommendations)
HMI/SCADA         ═══>     api.py + SPA
Audit System      ═══>     store.py (SQLite event log)
```

---

### Medical Device Standards (IEC 62304)

RoastPilot v2 aligns with **software safety classification**:

- **Class B/C** (Safety-critical):
  - State machine transitions
  - Safety policy evaluation
  - Hardware command execution
  - Emergency stop

- **Class A** (Non-critical):
  - Advisory recommendations (validated before use)
  - UI rationale text (informational only)

- **Separation**: Critical functions never depend on non-critical LLM output

**Rationale**: Even though coffee roasting isn't medical, applying medical device thinking demonstrates appropriate safety rigor for hardware control.

---

### Automotive (ISO 26262)

RoastPilot v2 mirrors **ASIL-D safety pattern**:

- **ASIL-D** (Automotive Safety Integrity Level - Highest):
  - State machine
  - Safety policy
  - Hardware commands
  - Emergency stop

- **QM** (Quality Managed - non-safety):
  - LLM advisory
  - UI rationale text
  - Cloud sync

- **Freedom from interference**: Safety layer validates all LLM outputs before they can affect hardware

**Pattern**: This is similar to how automotive systems separate safety-critical functions (braking, steering) from convenience features (infotainment).

---

## Agent Framework Taxonomy

### Where RoastPilot v2 Fits

```
┌────────────────────────────────────────────────────────────────┐
│                    AGENT FRAMEWORK TAXONOMY                     │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Type 1: LLM-Driven Agents (Agentic)                           │
│  ────────────────────────────────────────                      │
│  - OpenAI Agents SDK, AutoGPT, BabyAGI                         │
│  - LLM owns loop, decides tools, plans actions                 │
│  - Use case: Research, content creation, exploration           │
│  - Safety: ⚠️ Prompt-based only                                │
│  - Determinism: ~20-40%                                        │
│                                                                 │
│  Type 2: Graph-Orchestrated Agents (Hybrid)                    │
│  ───────────────────────────────────────                       │
│  - LangGraph, CrewAI, Semantic Kernel                          │
│  - Graph structure deterministic, LLM decides at nodes         │
│  - Use case: Multi-step workflows, data pipelines              │
│  - Safety: ⚠️ Middleware validation required                   │
│  - Determinism: ~40-60%                                        │
│                                                                 │
│  Type 3: Deterministic Harness with Advisory AI  ← ROASTPILOT │
│  ───────────────────────────────────────────────────────────   │
│  - RoastPilot v2, Temporal+LLM, Industrial AI control          │
│  - State machine owns loop, LLM advises only                   │
│  - Use case: Hardware control, safety-critical systems         │
│  - Safety: ✅ Hard-coded safety layer + validation             │
│  - Determinism: ~80-95%                                        │
│                                                                 │
│  Type 4: Pure Deterministic (No LLM)                           │
│  ────────────────────────────────                              │
│  - Traditional control systems, PID controllers                │
│  - No AI/LLM involvement                                       │
│  - Use case: Embedded systems, real-time control               │
│  - Safety: ✅ Fully predictable                                │
│  - Determinism: 100%                                           │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**RoastPilot v2 Classification**: **Type 3 - Deterministic Harness with Advisory AI**

---

### When to Use Each Type

**Type 1 (LLM-Driven)**: Use when
- Outcome unpredictability is acceptable
- No physical safety risks
- Exploratory or creative tasks
- Human reviews all outputs before execution

**Type 2 (Graph-Orchestrated)**: Use when
- Workflow structure is known
- Some non-determinism acceptable
- Can validate LLM decisions at checkpoints
- Moderate safety requirements

**Type 3 (Deterministic Harness)**: Use when ← **RoastPilot v2**
- Safety-critical operations
- Hardware control required
- Auditability essential
- Deterministic recovery needed
- LLM adds value but shouldn't have authority

**Type 4 (Pure Deterministic)**: Use when
- Zero LLM/AI required
- Real-time guarantees essential
- Full determinism mandatory
- Regulatory compliance demands it

---

## Recommendations for the Plan

### 1. Add "Agent Harness Pattern" Section

Add this section after "System Architecture":

```markdown
## Agent Harness Pattern

RoastPilot Agent v2 implements a **Deterministic Controller with Advisory AI**
pattern, distinct from traditional agent frameworks.

### Pattern Definition

- **Deterministic Core**: State machine, safety policy, and hardware commands
  are pure code with no LLM involvement
- **Advisory Layer**: LLM provides typed recommendations that are validated,
  clamped, or rejected before execution
- **Safety Boundary**: Hard-coded safety policy runs before and after LLM calls
- **Graceful Degradation**: LLM failure or timeout results in deterministic
  fallback behavior

### Why Not a Traditional Agent Framework?

Traditional agent frameworks (OpenAI Agents SDK, LangChain, AutoGPT) give the
LLM authority over tool execution and loop control. For hardware control, this
is unsafe:

- LLM hallucinations could trigger dangerous commands
- Prompt injection could bypass safety guardrails
- Network failures could block critical safety actions
- State management depends on conversation history
- Recovery requires LLM to understand system state

RoastPilot v2 inverts the relationship: **the deterministic controller owns
the loop and calls the LLM as an advisory service**, not the other way around.

### Comparison to Industrial Control

This pattern mirrors industrial safety architectures:

| Industrial Component | RoastPilot Equivalent |
|---------------------|----------------------|
| Safety PLC          | safety.py (hard limits) |
| Logic PLC           | controller.py (state machine) |
| Control Logic       | advisor.py (LLM recommendations) |
| HMI/SCADA          | api.py + SPA |
| Audit System        | store.py (SQLite event log) |

The key difference: instead of PID control, we use LLM advisory — but wrapped
in the same safety architecture.

### Determinism Score

- Core control loop: **100% deterministic**
- Safety policy: **100% deterministic**
- State management: **100% deterministic**
- Hardware commands: **100% deterministic** (after safety validation)
- Advisory influence: **~20%** (suggestions only, validated/clamped)
- **Overall system: ~85-90% deterministic**

This level of determinism is appropriate for safety-critical hardware control
while still benefiting from LLM capabilities for roast optimization.
```

---

### 2. Add Safety Properties Section

Add this to the Safety Policy section:

```markdown
### Safety Properties

The safety architecture ensures:

1. **LLM failure ≠ system failure**
   - Advisory timeout → deterministic fallback
   - Malformed output → rejection → fallback
   - Network outage → continue with fallback policy

2. **Operator override always possible**
   - Emergency stop bypasses all software
   - Manual commands execute immediately
   - Recovery requires explicit human confirmation

3. **Audit trail is complete**
   - Every advisory call logged with input/output
   - Every safety rejection logged
   - Every state transition logged
   - SQLite provides durable history

4. **Restart recovery is safe**
   - Never auto-resume control
   - Enter operator_recovery_required state
   - Require explicit operator action

5. **Cloud independence**
   - Local-first architecture
   - Cloud sync is async and optional
   - Active roast never requires cloud
```

---

### 3. Clarify Non-Goals

Update the "Explicit Non-Goals" section to include:

```markdown
## Explicit Non-Goals

- Do not rebuild n8n-style prompt-owned loops.
- Do not expose MCP write tools directly to the LLM.
- Do not expose MCP write tools directly to the SPA.
- Do not use OpenAI Agents SDK or similar frameworks that give LLMs tool authority.
- Do not make cloud orchestration the v1 runtime dependency.
- Do not require Hottop hardware, microphone input, or model downloads for the
  first mock-safe vertical slice.
- **Do not treat the LLM as an autonomous agent** — it is an advisory service
  within a deterministic harness.
- **Do not allow LLM decisions to directly trigger hardware commands** — all
  commands must pass through safety validation.
- **Do not depend on LLM availability for safety-critical functions** — fallback
  policies must be deterministic and always available.
```

---

## Conclusion

### Summary

RoastPilot Agent v2 is **not a traditional agent system**. It is a **deterministic controller that consults an LLM advisor**.

This architectural choice is:
- ✅ **Safer** than LLM-driven agents for hardware control
- ✅ **More auditable** than prompt-based orchestration
- ✅ **More reliable** than systems that depend on LLM availability
- ✅ **More deterministic** than agentic frameworks (~85-90% vs ~30-50%)
- ✅ **Aligned with industrial control best practices**

### Key Insights

1. **The LLM is inside the harness, not driving it**
   - Controller owns the tick loop
   - LLM is called as a service
   - Safety validates all LLM outputs

2. **Determinism where it matters**
   - State machine: 100% deterministic
   - Safety policy: 100% deterministic
   - Hardware commands: 100% deterministic
   - Advisory suggestions: Non-deterministic but validated

3. **Graceful degradation**
   - LLM timeout → fallback policy
   - Network failure → local continuation
   - Process restart → operator recovery

4. **Industrial-grade safety**
   - Mirrors safety PLC architecture
   - Hard limits before soft optimization
   - Complete audit trail
   - Operator authority always preserved

### Final Verdict

**RoastPilot Agent v2 demonstrates how to safely integrate LLMs into hardware control systems.**

It sits at **~85-90% deterministic**, which is the appropriate level for:
- ✅ Safety-critical applications
- ✅ Hardware control
- ✅ Auditability requirements
- ✅ Operator trust
- ✅ Regulatory confidence

**This is exactly the right architecture for autonomous coffee roaster control.**

The plan correctly rejects the "LLM-driven agent" paradigm and instead implements a **deterministic harness with advisory AI** — a pattern that should be more widely adopted for hardware control applications.

---

## References

### Agent Frameworks Analyzed
- OpenAI Agents SDK / Swarm
- LangChain / LangGraph
- PydanticAI
- Temporal Workflows
- n8n (legacy prototype)

### Industrial Standards Referenced
- ICS/SCADA (Industrial Control Systems)
- IEC 62304 (Medical Device Software)
- ISO 26262 (Automotive Safety)

### RoastPilot Codebases
- `coffee-roaster-mcp` (hardware boundary)
- `coffee-first-crack-detection` (ML model)
- `coffee-roasting` (legacy prototype)
- `roastpilot-agent-orchestration-plan.md` (this plan)

### Hardware Documentation
- Hottop KN-8828B-2K+ Manual
- pyhottop library (reference implementation)
- K-type thermocouple specifications
