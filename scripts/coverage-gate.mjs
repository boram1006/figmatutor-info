#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
function arg(name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(name + ' 값 필요');
  return args[i + 1];
}

const root = process.cwd();
const configPath = arg('--config', 'design/04-screens/coverage/assertions-v5.json');
const config = JSON.parse(readFileSync(resolve(root, configPath), 'utf8'));
if (config.schemaVersion !== 1) throw new Error('coverage assertions schemaVersion은 1이어야 함');
if (!config.snapshotPath) throw new Error('coverage assertions snapshotPath 필요');

const snapshot = JSON.parse(readFileSync(resolve(root, config.snapshotPath), 'utf8'));
if (snapshot.schemaVersion !== 1 || snapshot.stage !== 'screens') throw new Error('stage=screens snapshot 필요');
if (!Array.isArray(snapshot.frames) || !snapshot.frames.length) throw new Error('snapshot frames 비어 있음');

const nodes = snapshot.frames.flatMap(f => Array.isArray(f.nodes) ? f.nodes : []);
const byId = new Map(nodes.map(n => [n.id, n]));
const excluded = new Set(config.excludeAncestorIds || []);

function hasExcludedAncestor(node) {
  let cur = node;
  const seen = new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    if (excluded.has(cur.id)) return true;
    cur = byId.get(cur.parentId);
  }
  return false;
}

function ancestorNamed(node, name) {
  let cur = node;
  const seen = new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    if (cur.name === name) return true;
    cur = byId.get(cur.parentId);
  }
  return false;
}

function visibleNodes(assertion) {
  return nodes.filter(n => {
    if (hasExcludedAncestor(n)) return false;
    if (assertion.scopeFrameName && !ancestorNamed(n, assertion.scopeFrameName)) return false;
    return true;
  });
}

function textOf(n) {
  return n?.text?.characters ?? null;
}

function minCount(a) {
  return Number.isInteger(a.minCount) ? a.minCount : 1;
}

function evaluate(a) {
  const pool = visibleNodes(a);
  if (a.type === 'node-text') {
    const n = byId.get(a.nodeId);
    return n && !hasExcludedAncestor(n) && textOf(n) === a.equals
      ? null : `${a.id}: node text 불일치 (${a.nodeId}) expected=${JSON.stringify(a.equals)} actual=${JSON.stringify(textOf(n))}`;
  }
  if (a.type === 'node-width') {
    const n = byId.get(a.nodeId);
    const actual = n?.bounds?.width;
    return n && actual === a.equals
      ? null : `${a.id}: node width 불일치 (${a.nodeId}) expected=${a.equals} actual=${actual}`;
  }
  if (a.type === 'frame-name') {
    const count = pool.filter(n => n.type === 'FRAME' && n.name === a.equals).length;
    return count >= minCount(a) ? null : `${a.id}: frame 없음 name=${a.equals} count=${count}`;
  }
  if (a.type === 'text-present') {
    const count = pool.filter(n => textOf(n) === a.equals).length;
    return count >= minCount(a) ? null : `${a.id}: text 없음 ${JSON.stringify(a.equals)} count=${count}`;
  }
  if (a.type === 'text-absent') {
    const count = pool.filter(n => textOf(n) === a.equals).length;
    return count === 0 ? null : `${a.id}: 금지 text 존재 ${JSON.stringify(a.equals)} count=${count}`;
  }
  if (a.type === 'regex-present' || a.type === 'regex-absent') {
    const re = new RegExp(a.pattern, a.flags || '');
    const count = pool.filter(n => typeof textOf(n) === 'string' && re.test(textOf(n))).length;
    if (a.type === 'regex-present') return count >= minCount(a) ? null : `${a.id}: regex text 없음 /${a.pattern}/ count=${count}`;
    return count === 0 ? null : `${a.id}: 금지 regex text 존재 /${a.pattern}/ count=${count}`;
  }
  if (a.type === 'instance-property') {
    const count = pool.filter(n => {
      if (n.type !== 'INSTANCE') return false;
      const cp = n.instance?.componentProperties?.[a.property];
      const vp = n.instance?.variantProperties?.[a.property];
      const actual = cp && typeof cp === 'object' && 'value' in cp ? cp.value : vp;
      return String(actual) === String(a.equals);
    }).length;
    return count >= minCount(a) ? null : `${a.id}: INSTANCE property 부족 ${a.property}=${a.equals} count=${count}`;
  }
  return `${a.id}: 알 수 없는 assertion type ${a.type}`;
}

const errors = [];
for (const a of config.assertions || []) {
  if (!a?.id || !a?.type) { errors.push('assertion id/type 필요'); continue; }
  const err = evaluate(a);
  if (err) errors.push(err);
}

const result = {
  passed: errors.length === 0,
  release: config.release || null,
  snapshotPath: config.snapshotPath,
  capturedAt: snapshot.capturedAt || null,
  assertionCount: (config.assertions || []).length,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
