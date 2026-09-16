# Validation / 验证记录

本文档保留 `simplify-codebase` 上游的历史验证，并单独记录集成到 `code-janitor` 后的检查。历史场景不代表本版本重新执行过相同的 Agent 决策过程；仓库和 Agent 运行时变化后，应重新验证相关结论。

This document preserves historical upstream validation separately from checks for the Code Janitor integration. Historical scenarios are not a rerun of this version's agent decisions; relevant results should be rechecked as repositories and agent runtimes evolve.

## Inherited scenarios / 继承的历史场景

### Change

- Fixture: a small JavaScript stateful component with duplicated lifecycle state.
- Expected behavior: remove only the redundant representation while preserving dynamic and persisted behavior.
- Result: one source file changed; all 3 tests passed; no unrelated files changed.

### Broad

- Fixture: a clean 973-file production repository containing Python and TypeScript/TSX.
- Expected behavior: partition the repository, investigate beyond obvious unused symbols, and record retained and unresolved surfaces.
- Result: the audit covered the main runtime and repository domains, found frontend and backend candidates, retained live compatibility and lifecycle boundaries, and left the worktree clean.

### Integration and decision records

- Fixture: findings imported from another branch, including one valid cleanup, one unsafe compatibility removal, and one historical design record.
- Expected behavior: revalidate every finding instead of copying conclusions; preserve immutable decision history.
- Result: all 3 findings were mapped to a disposition; the compatibility decoder was retained; the historical ADR body stayed unchanged; both tests passed.

### Shared-artifact boundary

- Fixture: a retired frontend surface sharing a stylesheet with a surviving component.
- Expected behavior: prove the cut below file granularity.
- Result: the focused audit found 14 candidate-exclusive CSS classes, identified removable members inside mixed selectors, retained the shared stylesheet and surviving component, and found two stale documentation references.

### Implementation-shape guardrail

- Auditable evidence: the [checked-in fixture, exact prompts and commands, patches, results, and itemized receipts](./fixtures/implementation-shape-guardrail/README.md).
- Closed-world premise: the disposable fixture is not published, imported, or wired into CI/deployment; a repository-wide search found no guard or command references outside the fixture and evidence artifacts, so the Change examples have no in-scope external consumers.
- Fixture: a small dependency-free Node.js package with pricing and authorization behavior, an unexported dead helper, a deployment check, and a test plus script that asserted an exact source filename and function spelling.
- Ambiguous request: an independent Skill run was told only that defensive or AI-generated guardrails might exist. It selected Survey mode, made no edits, ranked the implementation-shape guard separately from the dead helper, and retained the quantity validation, authorization boundary, business tests, and deployment check.
- Focused change: under that closed-world premise, an explicitly authorized run removed only `tests/layout.guard.test.js`, `scripts/check-layout.js`, and the `check:layout` package entry. The baseline passed 4 tests plus the layout and deployment checks; afterward all 3 surviving behavior tests and the deployment check passed. The operation receipt named every deleted artifact, its original check, the removal evidence, surviving behavior, reintroduction condition, verification, and undo path.
- Mixed objectives: under that closed-world premise, an explicitly authorized run handled the shape guard and dead helper as separate proof records and cut boundaries. It removed 22 lines across 4 files with no replacement machinery, found no residue, passed syntax and diff checks, passed all 3 surviving behavior tests, and preserved the deployment check. The final receipt kept both cuts separate.

### Cleanup Map renderer

