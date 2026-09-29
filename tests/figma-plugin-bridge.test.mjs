import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';

import { resolveRepoJsonPath } from '../scripts/figma-plugin/bridge-server.mjs';

const repoRoot = path.resolve('/tmp/design-flow-harness-test');

test('allows JSON files below design/operations', () => {
  const target = resolveRepoJsonPath(
    'design/operations/v6-judging-result/request.json',
    repoRoot
  );

  assert.equal(
    target.relativePath,
    'design/operations/v6-judging-result/request.json'
  );
  assert.equal(
    target.absolutePath,
    path.resolve(
      repoRoot,
      'design/operations/v6-judging-result/request.json'
    )
  );
});

for (const invalid of [
  '../package.json',
  'package.json',
  'scripts/figma-plugin/request.json',
  'design/operations/task/result.txt',
  '/tmp/request.json',
  'design/operations/../../package.json',
]) {
  test(`rejects disallowed path: ${invalid}`, () => {
    assert.throws(() => resolveRepoJsonPath(invalid, repoRoot));
  });
}

test('accepts Windows-style separators only after constraining them to the allowed root', () => {
  const target = resolveRepoJsonPath(
    'design\\operations\\task\\snapshot.json',
    repoRoot
  );
  assert.equal(target.relativePath, 'design/operations/task/snapshot.json');
});
