# Cleanup Examples

Use these examples within the current Survey/Change mode and Focused/Broad scope. Investigate the relevant surfaces directly; a separate objective or category selection is unnecessary. Each example is a discovery lead that still needs the shared consumer map, contract proof, and validation.

## 1. Test guardrails

Look for tests that assert directory trees, import bans, fixed file inventories, historical migration names, exact agent/component counts, implementation-private defaults, or literal source text. A removal candidate owns only an obsolete implementation shape, with no distinct user-visible, API, persistence, operational, or active engineering-policy contract.

Keep tests for business outcomes, public APIs, error handling, security, persistence, concurrency, deployment acceptance, and integration behavior even when they use mocks.

## 2. Build, deployment, and CI guardrails

Look for duplicate builders, abandoned conversion paths, temporary packaging adapters, dead image-export helpers, and CI jobs that only enforce a retired implementation. Trace every script from documented commands, manifests, containers, CI configuration, release instructions, and external deployment entrypoints.

Retain credential filtering, image/runtime startup behavior, health checks, reproducible artifact requirements, and active release commands unless an explicit operational decision retires their contract.

## 3. Static-check guardrails

Look for source scanners, regex allowlists/denylists, layout checks, generated manifest comparisons, dependency bans, and documentation inventories that only enforce an obsolete implementation shape. Determine whether a meaningful behavior check or a current CI policy still owns the requirement.

Keep security scanning, license/compliance checks, accessibility requirements, and gates owned by an active engineering policy.

## 4. Compatibility and relay layers

Look for one-line re-exports, deprecated module paths, old environment keys, former file locations, old response envelopes, UI state migration, and adapters with no current consumer. Check external callers, persisted data, deployment environment variables, release notes, and historical inputs before deletion.

Removing a reachable public or persisted compatibility path is a product decision. Keep the candidate unresolved until its support window and the user's authority to retire it are established.

## 5. Runtime defensive paths

Look for fallback providers, retries, error normalization, output repair, mock-only bootstrapping, rollback routes, and recovery branches. First name the user-visible failure mode and the boundary protected. These paths often own live reliability requirements.

Remove a runtime defensive path only when evidence shows it protects no real boundary and any behavior being surrendered is explicitly authorized. Security, authorization, secret handling, validation, data integrity, and durable-data recovery remain protected by the shared boundary and lifecycle rules.
