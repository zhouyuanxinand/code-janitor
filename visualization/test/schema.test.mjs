import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import Ajv2020 from 'ajv/dist/2020.js';
import { validateDocument } from '../render-cleanup-map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(fs.readFileSync(path.join(root, 'cleanup-map.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
const validateSchema = ajv.compile(schema);

function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'examples', name), 'utf8'));
}

function assertContracts(data, expected, name) {
  const schemaValid = validateSchema(data);
  const details = validateSchema.errors ? `: ${ajv.errorsText(validateSchema.errors)}` : '';
  assert.equal(schemaValid, expected, `${name} schema${details}`);
  assert.equal(validateDocument(data).length === 0, expected, `${name} runtime validator`);
}

test('Draft 2020-12 schema accepts the valid Survey and Change fixtures', () => {
  assertContracts(fixture('survey.cleanup-map.json'), true, 'Survey fixture');
  assertContracts(fixture('change.cleanup-map.json'), true, 'Change fixture');
});

test('Draft 2020-12 schema rejects change data in Survey mode', () => {
  const survey = fixture('survey.cleanup-map.json');
  survey.change = structuredClone(fixture('change.cleanup-map.json').change);
  assertContracts(survey, false, 'Survey with change');
});

test('Draft 2020-12 schema requires a non-empty cut member', () => {
  const survey = fixture('survey.cleanup-map.json');
  const emptyCuts = [
    ['empty object', {}],
    ['empty nodes', { nodes: [] }],
    ['empty relationships', { relationships: [] }],
    ['both arrays empty', { nodes: [], relationships: [] }],
  ];
  for (const [name, cut] of emptyCuts) {
    const data = structuredClone(survey);
    data.findings[0].cut = cut;
    assertContracts(data, false, name);
  }
});

test('Draft 2020-12 schema accepts a relationship-only cut', () => {
  const survey = fixture('survey.cleanup-map.json');
  survey.findings[0].cut = { relationships: ['legacyDelegate'] };
  assertContracts(survey, true, 'relationship-only cut');
});

test('Draft 2020-12 schema preserves one-sided and empty-side cut arrays', () => {
  const base = fixture('survey.cleanup-map.json');
  const withIsolatedNode = () => {
    const data = structuredClone(base);
    data.nodes.push({ id: 'isolated', label: '独立节点', role: 'store' });
    data.findings[0].related.push('isolated');
    return data;
  };
  const cases = [
    ['nodes-only cut', withIsolatedNode(), { nodes: ['isolated'] }],
    ['non-empty nodes with empty relationships', withIsolatedNode(), { nodes: ['isolated'], relationships: [] }],
    ['empty nodes with non-empty relationships', structuredClone(base), { nodes: [], relationships: ['legacyDelegate'] }],
  ];
  for (const [name, data, cut] of cases) {
    data.findings[0].cut = cut;
    assertContracts(data, true, name);
  }
});
