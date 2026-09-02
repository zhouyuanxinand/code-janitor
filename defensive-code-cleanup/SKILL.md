---
name: defensive-code-cleanup
description: Audit or remove AI-generated defensive, anti-regression, and rollback-oriented code after the user selects a category. Use for unnecessary implementation-shape tests, build or CI guards, static source scans, legacy relay layers, or explicitly selected runtime defensive paths. Do not use for general code cleanup, ordinary bug fixes, or security hardening.
---

# Defensive Code Cleanup

Use this skill to retire defensive code added to protect an AI-generated change from later edits. The objective is to remove maintenance-only obligations while preserving live business behavior, real operational requirements, and safety boundaries. This skill is independent of `simplify-codebase`; do not invoke, edit, or depend on that skill.

## Choose the category first

When the user has not explicitly selected a category in the current request, pause before inspecting or modifying code and ask them to choose one or more of:

1. **Test guardrails** — source scans, project-layout contracts, fixed implementation-shape assertions, migration/deployment contracts, and tests that only protect a previous implementation.
2. **Build, deployment, and CI guardrails** — one-off conversion tools, duplicate build paths, generated packaging checks, or CI-only gates.
3. **Static-check guardrails** — scripts, allowlists, deny lists, file inventories, lint/type/test wiring, and documentation checks that exist only to block an AI change from being reverted.
4. **Compatibility and relay layers** — re-export modules, former configuration names or paths, response-envelope adapters, legacy UI state, and obsolete migration shims.
5. **Runtime defensive paths** — retries, fallbacks, repair/normalization, mock-only bootstrapping, or error recovery. Treat this as high risk: identify the user-visible behavior first and do not remove it merely because it is defensive.
6. **Custom scope** — the user names files, symbols, or another category.

The user may select multiple categories. If they request a read-only review, use Survey mode. If they explicitly ask to remove or simplify selected code, use Change mode. A selected category authorizes investigation, not deletion of a live contract.

Read [category guide](references/categories.md) for the chosen categories. In Change mode, also read [proof and delivery](references/proof-and-delivery.md).

## Investigation rules

1. Inspect repository instructions, version-control state, entrypoints, build manifests, test commands, and deployment configuration within the selected scope.
2. Classify each candidate's consumers as runtime, support-only, dynamic/external, persisted, or unknown. Search symbols, paths, environment keys, serialized fields, command names, and documentation references; static zero-use is only a lead.
3. For every candidate, record its defensive purpose, retained behavior, complete cut boundary, external or persisted compatibility consequence, confidence, and the smallest check that would expose a wrong deletion.
4. Keep tests that validate business output, API contracts, security, data loss prevention, concurrency/lifecycle correctness, or a real deployment requirement. A test is not removable merely because it is strict or uses mocks.
5. Do not remove authorization, credential handling, secret redaction, input validation, data integrity, access isolation, or recovery for durable data as part of this skill. Report these as retained unless the user separately authorizes that objective.

## Apply changes only when authorized

Prefer one proven ownership boundary per batch. Remove the complete obligation: production code, dedicated tests, imports, build entries, documentation, and configuration that exist only for it. Preserve unrelated changes and do not commit, push, deploy, or delete runtime data unless separately authorized.

If removal retires a test/build/static guard but future reintroduction may be useful, create or update a concise handoff note only when the user authorizes documentation changes. Record what was removed, why it was not a live contract, the replacement or reintroduction trigger, and the validation performed.

When a handoff note is created, it must enumerate the exact deleted files and deleted symbols/sections rather than summarizing them only by category. For every entry, state the file's original role, the defensive obligation it enforced, the consumer/boundary evidence that made removal safe, what behavior or operational path remains, and the condition that would justify reintroducing it. For a partially edited file, record the file path plus the removed symbol or section and describe the file-level responsibility that remains. Use the handoff format in [proof and delivery](references/proof-and-delivery.md).

## Verify and report

After a change, check removed-name residue, run the decisive targeted check, then the affected build/type/test/smoke checks in proportion to risk. Compare failures with the baseline and distinguish pre-existing failures from regressions. Inspect the final diff and report retained candidates and unknown external consumers.

For Survey mode, report only ranked candidates, evidence, rejected candidates, and the exact fact needed to decide uncertain items.
