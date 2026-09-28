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
function parseVariantName(name) {
  if (typeof name !== 'string') return null;
  const pairs = name.split(',').map((s) => s.trim()).filter(Boolean);
  const props = {};
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx <= 0) return null;
    props[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  }
  return Object.keys(props).length ? props : null;
}

function collectSubtreeIds(all, rootId) {
  const kids = new Set([rootId]);
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
  return kids;
}

// component set 전체뿐 아니라 실제 variant별 subtree 이름까지 보관한다.
// INSTANCE가 variantProperties를 지정한 경우 patch nodeName은 선택된 variant 안에 실제로 있어야 한다.
function loadComponentSnapshotIndex() {
  const snapPath = resolve(repoRoot, COMPONENT_SNAPSHOT);
  if (!existsSync(snapPath)) return null;
  let snap;
  try {
    snap = readJson(snapPath);
  } catch {
    return null;
  }

  const all = (snap.frames || []).flatMap((f) => f.nodes || []);
  const byId = new Map(all.map((n) => [n.id, n]));
  const namesBySet = new Map();
  const variantsBySet = new Map();

  for (const set of all.filter((n) => n.type === 'COMPONENT_SET')) {
    const setKids = collectSubtreeIds(all, set.id);
    namesBySet.set(
      set.id,
      new Set(
        [...setKids].map((id) => byId.get(id)?.name).filter((x) => typeof x === 'string')
      )
    );

    const variants = all
      .filter((n) => n.type === 'COMPONENT' && n.parentId === set.id)
      .map((variant) => {
        const ids = collectSubtreeIds(all, variant.id);
        const names = [...ids]
          .map((id) => byId.get(id)?.name)
          .filter((x) => typeof x === 'string');
        return {
          id: variant.id,
          name: variant.name,
          properties: parseVariantName(variant.name),
          names,
        };
      });
    variantsBySet.set(set.id, variants);
  }

  // catalog가 COMPONENT 단일 nodeId를 직접 가리키는 경우도 지원한다.
  for (const component of all.filter((n) => n.type === 'COMPONENT')) {
    if (!namesBySet.has(component.id)) {
      const ids = collectSubtreeIds(all, component.id);
      namesBySet.set(
        component.id,
        new Set(
          [...ids].map((id) => byId.get(id)?.name).filter((x) => typeof x === 'string')
        )
      );
    }
  }

  return { namesBySet, variantsBySet };
}

function resolveVariant(index, componentNodeId, requested) {
  if (!index || !requested || typeof requested !== 'object' || Array.isArray(requested)) {
    return null;
  }
  const variants = index.variantsBySet.get(componentNodeId) || [];
  const entries = Object.entries(requested).map(([k, v]) => [String(k), String(v)]);
  if (!entries.length) return null;

  const matches = variants.filter((variant) => {
    const props = variant.properties || {};
    return entries.every(([k, v]) => props[k] === v);
  });

  return { matches, requested: Object.fromEntries(entries) };
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
      variantProperties:
        node.variantProperties && typeof node.variantProperties === 'object'
          ? node.variantProperties
          : null,
      patchNodeNames: Array.isArray(node.patches)
        ? node.patches
            .filter((p) => p && typeof p.nodeName === 'string')
            .map((p, i) => ({
              nodeName: p.nodeName,
              expectedMatches:
                Number.isInteger(p.expectedMatches) && p.expectedMatches >= 0
                  ? p.expectedMatches
                  : null,
              at: `${path}.patches[${i}]`,
            }))
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
const componentSnapshotIndex = loadComponentSnapshotIndex();

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
    } else if (componentSnapshotIndex && Array.isArray(c.patchNodeNames)) {
      const setNames = componentSnapshotIndex.namesBySet.get(c.componentNodeId);
      const variantResolution = resolveVariant(
        componentSnapshotIndex,
        c.componentNodeId,
        c.variantProperties
      );

      if (variantResolution && variantResolution.matches.length !== 1) {
        bad.push({
          kind: 'variantResolution',
          field: 'variantProperties',
          value: JSON.stringify(variantResolution.requested),
          componentNodeId: c.componentNodeId,
          matches: variantResolution.matches.map((v) => v.name),
          at: c.at,
        });
        continue;
      }

      const selectedVariant =
        variantResolution && variantResolution.matches.length === 1
          ? variantResolution.matches[0]
          : null;
      const names = selectedVariant ? new Set(selectedVariant.names) : setNames;

      for (const p of c.patchNodeNames) {
        if (names && !names.has(p.nodeName)) {
          bad.push({
            kind: 'patchNodeName',
            field: 'patches.nodeName',
            value: p.nodeName,
            componentNodeId: c.componentNodeId,
            variantName: selectedVariant?.name || null,
            names,
            at: p.at,
          });
          continue;
        }

        if (names && p.expectedMatches !== null) {
          const actualMatches = [...names].filter((n) => n === p.nodeName).length;
          // names는 Set이라 이름 중복 개수까지는 보존하지 않는다. expectedMatches=1인 일반 patch는
          // selected variant 안의 존재 여부로 충분히 preflight하고, 실제 중복은 plugin runtime이 최종 검증한다.
          if (p.expectedMatches === 0 && actualMatches !== 0) {
            bad.push({
              kind: 'patchExpectedMatches',
              field: 'patches.expectedMatches',
              value: p.expectedMatches,
              actualMatches,
              nodeName: p.nodeName,
              componentNodeId: c.componentNodeId,
              variantName: selectedVariant?.name || null,
              at: p.at,
            });
          }
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

    if (b.kind === 'variantResolution') {
      console.error(
        `  - variantProperties=${b.value} 로 컴포넌트(${b.componentNodeId}) variant를 정확히 1개 resolve하지 못함 (${b.at})`
      );
      if (b.matches?.length) console.error(`    매칭 variant: ${b.matches.join(', ')}`);
      else console.error('    매칭 variant 없음. components/snapshot.json의 실제 variant property/value를 확인하라.');
      continue;
    }

    if (b.kind === 'patchExpectedMatches') {
      console.error(
        `  - patches.nodeName="${b.nodeName}" expectedMatches=${b.value}, preflight actual=${b.actualMatches} (${b.at})`
      );
      continue;
    }

    if (b.kind === 'patchNodeName') {
      const variantText = b.variantName ? ` / variant="${b.variantName}"` : '';
      console.error(
        `  - patches.nodeName="${b.value}" 는 컴포넌트(${b.componentNodeId}${variantText}) 스냅샷에 없는 노드 이름 (${b.at})`
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
