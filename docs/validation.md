# Validation / 验证记录

本文档记录统一 `code-janitor` Skill 在首次开源和 AI 防回退模式重构时完成的行为验证。它不是永久质量声明；仓库和 Agent 运行时变化后，应重新验证相关结论。

This document records the behavioral validation completed before the initial open-source release and during the AI defensive-layer mode refactor. It is not a permanent quality claim; relevant results should be rechecked as repositories and Agent runtimes evolve.

## Scenarios / 场景

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

### AI defensive-layer cleanup

- Fixture: a Python + TypeScript service containing implementation-shape tests, source-isolation scans, deployment contracts, a duplicate image conversion path, and active API/build behavior.
- Expected behavior: remove only selected test, build/CI, and static-check guardrails; retain business APIs, input validation, credential handling, runtime lifecycle, and real frontend/backend verification.
- Result: seven retained boundary/API tests passed; frontend tests (`143/143`), frontend build, and six API smoke checks passed. The backend comparison changed from `365 passed, 30 failed` to `341 passed, 25 failed` after removing 29 guardrail cases; the remaining failures matched the known baseline categories.

## Mechanical checks / 机械检查

- Skill structure and frontmatter validation;
- YAML metadata validation;
- internal Markdown link validation;
- Markdown lint with line-length enforcement disabled for prose and long commands;
- upstream-name and attribution scan;
- clean-worktree checks for read-only scenarios.

## Known limits / 已知边界

- These tests establish behavior for the exercised scenarios, not every language, build system, or Agent runtime.
- Dynamic consumers outside the inspected repository can remain unknowable without external evidence.
- Deployment, production health, and end-user acceptance remain separate gates from repository tests.
- A user must still authorize product or compatibility changes.
