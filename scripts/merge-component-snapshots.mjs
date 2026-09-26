#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDigest } from './lib/core.mjs';

const root = process.cwd();
const args = process.argv.slice(2);

function arg(name, fallback) {
  const i = args.indexOf(name);
  if (i < 0) return fallback;
  if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(name + ' 값 필요');
  return args[i + 1];
}

const dir = arg('--dir', 'design/operations/components-refresh-20260926');
const out = arg('--out', dir + '/snapshot-components-merged.json');

const files = [1,2,3,4,5,6].map(i => resolve(root, dir, 'snapshot-ds-' + i + '.json'));
const snaps = files.map(file => JSON.parse(readFileSync(file, 'utf8')));

const first = snaps[0];
for (const [i, snap] of snaps.entries()) {
  if (snap.schemaVersion !== 1) throw new Error('snapshot-ds-' + (i+1) + ': schemaVersion 오류');
  if (snap.stage !== 'components') throw new Error('snapshot-ds-' + (i+1) + ': stage=components 필요');
  if (snap.fileKey !== first.fileKey) throw new Error('fileKey 불일치: batch ' + (i+1));
  if (snap.pageId !== first.pageId) throw new Error('pageId 불일치: batch ' + (i+1));
  if (JSON.stringify(snap.expectedFrameIds) !== JSON.stringify(first.expectedFrameIds))
    throw new Error('expectedFrameIds 불일치: batch ' + (i+1));
}

const frameMap = new Map();
for (const snap of snaps) {
  for (const frame of snap.frames || []) {
    if (frameMap.has(frame.id)) throw new Error('중복 frame: ' + frame.id);
    frameMap.set(frame.id, frame);
  }
}

const expected = first.expectedFrameIds || [];
const missing = expected.filter(id => !frameMap.has(id));
const extra = [...frameMap.keys()].filter(id => !expected.includes(id));
if (missing.length || extra.length) {
  throw new Error(
    'frame coverage 불일치. missing=' + JSON.stringify(missing) +
    ' extra=' + JSON.stringify(extra)
  );
}

function assertSame(label, values) {
  const baseline = JSON.stringify(values[0]);
  for (let i = 1; i < values.length; i++) {
    if (JSON.stringify(values[i]) !== baseline)
      throw new Error(label + '가 batch 간 다름: batch1 vs batch' + (i+1));
  }
  return values[0];
}

const variables = assertSame('variables', snaps.map(s => s.variables || {}));
const textStyles = assertSame('textStyles', snaps.map(s => s.textStyles || {}));
const inputDigest = buildDigest(root, 'components');

const merged = {
  schemaVersion: 1,
  fileKey: first.fileKey,
  stage: 'components',
  inputDigest,
  capturedAt: snaps.map(s => s.capturedAt).filter(Boolean).sort().at(-1) || new Date().toISOString(),
  pageId: first.pageId,
  expectedFrameIds: expected,
  complete: true,
  frames: expected.map(id => frameMap.get(id)),
  variables,
  textStyles
};

writeFileSync(resolve(root, out), JSON.stringify(merged, null, 2) + '\n');
console.log('merged:', out);
console.log('inputDigest:', inputDigest);
console.log('frames:', merged.frames.length);
