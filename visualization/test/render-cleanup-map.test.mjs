import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  checkArtifact,
  compileArchitecture,
  renderDocument,
  shortestDirectedPath,
  validateDocument,
} from '../render-cleanup-map.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(root, 'examples', name), 'utf8'));
}

test('Survey and Change fixtures satisfy the cleanup-map contract', () => {
  assert.deepEqual(validateDocument(fixture('survey.cleanup-map.json')), []);
  assert.deepEqual(validateDocument(fixture('change.cleanup-map.json')), []);
});

test('renderer creates a checked standalone artifact for both modes', () => {
  for (const name of ['survey.cleanup-map.json', 'change.cleanup-map.json']) {
    const document = fixture(name);
    const architecture = compileArchitecture(document);
    const html = renderDocument(document);
    assert.ok(checkArtifact(html).every(([, ok]) => ok), name);
    assert.equal(architecture.meta.visual_preset, 'signal-flow');
    assert.equal('animation' in architecture.meta, false);
    assert.equal(architecture.meta.locale, 'zh-CN');
    assert.equal(architecture.components.find((component) => component.id === 'legacyRouter').semantic_kind, 'candidate');
    assert.match(architecture.meta.subtitle, /清理分析|修改结果/);
    assert.equal('legend' in architecture.meta, false);
    assert.equal('views' in architecture.meta, false);
    assert.equal('cards' in architecture, false);
    assert.match(html, /data-preset="signal-flow"/);
    assert.match(html, /data-node-id="legacyRouter"[^>]*data-node-kind="candidate"/);
    assert.doesNotMatch(html, /<svg[^>]*data-animation="trace"/);
    for (const retiredSurface of [
      /Archify\.(guidedViews|semanticLens|guide|presentation|preset)/,
      /archify-guided-views-data|class="cards"/,
      /id="(?:guided-views|semantic-lens|diagram-guide|btn-present|btn-preset)"/,
      /viewer\.(?:guided|lens|guide|present|preset)\./,
      /data-format="webm"|MediaRecorder|data-legend/,
    ]) {
      assert.doesNotMatch(html, retiredSurface);
    }
    assert.match(html, /<html data-cleanup-artifact="true" /);
    assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  }
});

