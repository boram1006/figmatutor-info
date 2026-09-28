#!/usr/bin/env node
// 스펙 JSON(op:create/duplicate/update)에서 참조하는 토큰/컴포넌트가 정본에 존재하는지 검증한다.
// 목적: 토큰 이름·componentNodeId를 추측해서 쓰는 것을 기계적으로 차단한다.
//
// 사용:
//   node scripts/validate-spec-tokens.mjs <spec.json> [<spec2.json> ...]
//   node scripts/validate-spec-tokens.mjs --all
//
// 검사:
//   - fillBinding
//   - fills/strokes 내부 binding
//   - bindings 객체의 semantic token 값
//   - textStyle
//   - type:"INSTANCE"의 componentNodeId가 catalog.json에 등록되어 있는지

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TOKENS = 'design/03-design-rules/tokens/tokens.json';
const EXT = 'design/03-design-rules/components/token-extensions.json';
const CATALOG = 'design/03-design-rules/components/catalog.json';
const COMPONENT_SNAPSHOT = 'design/03-design-rules/components/snapshot.json';

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}

function loadTokenSets() {
  const base = readJson(resolve(repoRoot, TOKENS));
  const semantic = new Set(Object.keys(base.semantic || {}));
  const textStyles = new Set(Object.keys(base.textStyles || {}));

  const extPath = resolve(repoRoot, EXT);
  if (existsSync(extPath)) {
    const ext = readJson(extPath);
    for (const k of Object.keys(ext.semantic || {})) semantic.add(k);
    for (const k of Object.keys(ext.textStyles || {})) textStyles.add(k);
  }
  return { semantic, textStyles };
}

// 컴포넌트 nodeId별로 스냅샷 서브트리(마스터/variant 내부)의 모든 노드 이름 집합을 만든다.
// INSTANCE patch의 nodeName이 실제로 그 컴포넌트 안에 존재하는 이름인지 대조하기 위한 것.
// 노드 이름 원본은 snapshot.json이며, 여기서만 읽어 stale 중복을 만들지 않는다.
function loadComponentNodeNames() {
  const snapPath = resolve(repoRoot, COMPONENT_SNAPSHOT);
  if (!existsSync(snapPath)) return null; // 스냅샷이 없으면 이 검사는 건너뛴다(다른 게이트가 잡음).
  let snap;
  try {
    snap = readJson(snapPath);
  } catch {
    return null;
  }
  const all = (snap.frames || []).flatMap((f) => f.nodes || []);
  const byId = new Map(all.map((n) => [n.id, n]));
  // setId -> 그 서브트리의 모든 노드 이름 집합
  const namesBySet = new Map();
  const setIds = all
    .filter((n) => ['COMPONENT', 'COMPONENT_SET'].includes(n.type))
    .map((n) => n.id);
  for (const setId of setIds) {
    const kids = new Set([setId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of all) {
        if (!kids.has(n.id) && n.parentId && kids.has(n.parentId)) {
          kids.add(n.id);
          changed = true;
        }
      }
    }
    const names = new Set(
      [...kids].map((id) => byId.get(id)?.name).filter((x) => typeof x === 'string')
    );
    namesBySet.set(setId, names);
  }
  return namesBySet;
}

function collectRefs(node, path, tokenRefs, componentRefs) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectRefs(v, `${path}[${i}]`, tokenRefs, componentRefs));
    return;
  }
  if (!node || typeof node !== 'object') return;

  if (node.type === 'INSTANCE') {
    componentRefs.push({
      componentNodeId: node.componentNodeId,
      at: path,
      name: node.name || node.key || null,
      // patch nodeName들을 함께 수집한다. 이 이름은 컴포넌트 스냅샷 서브트리에 실재해야 한다.
      patchNodeNames: Array.isArray(node.patches)
        ? node.patches
            .filter((p) => p && typeof p.nodeName === 'string')
            .map((p) => ({ nodeName: p.nodeName, at: `${path}.patches` }))
        : [],
    });
  }

  for (const [k, v] of Object.entries(node)) {
    if (k === 'fillBinding' && typeof v === 'string') {
      tokenRefs.push({ kind: 'semantic', field: 'fillBinding', value: v, at: `${path}.${k}` });
      continue;
    }

    if (k === 'binding' && typeof v === 'string') {
      tokenRefs.push({ kind: 'semantic', field: 'binding', value: v, at: `${path}.${k}` });
      continue;
    }

    if (k === 'bindings' && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [prop, token] of Object.entries(v)) {
        if (typeof token === 'string') {
          tokenRefs.push({
            kind: 'semantic',
            field: 'bindings.' + prop,
            value: token,
            at: `${path}.${k}.${prop}`,
          });
        }
      }
      collectRefs(v, `${path}.${k}`, tokenRefs, componentRefs);
      continue;
    }

    if (k === 'textStyle' && typeof v === 'string') {
      tokenRefs.push({ kind: 'textStyle', field: 'textStyle', value: v, at: `${path}.${k}` });
      continue;
    }

    collectRefs(v, `${path}.${k}`, tokenRefs, componentRefs);
  }
}

