---
name: code-janitor
description: Audit or change an existing codebase through either ordinary simplification or cleanup of AI-generated defensive and anti-regression layers. First route the request to one objective, then use evidence-backed deletion while preserving live behavior, safety boundaries, and compatibility. Use for 代码简化、熵回收或 AI 修改防回退层清理; do not use for general code review, onboarding, style-only refactoring, or performance tuning.
---

# Code Janitor

Reduce the number of concepts and obligations a codebase must keep coherent. This Skill has two independent objectives: ordinary simplification and AI defensive-layer cleanup. Line-count reduction is supporting evidence, not the objective. A successful run may conclude that the inspected surface is already justified.

## Select the objective, mode, and scope

First identify the objective. If the user has not made it clear, ask them to choose one before inspecting or modifying files:

1. **Ordinary simplification** — remove accidental complexity such as dead code, duplicate state, ownerless abstractions, redundant APIs or layers, obsolete compatibility paths, and over-engineering.
2. **AI defensive-layer cleanup** — remove maintenance-only tests, build/deployment/CI guards, static source scans and inventories, or explicitly selected runtime defensive paths that were added to protect an AI-generated change from regression.

Do not mix the objectives in one unreviewed cut. Both use the shared proof, boundary, authorization, and validation workflow below, but read only the references for the selected objective:

- For ordinary simplification, use [investigation](references/investigation.md), [boundaries and lifecycle](references/boundaries-and-lifecycle.md), [execution and recovery](references/execution-and-recovery.md), and other references as their routing rules require.
- For AI defensive-layer cleanup, after the user selects one or more defensive categories, read [defensive categories](references/defensive-categories.md) and, for Change mode, [defensive proof and delivery](references/defensive-proof-and-delivery.md).

If the user selects both objectives, maintain separate candidate records, cut boundaries, and validation results.

First choose the authority mode:

- **Survey** for simplification audit, investigation, or candidate-finding requests. Remain read-only and return ranked evidence.
- **Change** for explicit simplify, remove, consolidate, refactor, or repository-documentation edit requests. Prove each cut, implement it within the authorized scope, and validate the surviving contract.

Then choose the coverage scope:

- **Focused** when the user names a subsystem, symbol, state machine, dependency, or suspected duplication. Cover that boundary thoroughly before expanding outward.
- **Broad** when the request spans the repository or asks for multiple candidates. Partition the system and account for every in-scope domain.

Deleting a reachable capability, supported interface, stored representation, or compatibility path is a product decision. Describe the consequence and obtain direction unless the user has already chosen it.

## Establish the contract

1. Read the repository's instructions, architecture and decision records, manifests, test guidance, and generated-file conventions.
2. Inspect version-control state and preserve unrelated work. Identify vendored, generated, migration, fixture, and public-package surfaces before classifying them.
3. Trace the runtime path from entrypoints through configuration, registration, dispatch, persistence, processes, and wire boundaries. Record public, dynamic, persisted, generated, and compatibility-sensitive contracts.
4. In Change mode, discover the repository's real verification commands and capture a proportional baseline when feasible. A failing baseline narrows what the final checks can prove.

Preserve authorization, trust-boundary validation, security isolation, accessibility essentials, data-loss prevention, stored-format compatibility, and cleanup that establishes quiescence. Treat changes to these protections as their own explicitly authorized objective, not an incidental simplification.

The contract map is complete when all in-scope entrypoints and authority boundaries are enumerated, each is traced far enough to name its owner and observable contract, and every uninspected or externally unknowable surface is recorded as a blind spot.

## Cover the relevant surface

For every Broad engagement, and for Focused work involving dynamic architecture or dependency substitution, read [investigation.md](references/investigation.md). Build a coverage map before ranking findings; the first plausible deletion must not end the survey.

For concurrency, cancellation, readiness, cleanup, defensive copies, validation, authorization, security isolation, accessibility, data-loss prevention, or cross-process data, also read [boundaries-and-lifecycle.md](references/boundaries-and-lifecycle.md).

Use repository-native search, compiler and linter output, dependency metadata, and history as discovery instruments. Treat their findings as leads until runtime consumers and contracts have been examined.

## Build a proof record

For every in-scope lead that reaches consumer-map evidence or could retire a meaningful contract, record:

```text
Candidate: the exact contract, representation, or layer to remove or merge
Burden: the concepts, synchronization, publication, or testing cost it creates
Reachability: production, non-production, dynamic, external, and persisted consumers
Rationale: why it exists and whether that reason remains current
Cut: declarations, implementations, branches, artifacts, docs, and dependencies affected
Consequence: observable capability or compatibility behavior surrendered
Confidence / risk: evidence strength, uncertainty, blast radius, and reversibility
Proof: the smallest check that would expose an incorrect cut
Net effect: maintenance concepts removed minus replacement or migration machinery added
```

Prove cut boundaries below file granularity when the candidate shares an artifact with surviving consumers. Account for candidate-exclusive selectors, members, fields, keys, registry entries, generated fragments, and fixtures without disturbing the surviving owners.

Keep or downgrade the candidate when a real consumer exists, dynamic reachability remains unresolved, a current decision still owns the design, the change merely relocates complexity, the result is outside scope or retires no meaningful obligation, or the available check cannot distinguish success from accidental breakage.

Rank confidence separately from benefit. A high-value guess does not outrank a smaller proved cut.

Candidate proof is complete when every qualifying lead is classified as ranked, rejected, or unresolved, and every unresolved lead names the fact required to decide it.

## Decide and act

In Survey mode, stop after reporting the ranked evidence. Include important rejected candidates when the rejection teaches something or identifies a concrete missing fact.

In Change mode, read [execution-and-recovery.md](references/execution-and-recovery.md) and select the strongest authorized cut. One ownership boundary is the default batch size, not a run limit: for an explicitly requested set of cuts, finish and validate each boundary before starting the next.

For AI defensive-layer cleanup, a selected category authorizes investigation, not deletion of a live contract. Do not remove security, credential, validation, persistence, lifecycle, or real deployment behavior merely because it is defensive.

If the user requests a simplification proposal, local cleanup annotation, or design-record consolidation, or if a selected change invalidates an ADR, RFC, design note, or architectural inventory, read [decision-records.md](references/decision-records.md). Do not turn an ordinary code audit into a repository-wide documentation purge.

If the user asks to combine findings from another branch, pull request, task, or agent run, read [integrating-findings.md](references/integrating-findings.md). Preserve evidence, not finding counts.

## Deliver the result

For a survey, report coverage, ranked proof records, rejected or unresolved high-value leads, and the next fact needed for each uncertainty.

For a change, complete the validation and operation receipt defined in [execution-and-recovery.md](references/execution-and-recovery.md). Report each validation layer separately; a narrow green check does not establish broader runtime, deployment, or user acceptance.

For AI defensive-layer cleanup, if the user authorizes a Handoff note, enumerate every deleted file and every materially deleted symbol or section in a retained file. For each entry state its original role, defensive obligation, consumer evidence, reason it was safe to remove, retained behavior, reintroduction trigger, and verification. Follow [defensive proof and delivery](references/defensive-proof-and-delivery.md).
