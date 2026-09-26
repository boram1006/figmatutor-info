#!/usr/bin/env node
// 스펙 JSON(op:create/duplicate/update)에서 참조하는 토큰 이름이 실제 tokens에 존재하는지 검증한다.
// 존재하지 않는 fillBinding(semantic) / textStyle 을 쓰면 실패한다.
// 목적: 토큰 이름을 추측해서 쓰는 것을 기계적으로 차단한다.
//
// 사용:
//   node scripts/validate-spec-tokens.mjs <spec.json> [<spec2.json> ...]
//   node scripts/validate-spec-tokens.mjs --all           (design/operations/**/spec-*.json 전체)
//
// 규칙:
//   - fillBinding 값은 tokens.semantic 키에 있어야 한다.
//   - textStyle 값은 tokens.textStyles 키에 있어야 한다.
//   - tokens.json + token-extensions.json 을 병합해 검사한다.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TOKENS = 'design/03-design-rules/tokens/tokens.json';
const EXT = 'design/03-design-rules/components/token-extensions.json';

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}

function loadTokenSets() {
  const base = readJson(resolve(repoRoot, TOKENS));
  const semantic = new Set(Object.keys(base.semantic || {}));
  const primitives = new Set(Object.keys(base.primitives || {}));
  const textStyles = new Set(Object.keys(base.textStyles || {}));
  const extPath = resolve(repoRoot, EXT);
  if (existsSync(extPath)) {
    const ext = readJson(extPath);
    for (const k of Object.keys(ext.semantic || {})) semantic.add(k);
    for (const k of Object.keys(ext.primitives || {})) primitives.add(k);
    for (const k of Object.keys(ext.textStyles || {})) textStyles.add(k);
  }
  return { semantic, primitives, textStyles };
}

// 스펙 객체를 재귀적으로 훑으며 토큰 참조 필드를 수집한다.
function collectRefs(node, path, out) {
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectRefs(v, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === 'fillBinding' && typeof v === 'string') {
        out.push({ kind: 'semantic', field: 'fillBinding', value: v, at: `${path}.${k}` });
      } else if (k === 'textStyle' && typeof v === 'string') {
        out.push({ kind: 'textStyle', field: 'textStyle', value: v, at: `${path}.${k}` });
      } else {
        collectRefs(v, `${path}.${k}`, out);
      }
    }
  }
}

function findAllSpecs() {
  const roots = ['design/operations'];
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
  roots.forEach(walk);
  return results;
}

const args = process.argv.slice(2);
let specPaths;
if (args.includes('--all')) {
  specPaths = findAllSpecs();
} else if (args.length) {
  specPaths = args;
} else {
  console.error('사용: node scripts/validate-spec-tokens.mjs <spec.json> [...]  또는  --all');
  process.exit(1);
}

const { semantic, textStyles } = loadTokenSets();
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
  const refs = [];
  collectRefs(spec, '$', refs);
  const bad = [];
  for (const r of refs) {
    if (r.kind === 'semantic' && !semantic.has(r.value)) {
      bad.push(r);
    } else if (r.kind === 'textStyle' && !textStyles.has(r.value)) {
      bad.push(r);
    }
  }
  checked++;
  if (bad.length) {
    hadError = true;
    console.error(`\nFAIL ${sp}`);
    for (const b of bad) {
      const pool = b.kind === 'semantic' ? semantic : textStyles;
      const near = [...pool].filter((k) => k.includes(b.value.split('-')[0])).slice(0, 6);
      console.error(`  - ${b.field}="${b.value}" 는 실제 ${b.kind} 토큰에 없음 (${b.at})`);
      if (near.length) console.error(`    비슷한 후보: ${near.join(', ')}`);
    }
  } else {
    console.log(`OK   ${sp} (${refs.length}개 토큰 참조 모두 유효)`);
  }
}

if (hadError) {
  console.error(`\n검증 실패. 존재하지 않는 토큰 이름을 스펙에서 제거/교체하라. 토큰 정본: ${TOKENS} (+ ${EXT}).`);
  process.exit(1);
}
console.log(`\n검증 통과: ${checked}개 스펙, 모든 토큰 참조 유효.`);
