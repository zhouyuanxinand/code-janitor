# Proof and Delivery

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
6. If a handoff note is authorized, state the retired guard, why it was safe to remove, reintroduction conditions, and validation evidence.

## Stop conditions

Stop and report rather than delete when a candidate has unresolved dynamic/external consumers, supports stored data or a public contract, is tied to security or data safety, has a failing baseline that masks the result, or needs a product decision about backwards compatibility.
