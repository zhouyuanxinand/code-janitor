# Defensive Cleanup Proof and Delivery

## Candidate record

For each deletion candidate, record:

```text
Candidate: exact test, script, layer, symbol, or path
Category: selected cleanup category
Purpose: defensive/anti-regression behavior it was intended to enforce
Consumers: runtime, support-only, dynamic/external, persisted, unknown
Cut boundary: code, tests, configuration, docs, and build entries to change
Consequence: observable behavior or compatibility no longer offered
Confidence and risk: evidence strength, blast radius, reversibility
Verification: smallest decisive check plus affected local gates
```

Do not treat an unreferenced file as proven dead until dynamic imports, package exports, scripts, environment keys, persisted formats, and external consumers are accounted for.

## Change sequence

1. Capture the relevant baseline and known failures when feasible.
2. Complete one ownership boundary at a time.
3. Search for removed symbols, paths, configuration keys, and documentation residue.
4. Run the targeted behavior check, then affected build/type/lint/test/smoke checks.
5. Inspect the diff and working-tree status. Do not stage generated runtime data or unrelated user changes.
6. If a Handoff note is authorized, use an itemized deletion ledger. Do not collapse multiple files into a category summary.

## Handoff deletion ledger

The Handoff note must contain one entry for every deleted file and every materially deleted symbol or section in a retained file. A table is preferred:

```text
Deleted path or retained file + removed symbol/section: exact repository-relative path and name
Original role: what the file, symbol, or section did before cleanup
Category: selected cleanup category
Defensive obligation: the AI-change rollback/anti-regression/static obligation it enforced
Consumer evidence: runtime/support/dynamic/persisted/external search and boundary findings
Why safe to remove: why it is not a live business, API, security, persistence, lifecycle, or deployment contract
Retained behavior: active code, test, build path, or safety boundary that remains
Reintroduction trigger: the concrete future requirement that would justify restoring it
Verification: targeted check and affected local gates, including baseline failures if relevant
```

For a deleted file, explain its original responsibility even if it had no runtime consumer. For a partially edited file, identify the removed implementation-shape guard separately from the file's retained business/API responsibility. Include generated runtime data and unrelated working-tree changes in a separate exclusion note; they are not deletion entries.

## Stop conditions

Stop and report rather than delete when a candidate has unresolved dynamic/external consumers, supports stored data or a public contract, is tied to security or data safety, has a failing baseline that masks the result, or needs a product decision about backwards compatibility.