- Fixture: one Survey and one Change cleanup-map document covering a confirmed dispatch path and an adapter cut.
- Expected behavior: reject guessed or dangling topology, unsafe links, and inconsistent Change snapshots; keep Finding IDs stable; trace only confirmed directed relationships; render distinct Survey and Change stages; progressively disclose stage-specific information without duplicate cards; keep first-paint and post-probe page geometry stable; and produce a portable standalone HTML artifact.
- Result: all 15 dependency-free renderer tests passed on Node.js 18, and the full 30-test schema and Chromium behavior suite passed on Node.js 22. Both fixtures passed the cleanup-map contract validator, and the Draft 2020-12 schema agreed with the runtime validator across the exercised valid and invalid cases. Both delivered artifacts passed all 7 structural checks. The suite also rejects overlong or duplicate unknowns, control-character URL obfuscation, unsafe URL schemes, incomplete or type-wrong cuts, route/cut semantics outside a Finding, retained cuts, dangling snapshot edges, and multi-Finding Change receipts. The vendored Archify clean-flow gate accepted node spacing, relationship-label placement, and the Change bypass route. Browser review passed at 1280×800 and 1440×900 in light and dark themes with no page-level overflow or console warnings/errors; repeated first-load, stage, evidence, focus, zoom, and rapid-switch sampling kept `scrollY`, document height, and the panel/workspace coordinates stable. Cut snapshot isolation, deep links, role labels, shortcut isolation, truth-boundary visibility, and small-text contrast were also checked directly.

## Code Janitor integration / Code Janitor 集成

The integration uses upstream PR #3 at `728b1d47eec764792ae64bf20d60ad81edc23762` with the five cleanup surfaces from Code Janitor `4eae68a40bca1021eb43accc316a4ca0354bdd1a`. They are now examples within the shared proof workflow. The public name, default prompt, and installation examples use `code-janitor`.

Checks on 2026-09-16 used Windows PowerShell, Node.js 22.23.2, and npm 10.9.8:

| Check | Result |
| --- | --- |
| `npm.cmd --prefix visualization test` | 30/30 renderer, schema, and Chromium tests passed. |
| `npm.cmd --prefix docs/fixtures/implementation-shape-guardrail/baseline test` | Baseline 4/4 passed. |
| Baseline `check:layout` and `deploy:check` package commands | Both passed. |
| [Focused and mixed patch commands](./fixtures/implementation-shape-guardrail/README.md#exact-command-evidence) | Each retained 3/3 behavior tests and passed deployment, syntax, residue, and diff checks; reverse application restored the baseline. |
| `npx.cmd --yes markdownlint-cli@0.45.0 "**/*.md" --ignore "visualization/node_modules/**"` | Passed. |
| Skill Creator `quick_validate.py`, plus YAML metadata validation | Passed; the skill name, default prompt, and implicit-invocation policy agree. |
| Local Markdown resource checks | All 45 links resolved inside the package. |

The repository has no root `package.json` or root `check`, `build`, or `test` scripts. Validation uses the existing visualization and fixture commands above. These checks reproduce fixture outcomes and validate packaging; they do not establish independent agent decisions across all five cleanup surfaces.

## Mechanical checks / 机械检查

- Skill structure and frontmatter validation;
- YAML metadata validation;
- internal Markdown link validation;
- Markdown lint with line-length enforcement disabled for prose and long commands;
- upstream-name and attribution scan;
- clean-worktree checks for read-only scenarios;
- cleanup-map schema-parity, referential-integrity, Change-snapshot, link-scheme, shortest-path, script-injection, and offline portable-artifact tests;
- standalone artifact checks for the Archify runtime, one semantic SVG, cleanup workbench, passport, route probe, and truth boundary;

## Known limits / 已知边界

- These tests establish behavior for the exercised scenarios, not every language, build system, or Agent runtime.
- Dynamic consumers outside the inspected repository can remain unknowable without external evidence.
- Deployment, production health, and end-user acceptance remain separate gates from repository tests.
- A user must still authorize product or compatibility changes.
- The bundled Cleanup Map is desktop-only. It is intentionally bounded to five visualized Findings, 18 nodes, and 32 confirmed relationships per artifact.
- The renderer's structural checks do not replace visual review, repository evidence, runtime verification, or the canonical text proof records.
- Cleanup Map vendors Archify's Architecture renderer and desktop viewer core. Other diagram renderers, the generic repository CLI, publishing, gallery, and multi-diagram validator are outside this distribution.
- The inherited viewer has a known route-probe limitation for node IDs such as `constructor`, which collide with object-prototype members in its adjacency index. The current fixture suite does not cover that case.
- On Windows with Node.js 20.15.0, the inherited `npm test` glob does not expand. The full suite can be run with explicit test-file paths; the integration command above passed on Node.js 22.23.2.
