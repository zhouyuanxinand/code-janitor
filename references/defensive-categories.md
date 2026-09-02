# AI Defensive-Layer Categories

Read this reference only after the user selects the AI defensive-layer cleanup objective. A category identifies where to investigate; it never proves that removal is safe.

## 1. Test guardrails

Look for tests that assert directory trees, import bans, fixed file inventories, historical migration names, exact agent/component counts, implementation-private defaults, or literal source text. Prefer removing a test only when it has no distinct user-visible, API, persistence, or operational behavior to protect.

Keep tests for business outcomes, public APIs, error handling, security, persistence, concurrency, deployment acceptance, and integration behavior even when they use mocks.

## 2. Build, deployment, and CI guardrails

Look for duplicate builders, abandoned conversion paths, temporary packaging adapters, dead image-export helpers, and CI jobs that only enforce a retired implementation. Trace every script from documented commands, manifests, containers, CI configuration, release instructions, and external deployment entrypoints.

Do not remove credential filtering, image/runtime startup behavior, health checks, reproducible artifact requirements, or active release commands without an explicit operational decision.

## 3. Static-check guardrails

Look for source scanners, regex allowlists/denylists, layout checks, generated manifest comparisons, dependency bans, and documentation inventories created solely as AI-change tripwires. Determine whether the same requirement is already covered by a meaningful behavior check or a current CI policy.

Keep security scanning, license/compliance checks, accessibility requirements, and gates owned by an active engineering policy.

## 4. Compatibility and relay layers

Look for one-line re-exports, deprecated module paths, old environment keys, former file locations, old response envelopes, UI state migration, and adapters with no current consumer. Check external callers, persisted data, deployment environment variables, release notes, and historical inputs before deletion.

Removing a reachable public or persisted compatibility path is a product decision. Stop and request direction if its support window is unknown.

## 5. Runtime defensive paths

Look for fallback providers, retries, error normalization, output repair, mock-only bootstrapping, rollback routes, and recovery branches. First name the user-visible failure mode and the boundary protected. Many of these are live business reliability requirements, not AI-edit protection.

Only remove a runtime defensive path when evidence shows it protects no real boundary and the user has authorized surrendering the behavior. Never fold security, authorization, secret handling, validation, data-integrity, or durable-data recovery into a routine cleanup batch.