test('renderer handles two starts, a branch, and a cross-column edge on another row', () => {
  const document = {
    schema_version: 1,
    map_type: 'cleanup',
    meta: { title: 'Two start route branches', mode: 'survey', scope: 'focused', locale: 'en' },
    nodes: [
      { id: 'chooseStart', label: 'Choose start', role: 'entrypoint', column: 0 },
      { id: 'finderContext', label: 'Finder context', role: 'consumer', column: 0 },
      { id: 'reachableFrom', label: 'Reachable traversal', role: 'candidate', column: 1 },
      { id: 'hopDistancesFrom', label: 'Hop traversal', role: 'owner', column: 1 },
      { id: 'outgoingByNode', label: 'Outgoing index', role: 'owner', column: 2 },
      { id: 'edges', label: 'Route query', role: 'owner', column: 3 },
      { id: 'graphEdges', label: 'Snapshot edges', role: 'boundary', column: 4 },
    ],
    relationships: [
      { id: 'chooseReach', from: 'chooseStart', to: 'reachableFrom', label: 'read reachable nodes', kind: 'call', evidence: 'confirmed' },
      { id: 'reachOutgoing', from: 'reachableFrom', to: 'outgoingByNode', label: 'walk outgoing edges', kind: 'call', evidence: 'confirmed' },
      { id: 'chooseHops', from: 'chooseStart', to: 'hopDistancesFrom', label: 'reuse distance result', kind: 'call', evidence: 'confirmed' },
      { id: 'finderHops', from: 'finderContext', to: 'hopDistancesFrom', label: 'read hop distances', kind: 'call', evidence: 'confirmed' },
      { id: 'finderOutgoing', from: 'finderContext', to: 'outgoingByNode', label: 'filter start candidates', kind: 'call', evidence: 'confirmed' },
      { id: 'hopsOutgoing', from: 'hopDistancesFrom', to: 'outgoingByNode', label: 'walk outgoing edges', kind: 'call', evidence: 'confirmed' },
      { id: 'outgoingEdges', from: 'outgoingByNode', to: 'edges', label: 'read route edges', kind: 'call', evidence: 'confirmed' },
      { id: 'edgesGraph', from: 'edges', to: 'graphEdges', label: 'read snapshot', kind: 'call', evidence: 'confirmed' },
    ],
    findings: [{
      id: 'S1',
      title: 'Duplicate route traversal',
      disposition: 'ranked',
      confidence: 'high',
      risk: 'low',
      summary: 'A route lookup contains two starting contexts and a cross-row branch.',
      primary: 'reachableFrom',
      related: ['chooseStart', 'finderContext', 'reachableFrom', 'hopDistancesFrom', 'outgoingByNode', 'edges', 'graphEdges'],
      route: { from: 'chooseStart', to: 'graphEdges' },
      cut: { nodes: ['reachableFrom'], relationships: ['chooseReach', 'reachOutgoing'] },
      proof: 'The two contexts read the same outgoing index before querying the snapshot.',
    }],
  };
  const html = renderDocument(document);
  assert.ok(checkArtifact(html).every(([, ok]) => ok));
  const edgeIds = [...new Set([...html.matchAll(/data-edge-id="([^"]+)"/g)].map(([, id]) => id))].sort();
  assert.deepEqual(edgeIds, document.relationships.map(({ id }) => id).sort());
});

test('authored route uses the shortest confirmed directed path', () => {
  const route = shortestDirectedPath(fixture('survey.cleanup-map.json').relationships, 'entrypoint', 'publisher');
  assert.deepEqual(route.nodes, ['entrypoint', 'coordinator', 'legacyRouter', 'handler', 'publisher']);
  assert.equal(route.relationships.length, 4);
});

test('validator rejects guessed and dangling topology', () => {
  const document = fixture('survey.cleanup-map.json');
  document.relationships[0].evidence = 'suspected';
  document.findings[0].related.push('ghost');
  document.findings[0].invented_score = 0.99;
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /must equal "confirmed"/);
  assert.match(problems, /references unknown ID "ghost"/);
  assert.match(problems, /invented_score is not part of the cleanup-map contract/);
});

test('validator keeps visual report copy concise', () => {
  const document = fixture('survey.cleanup-map.json');
  document.findings[0].summary = '冗'.repeat(181);
  document.findings[0].unknowns = ['a', 'b', 'c', 'a'];
  document.relationships[0].label = '过'.repeat(29);
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /summary must contain at most 180 characters/);
  assert.match(problems, /unknowns must contain at most 3 decision-relevant items/);
  assert.match(problems, /unknowns duplicates "a"/);
  assert.match(problems, /label must contain at most 28 characters/);
});

test('validator accepts only portable evidence links', () => {
  const document = fixture('survey.cleanup-map.json');
  document.nodes[0].locus.href = 'java\nscript:globalThis.compromised = true';
  document.findings[0].report_url = 'data:text/html,unsafe';
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /locus\/href must not contain surrounding whitespace or control characters/);
  assert.match(problems, /report_url must be an HTTPS URL or a relative\/hash link/);
});

test('Change receipt describes one actual cut with coherent snapshots', () => {
  const document = fixture('change.cleanup-map.json');
  document.change.after.nodes.push('legacyRouter');
  document.change.after.relationships.push('legacyDelegate');
  document.change.after.nodes = document.change.after.nodes.filter((id) => id !== 'publisher');
  document.change.after.relationships = document.change.after.relationships.filter((id) => id !== 'requestDispatch');
  document.findings.push({ ...structuredClone(document.findings[0]), id: 'S2' });
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /cut\/nodes retains "legacyRouter" in \/change\/after/);
  assert.match(problems, /includes "resultPublish" without both endpoint nodes/);
  assert.match(problems, /cut\/nodes omits removed node "publisher"/);
  assert.match(problems, /cut\/relationships omits removed relationship "requestDispatch"/);
  assert.match(problems, /must contain exactly one changed Finding in Change mode/);
});

