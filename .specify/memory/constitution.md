<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Bump type: MAJOR (Principle I redefined; Agent Communication Standards materially revised;
           Quality Gate 2 updated — backward-incompatible governance change)

Modified principles:
  - I. Agent-First Architecture → I. Agent Autonomy & Full Capability (redefined)

Added sections: none

Removed sections: none (Agent Communication Standards retained but scope narrowed
  from prescriptive contracts to lightweight collaboration guidelines)

Templates checked:
  - .specify/templates/plan-template.md       ✅ compatible (Constitution Check section
      no longer needs to gate on strict contract schemas)
  - .specify/templates/spec-template.md       ✅ compatible (no change required)
  - .specify/templates/tasks-template.md      ✅ compatible (no change required)
  - .specify/templates/agent-file-template.md ✅ compatible (no change required)
  - .specify/templates/checklist-template.md  ✅ compatible (no change required)

Deferred TODOs: none
-->

# Agent Team Book Sorter Constitution

## Core Principles

### I. Agent Autonomy & Full Capability

The Claude agent team MUST be granted unrestricted access to its full reasoning,
tool-use, sub-agent delegation, and context-sharing capabilities. No implementation
constraint, task decomposition pattern, or architectural rule SHOULD prevent an
agent from choosing the approach it determines is best suited to the current problem.
Agents are trusted, autonomous collaborators — not rigid pipeline components with
fixed roles.

Where structure is helpful (e.g., a named lead agent, a specific tool list), it
SHOULD be introduced as lightweight guidance in a feature spec, not as a permanent
architectural constraint enforced at the constitutional level.

**Rationale**: Pre-imposing architectural boundaries on agent interactions suppresses
emergent problem-solving strategies that the model can discover on its own. Enabling
full autonomy produces better, more adaptive outcomes than forcing agents into
pre-defined roles or communication contracts.

### II. Data Integrity

Book records and their derived metadata MUST be accurate and consistent at the point
they leave the agent team. Corrupted, ambiguous, or unresolvable input MUST be
surfaced to the operator with an explanation rather than silently discarded or
fabricated.

**Rationale**: Downstream consumers depend on trustworthy output. Explicit failure
signals are easier to diagnose and recover from than silent data loss or hallucinated
values.

### III. Test-First (NON-NEGOTIABLE)

Tests MUST be written and confirmed to fail before any implementation code is added.
The Red-Green-Refactor cycle is mandatory. Where agent behavior is being tested,
acceptance scenarios from the feature spec serve as the test definition.

**Rationale**: Agent-driven pipelines are difficult to debug retroactively. Upfront
coverage provides a safety net for refactoring and model upgrades.

### IV. Observability

Every significant agent decision (e.g., classification result, routing choice,
failure handling) MUST be logged in a structured, human-readable format. Log entries
MUST include: timestamp (ISO-8601), agent or step name, input summary, and outcome.
Unobservable behavior is not acceptable in production.

**Rationale**: Multi-agent pipelines are opaque by default. Structured output at
decision points enables root-cause analysis without needing to re-run or reproduce
failures.

### V. Simplicity

The simplest approach that satisfies the current requirement MUST be preferred.
New agents, tools, or abstractions MUST NOT be introduced for speculative future
needs. Unjustified complexity MUST be flagged in the plan's Complexity Tracking table.

**Rationale**: YAGNI discipline keeps the system comprehensible and maintainable
as the feature set grows.

## Agent Collaboration Guidelines

These are enabling guidelines, not hard constraints. The agent team is free to
deviate where the task warrants it.

- **Shared context**: Agents SHOULD pass sufficient context so that any agent in
  the team can understand the current state of a task without needing to re-derive
  it from scratch.
- **Tool documentation**: Tools exposed to the agent team MUST have clear, accurate
  descriptions so agents can self-select the right tool without guesswork.
- **Failure surfacing**: When an agent cannot complete a sub-task, it MUST communicate
  the blocker explicitly rather than returning a partial or fabricated result.
- **Transport flexibility**: Agents may communicate via in-process calls, message
  queues, or HTTP. The choice SHOULD be documented in the relevant `plan.md`.

## Quality Gates

The following gates MUST pass before any feature branch may be merged:

1. All tests (unit and integration / acceptance) are green.
2. Agent output is observable: new decision points emit structured log entries.
3. All new tools exposed to the agent team have accurate, tested descriptions.
4. Complexity Tracking table in `plan.md` is filled for any constitution exception.
5. No unresolved `NEEDS CLARIFICATION` markers remain in `spec.md`.

## Governance

This constitution supersedes all other development practices and informal agreements.
Amendments require:

1. A written proposal describing the change, motivation, and migration plan.
2. Approval by the project lead before the change is applied.
3. Version increment per semantic versioning policy (see below).
4. Update of all dependent templates and guidance files within the same commit.

**Versioning policy**:
- MAJOR: backward-incompatible governance changes, principle removals or redefinitions.
- MINOR: new principle or section added, or material guidance expansion.
- PATCH: clarifications, wording fixes, non-semantic refinements.

All PRs and code reviews MUST verify compliance with this constitution. Any violation
that cannot be resolved within the PR MUST be documented in the Complexity Tracking
table with a justification and a remediation timeline.

**Version**: 2.0.0 | **Ratified**: 2026-03-07 | **Last Amended**: 2026-03-07