function findAllSpecs() {
  const results = [];
  const walk = (dir) => {
    const abs = resolve(repoRoot, dir);
    if (!existsSync(abs)) return;

    for (const name of readdirSync(abs)) {
      const full = join(abs, name);
      const st = statSync(full);
      if (st.isDirectory()) walk(relative(repoRoot, full));
      else if (/^spec-.*\.json$/.test(name)) results.push(relative(repoRoot, full));
    }
  };

  walk('design/operations');
  return results;
}

const args = process.argv.slice(2);
let specPaths;
if (args.includes('--all')) specPaths = findAllSpecs();
else if (args.length) specPaths = args;
else {
  console.error('사용: node scripts/validate-spec-tokens.mjs <spec.json> [...] 또는 --all');
  process.exit(1);
}

const { semantic, textStyles } = loadTokenSets();
const catalog = readJson(resolve(repoRoot, CATALOG));
const catalogNodeIds = new Set((catalog.components || []).map((c) => c.nodeId));
const componentNodeNames = loadComponentNodeNames(); // Map<setId, Set<name>> | null

let hadError = false;
let checked = 0;

for (const sp of specPaths) {
  const abs = resolve(repoRoot, sp);

  if (!existsSync(abs)) {
    console.error(`파일 없음: ${sp}`);
    hadError = true;
    continue;
  }

  let spec;
  try {
    spec = readJson(abs);
  } catch (e) {
    console.error(`JSON 파싱 실패: ${sp} — ${e.message}`);
    hadError = true;
    continue;
  }

  const tokenRefs = [];
  const componentRefs = [];
  collectRefs(spec, '$', tokenRefs, componentRefs);

  const bad = [];

  for (const r of tokenRefs) {
    if (r.kind === 'semantic' && !semantic.has(r.value)) bad.push(r);
    if (r.kind === 'textStyle' && !textStyles.has(r.value)) bad.push(r);
  }

  for (const c of componentRefs) {
    if (typeof c.componentNodeId !== 'string' || !c.componentNodeId) {
      bad.push({
        kind: 'component',
        field: 'componentNodeId',
        value: String(c.componentNodeId),
        at: c.at,
      });
    } else if (!catalogNodeIds.has(c.componentNodeId)) {
      bad.push({
        kind: 'component',
        field: 'componentNodeId',
        value: c.componentNodeId,
        at: c.at,
      });
    } else if (componentNodeNames && Array.isArray(c.patchNodeNames)) {
      // componentNodeId가 유효할 때만 patch nodeName이 실제 컴포넌트 서브트리에 있는지 검사한다.
      // 스냅샷이 없으면(componentNodeNames === null) 이 검사는 건너뛴다.
      const names = componentNodeNames.get(c.componentNodeId);
      for (const p of c.patchNodeNames) {
        if (names && !names.has(p.nodeName)) {
          bad.push({
            kind: 'patchNodeName',
            field: 'patches.nodeName',
            value: p.nodeName,
            componentNodeId: c.componentNodeId,
            names,
            at: p.at,
          });
        }
      }
    }
  }

  checked++;

  if (!bad.length) {
    console.log(
      `OK   ${sp} (${tokenRefs.length}개 토큰, ${componentRefs.length}개 INSTANCE 참조 유효)`
    );
    continue;
  }

  hadError = true;
  console.error(`\nFAIL ${sp}`);

  for (const b of bad) {
    if (b.kind === 'component') {
      console.error(
        `  - ${b.field}="${b.value}" 는 catalog.json에 등록된 component nodeId가 아님 (${b.at})`
      );
      console.error('    Design System을 수동 extract하고 catalog.json을 먼저 갱신하라.');
      continue;
    }

    if (b.kind === 'patchNodeName') {
      console.error(
        `  - patches.nodeName="${b.value}" 는 컴포넌트(${b.componentNodeId}) 스냅샷에 없는 노드 이름 (${b.at})`
      );
      const stem = String(b.value);
      const near = [...(b.names || [])]
        .filter((n) => n && (n.includes(stem) || stem.includes(n)))
        .slice(0, 8);
      const sample = near.length ? near : [...(b.names || [])].slice(0, 12);
      if (sample.length) console.error(`    실제 노드 이름(일부): ${sample.join(', ')}`);
      console.error(
        '    "Label" 같은 문서 예시 이름을 추측해 쓰지 말고, components/snapshot.json의 실제 노드 이름을 사용하라.'
      );
      continue;
    }

    const pool = b.kind === 'semantic' ? semantic : textStyles;
    const stem = String(b.value).split('-')[0];
    const near = [...pool].filter((k) => k.includes(stem)).slice(0, 6);

    console.error(
      `  - ${b.field}="${b.value}" 는 실제 ${b.kind} 정본에 없음 (${b.at})`
    );
    if (near.length) console.error(`    비슷한 후보: ${near.join(', ')}`);
  }
}

if (hadError) {
  console.error(
    `\n검증 실패. 추측한 토큰/컴포넌트 참조를 제거하라. 정본: ${TOKENS} (+ ${EXT}), ${CATALOG}.`
  );
  process.exit(1);
}

console.log(
  `\n검증 통과: ${checked}개 스펙, 모든 토큰/컴포넌트 참조 유효.`
);