test('Change validation reports type-wrong cut lists without throwing', () => {
  const document = fixture('change.cleanup-map.json');
  document.findings[0].cut.nodes = 7;
  document.findings[0].cut.relationships = {};
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /cut\/nodes must be an array/);
  assert.match(problems, /cut\/relationships must be an array/);
});

test('Survey maps visualize ranked candidates with a concrete cut', () => {
  const document = fixture('survey.cleanup-map.json');
  document.findings[0].disposition = 'unresolved';
  delete document.findings[0].cut;
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /disposition must be ranked in Survey mode/);
  assert.match(problems, /cut must describe at least one retired node or relationship/);
});

test('cut and route stay inside the finding boundary', () => {
  const document = fixture('survey.cleanup-map.json');
  document.findings[0].related = ['entrypoint', 'coordinator', 'legacyRouter', 'publisher'];
  document.findings[0].cut.relationships = ['legacyDelegate'];
  const problems = validateDocument(document).join('\n');
  assert.match(problems, /related must include every node on the route/);
  assert.match(problems, /cut\/relationships must include "canonicalDelegate" incident to cut node "legacyRouter"/);

  document.findings[0].cut.relationships.push('canonicalDelegate');
  assert.match(validateDocument(document).join('\n'), /related must include both endpoints of cut relationship "canonicalDelegate"/);
});

test('embedded report text cannot terminate the JSON script', () => {
  const document = fixture('survey.cleanup-map.json');
  document.findings[0].summary = '</script><script>globalThis.compromised = true</script>';
  const html = renderDocument(document);
  assert.doesNotMatch(html, /<script>globalThis\.compromised/);
  assert.match(html, /\\u003c\/script\\u003e/);
});

test('embedded report data round-trips literal replacement tokens and markup', () => {
  for (const token of ['$$', "$'", '$`', '$&', '<script>"&\u2028\u2029</script>']) {
    const document = fixture('change.cleanup-map.json');
    document.meta.title = token;
    document.nodes[0].label = token;
    document.relationships[0].label = token;
    document.nodes[0].locus.path = `src/${token}.ts`;
    document.findings[0].title = token;
    document.findings[0].summary = token;
    document.findings[0].proof = `Literal ${token} must survive unchanged.`;
    document.change.verification = document.findings[0].proof;
    assert.deepEqual(validateDocument(document), []);
    const html = renderDocument(document);
    const embedded = html.match(/<script id="cleanup-map-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
    assert.deepEqual(JSON.parse(embedded), document);
    assert.ok(checkArtifact(html).every(([, ok]) => ok));
  }
});

test('artifact checks reject malformed or invalid embedded report data', () => {
  const html = renderDocument(fixture('change.cleanup-map.json'));
  const script = /(<script id="cleanup-map-data" type="application\/json">)[\s\S]*?(<\/script>)/;
  for (const invalid of ['{broken', '{}', 'null']) {
    const corrupted = html.replace(script, (_, open, close) => open + invalid + close);
    assert.ok(checkArtifact(corrupted).some(([, ok]) => !ok), invalid);
  }
  assert.ok(checkArtifact(html.replace(script, '')).some(([, ok]) => !ok));
  assert.ok(checkArtifact(html.replace(script, (match) => match + match)).some(([, ok]) => !ok));
});

test('rendered artifact can be written as one portable HTML file', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cleanup-map-'));
  const output = path.join(directory, 'artifact.html');
  fs.writeFileSync(output, renderDocument(fixture('survey.cleanup-map.json')));
  const size = fs.statSync(output).size;
  assert.ok(size > 100_000, `artifact unexpectedly small: ${size} bytes`);
  assert.ok(size < 500_000, `retired viewer surfaces returned: ${size} bytes`);
  fs.rmSync(directory, { recursive: true, force: true });
});
