import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { chromium } from 'playwright';
import { renderDocument } from '../render-cleanup-map.mjs';

let browser;
let server;
let baseUrl;
let page;
let errors;
const literalLabel = "$$ $' $` $& <&> 中";
const literalProof = `${literalLabel} </script><script>globalThis.compromised = true</script>\u2028\u2029`;

function fixture(mode) {
  return JSON.parse(readFileSync(new URL(`../examples/${mode}.cleanup-map.json`, import.meta.url)));
}

before(async () => {
  const reports = new Map(['change', 'survey'].map((mode) => {
    const document = fixture(mode);
    if (mode === 'survey') {
      document.findings.push({ ...structuredClone(document.findings[0]), id: 'S2', title: '第二个清理候选' });
    }
    return [`/${mode}`, renderDocument(document)];
  }));
  const expanded = fixture('change');
  expanded.nodes.push({ id: 'resultCache', label: '结果缓存', role: 'store', column: 5 });
  expanded.relationships.push({ id: 'cacheResult', from: 'publisher', to: 'resultCache', label: '保存结果', kind: 'data', evidence: 'confirmed' });
  expanded.findings[0].related.push('resultCache');
  expanded.change.after.nodes.push('resultCache');
  expanded.change.after.relationships.push('cacheResult');
  reports.set('/expanded-change', renderDocument(expanded));

  const branched = fixture('change');
  branched.nodes.push({ id: 'finderContext', label: '目标搜索上下文', role: 'consumer', column: 0 });
  branched.findings[0].related.push('finderContext');
  branched.change.before.nodes.push('finderContext');
  branched.change.after.nodes.push('finderContext');
  reports.set('/branched-change', renderDocument(branched));

  const literal = fixture('change');
  literal.meta.title = literalLabel;
  literal.nodes[0].label = literalLabel;
  literal.nodes[0].locus.path = `src/${literalLabel}.ts`;
  literal.relationships[0].label = literalLabel;
  literal.findings[0].title = literalLabel;
  literal.findings[0].summary = literalProof;
  literal.findings[0].proof = literalProof;
  literal.change.verification = literalProof;
  reports.set('/literal', renderDocument(literal));
  server = createServer((request, response) => {
    const html = reports.get(request.url);
    response.writeHead(html ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(html || 'Not found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

beforeEach(async () => {
  page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(5000);
  errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
});

afterEach(async () => {
  await page?.close();
  assert.deepEqual(errors, []);
});

async function open(mode, hash = '') {
  await page.goto('about:blank');
  await page.goto(`${baseUrl}/${mode}${hash}`);
  await page.locator('#cleanup-stage-controls').waitFor();
}

function node(id) {
  return page.locator(`.diagram-container > svg [data-node-id="${id}"]`);
}

test('initial layout keeps a multi-row canvas and its controls stable', async () => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    window.initialLayoutSamples = [];
    addEventListener('DOMContentLoaded', () => {
      const canvas = document.querySelector('.diagram-container');
      const controls = document.querySelector('.diagram-nav');
      if (!canvas || !controls) return;
      function sample() {
        const graph = canvas.getBoundingClientRect();
        const nav = controls.getBoundingClientRect();
        initialLayoutSamples.push([graph.x, graph.y, graph.width, graph.height, nav.x, nav.y]);
        if (initialLayoutSamples.length < 12) requestAnimationFrame(sample);
      }
      sample();
    });
  });
  await open('branched-change');
  await page.waitForFunction(() => window.initialLayoutSamples.length === 12);
  const samples = await page.evaluate(() => window.initialLayoutSamples);
  for (const [index, metric] of ['canvas x', 'canvas y', 'canvas width', 'canvas height', 'controls x', 'controls y'].entries()) {
    const values = samples.map(sample => sample[index]);
    assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${metric} changed during initial layout: ${values.join(', ')}`);
  }
});

test('Change stages isolate routes, passport relationships and reachability', async () => {
  await open('change');
  for (const stage of [0, 1, 2, 3, 0]) {
    const before = stage < 2;
    await page.locator('.cleanup-stage-button').nth(stage).click();
    await node('coordinator').click();
    assert.deepEqual(await page.locator('#relationship-lens-list [data-relationship-target]')
      .evaluateAll((elements) => elements.map((element) => element.dataset.relationshipTarget).sort()),
    [before ? 'legacyRouter' : 'handler', 'entrypoint'].sort());

    await page.locator('#btn-reach-downstream').click();
    const reach = await page.evaluate(() => window.Archify.focus.reachability());
    assert.deepEqual(reach.nodeIds, before
      ? ['coordinator', 'legacyRouter', 'handler', 'publisher']
      : ['coordinator', 'handler', 'publisher']);

    await page.locator('#btn-route-probe').click();
    await node('coordinator').click();
    await node('handler').click();
    const route = await page.evaluate(() => window.Archify.routeProbe.result());
    assert.ok(route, `route missing at stage ${stage}`);
    assert.deepEqual(route.nodes, before ? ['coordinator', 'legacyRouter', 'handler'] : ['coordinator', 'handler']);
    assert.equal(route.hops, before ? 2 : 1);
    if (!before) {
      assert.equal(await page.evaluate(() => {
        window.Archify.routeProbe.begin({ source: 'coordinator' });
        return window.Archify.routeProbe.choose('legacyRouter');
      }), false);
    }
  }
});

test('snapshot filtering reaches search, radar and keyboard relationship targets', async () => {
  await open('change');
  for (const stage of [2, 0]) {
    const after = stage === 2;
    await page.locator('.cleanup-stage-button').nth(stage).click();
    const relationships = await page.locator('[data-relationship-hit-key]')
      .evaluateAll((elements) => elements.map((element) => element.dataset.relationshipId));
    assert.deepEqual(relationships, after
      ? ['requestDispatch', 'directDelegate', 'resultPublish']
      : ['requestDispatch', 'legacyDelegate', 'canonicalDelegate', 'resultPublish']);
    await page.locator('[data-relationship-hit-key]').first().press('End');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.relationshipId), 'resultPublish');

    await page.locator('#btn-node-finder').click();
    assert.equal(await page.locator('.node-finder-result').count(), after ? 4 : 5);
    const coordinator = page.locator('.node-finder-result[data-node-id="coordinator"]');
    assert.match(await coordinator.getAttribute('aria-label'), /2/);
    await page.locator('#node-finder-input').fill('legacyRouter');
    assert.equal(await page.locator('.node-finder-result').count(), after ? 0 : 1);
    await page.locator('#node-finder-close').click();

    await page.locator('#btn-overview-map').click();
    assert.equal(await page.locator('[data-radar-node-id]').count(), after ? 4 : 5);
    await page.locator('#overview-map-close').click();
  }
});

test('stage and Finding controls keep keyboard focus through activation', async () => {
  for (const mode of ['change', 'survey']) {
    await open(mode);
    for (const [index, key] of [[2, 'Enter'], [3, 'Space'], [0, 'Enter']]) {
      const button = page.locator('.cleanup-stage-button').nth(index);
      await button.press(key);
      assert.equal(await button.evaluate((element) => element === document.activeElement), true);
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
    }
    const count = await page.locator('.cleanup-finding-button').count();
    for (let index = count - 1; index >= 0; index--) {
      const button = page.locator('.cleanup-finding-button').nth(index);
      await button.press('Enter');
      assert.equal(await button.evaluate((element) => element === document.activeElement), true);
      assert.equal(await button.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.cleanup-finding-title').textContent(), await button.getAttribute('title'));
      await button.press('3');
      assert.equal(await button.evaluate((element) => element === document.activeElement), true);
      assert.equal(await page.locator('.cleanup-stage-button').nth(2).getAttribute('aria-pressed'), 'true');
    }
  }
});

test('native deep links respect the selected snapshot on load and reload', async () => {
  await open('change', '#finding=S1&stage=after&focus=coordinator&reach=downstream');
  assert.deepEqual(await page.evaluate(() => window.Archify.focus.reachability().nodeIds), ['coordinator', 'handler', 'publisher']);
  await page.locator('#btn-route-probe').click();
  await node('coordinator').click();
  await node('handler').click();
  assert.equal(new URL(page.url()).hash.includes('stage=after'), true);
  await page.reload();
  assert.deepEqual(await page.evaluate(() => window.Archify.routeProbe.result().nodes), ['coordinator', 'handler']);

  await page.goto(`${baseUrl}/change#finding=S1&stage=before&route=coordinator~handler`);
  await page.waitForFunction(() => window.Archify.routeProbe.result()?.hops === 2);
  assert.deepEqual(await page.evaluate(() => window.Archify.routeProbe.result().nodes), ['coordinator', 'legacyRouter', 'handler']);

  await open('change', '#stage=after&focus=legacyRouter');
  assert.equal(await page.evaluate(() => window.Archify.focus.active()), null);
  await open('change', '#stage=after&route=coordinator~legacyRouter');
  assert.equal(await page.evaluate(() => window.Archify.routeProbe.result()), null);
  await open('change', '#relation=directDelegate');
  assert.equal(await page.evaluate(() => window.Archify.focus.relationship()), null);
});

test('Survey keeps its authored route and explicit passport disclosure', async () => {
  await open('survey');
  await page.locator('.cleanup-stage-button').nth(1).click();
  await page.waitForFunction(() => window.Archify.routeProbe.result() !== null);
  const route = await page.evaluate(() => window.Archify.routeProbe.result());
  assert.deepEqual(route.nodes, ['entrypoint', 'coordinator', 'legacyRouter', 'handler', 'publisher']);
  await page.locator('.cleanup-stage-button').nth(0).click();
  assert.equal(await page.locator('#focus-chip').isVisible(), false);
  await node('legacyRouter').click();
  assert.equal(await page.locator('#focus-chip').isVisible(), true);
});

test('invalid native links clear previous selections within the current snapshot', async () => {
  await open('change', '#stage=after&focus=coordinator');
  await page.goto(`${baseUrl}/change#focus=legacyRouter`);
  await page.waitForFunction(() => window.Archify.focus.active() === null);
  assert.equal(await page.locator('#focus-chip').isVisible(), false);

  for (const route of ['coordinator~legacyRouter', 'coordinator', 'missing~handler']) {
    await page.goto(`${baseUrl}/change#route=coordinator~handler`);
    await page.waitForFunction(() => window.Archify.routeProbe.result()?.hops === 1);
    await page.goto(`${baseUrl}/change#route=${route}`);
    await page.waitForFunction(() => window.Archify.routeProbe.result() === null);
  }
  assert.equal(await page.locator('#cleanup-stage-panel').getAttribute('data-stage'), 'after');
});

test('a native link cancels a pending stage route', async () => {
  await open('survey');
  await page.evaluate(async () => {
    document.querySelectorAll('.cleanup-stage-button')[1].click();
    location.hash = '#finding=S1&stage=locate&focus=coordinator';
    await new Promise((resolve) => setTimeout(resolve, 0));
    for (let frame = 0; frame < 4; frame++) {
      await new Promise(requestAnimationFrame);
    }
  });
  assert.equal(await page.locator('#cleanup-stage-panel').getAttribute('data-stage'), 'locate');
  assert.equal(await page.evaluate(() => window.Archify.focus.active()), 'coordinator');
  assert.equal(await page.evaluate(() => window.Archify.routeProbe.result()), null);
});

test('new and retired nodes follow snapshots through repeated transitions', async () => {
  await open('expanded-change');
  for (const stage of [0, 2, 1, 3, 0]) {
    const after = stage >= 2;
    await page.locator('.cleanup-stage-button').nth(stage).press('Enter');
    assert.equal(await node('resultCache').isVisible(), after);
    assert.equal(await node('legacyRouter').isVisible(), !after);
    const route = await page.evaluate(() => {
      window.Archify.routeProbe.begin({ source: 'entrypoint', focusNode: false });
      window.Archify.routeProbe.choose('resultCache', { updateUrl: false });
      return window.Archify.routeProbe.result();
    });
    assert.deepEqual(route?.nodes ?? null, after ? ['entrypoint', 'coordinator', 'handler', 'publisher', 'resultCache'] : null);
    await page.locator('.cleanup-stage-button').nth(stage).press('Enter');
    await node('publisher').click();
    await page.locator('#btn-reach-upstream').click();
    assert.deepEqual(await page.evaluate(() => window.Archify.focus.reachability().nodeIds), after
      ? ['publisher', 'handler', 'coordinator', 'entrypoint']
      : ['publisher', 'handler', 'legacyRouter', 'coordinator', 'entrypoint']);
    assert.equal(await page.evaluate((absent) => window.Archify.finder.select(absent), after ? 'legacyRouter' : 'resultCache'), false);
    assert.equal(await page.evaluate((absent) => window.Archify.radar.focus(absent), after ? 'legacyRouter' : 'resultCache'), false);
  }
});

test('authored text survives rendering into the viewer without executing markup', async () => {
  await open('literal');
  assert.equal(await page.locator('h1').textContent(), literalLabel);
  assert.equal(await page.locator('.cleanup-finding-title').textContent(), literalLabel);
  assert.equal(await node('entrypoint').getAttribute('data-node-label'), literalLabel);
  assert.equal(await page.locator('.diagram-container > svg [data-edge-id="requestDispatch"][data-edge-label]').first().getAttribute('data-edge-label'), literalLabel);
  await page.locator('.cleanup-evidence-toggle').click();
  assert.equal(await page.locator('.cleanup-evidence-proof .cleanup-evidence-value').textContent(), literalProof);
  await node('entrypoint').click();
  assert.equal(await page.locator('#cleanup-passport-locus').textContent(), `src/${literalLabel}.ts:18`);
  await page.locator('.cleanup-stage-button').nth(3).click();
  assert.equal(await page.locator('.cleanup-evidence-proof .cleanup-evidence-value').textContent(), literalProof);
  assert.equal(await page.evaluate(() => globalThis.compromised), undefined);
});
