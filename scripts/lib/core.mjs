import { readFileSync, existsSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';
import {characterFiles} from './assets.mjs';

export const paths = {
  config: 'harness.config.json', requirements: 'design/02-structure/requirements.json',
  references: 'design/01-references/index.json', tokens: 'design/03-design-rules/tokens/tokens.json',
  systemSnapshot: 'design/03-design-rules/system/snapshot.json',
  extensions: 'design/03-design-rules/components/token-extensions.json', components: 'design/03-design-rules/components/catalog.json', componentSnapshot: 'design/03-design-rules/components/snapshot.json',
  screens: 'design/04-screens/screens.json', assets: 'design/04-screens/assets.json',
  screenSnapshot: 'design/04-screens/snapshot.json', visual: 'design/04-screens/verification/visual-review.json',
  audit: 'design/04-screens/verification/audit.json',
};
export const phases = ['inputs', 'extract-system', 'components', 'screens', 'verification'];
export const nonempty = x => typeof x === 'string' && x.trim().length > 0;
export const array = x => Array.isArray(x) ? x : [];
export const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
export function safePath(root, name) {
  if (!nonempty(name) || isAbsolute(name)) throw new Error(`프로젝트 상대 경로 필요: ${name}`);
  const abs = resolve(root, name), rel = relative(resolve(root), abs);
  if (rel === '..' || rel.startsWith('../')) throw new Error(`프로젝트 밖 경로: ${name}`);
  // Resolve the nearest existing ancestor too, preventing writes through directory symlinks.
  let ancestor = abs;
  while (!existsSync(ancestor)) ancestor = dirname(ancestor);
  const realRel = relative(realpathSync(root), realpathSync(ancestor));
  if (realRel === '..' || realRel.startsWith('../')) throw new Error(`프로젝트 밖 심볼릭 링크: ${name}`);
  return abs;
}
export function read(root, name) {
  const file=safePath(root,name);
  if(!existsSync(file))throw new Error(`아직 없는 산출물: ${name}`);
  return JSON.parse(readFileSync(file,'utf8'));
}
export function write(root, name, value) {
  const p = safePath(root, name); mkdirSync(dirname(p), {recursive:true});
  writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
}
export function fileHash(root, name) {
  return createHash('sha256').update(readFileSync(safePath(root, name))).digest('hex');
}
export function digest(root, names) {
  const hash = createHash('sha256');
  for (const name of [...new Set(names)].sort()) hash.update(`${name}\0${fileHash(root, name)}\0`);
  return hash.digest('hex');
}
// Baseline design inputs shared by every downstream stage.
// No concept previews or direction selection in the extract-extend flow.
export function baseFiles(root) {
  const req = read(root, paths.requirements), refs = read(root, paths.references);
  return [paths.config, paths.requirements, req.prd, paths.references, paths.tokens,
    ...array(refs.references).map(r=>r.file),
    ...characterFiles(root,read(root,paths.config))];
}
// Fingerprint of the extracted design system baseline (config + requirements + tokens + references).
export const systemDigest = root => digest(root, baseFiles(root));
export function buildDigest(root, stage = 'components') {
  const files = [...baseFiles(root), paths.extensions, paths.components, paths.assets];
  for (const a of array(read(root, paths.assets).assets)) files.push(a.file);
  if (stage === 'screens') {
    files.push(paths.componentSnapshot, paths.assets);
    for (const a of array(read(root, paths.assets).assets)) files.push(a.file);
  }
  return digest(root, files);
}
export function reviewDigest(root) {
  const manifest = read(root, paths.screens);
  return digest(root, [...baseFiles(root), paths.extensions, paths.components,
    paths.componentSnapshot, paths.assets, paths.screens, paths.screenSnapshot,
    ...array(read(root, paths.assets).assets).map(a=>a.file), ...array(manifest.screens).map(s=>s.screenshot)]);
}
export function imageExists(root, name) {
  const b = readFileSync(safePath(root,name));
  const png = b.length > 24 && b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg = b.length > 4 && b[0]===255 && b[1]===216 && b.at(-2)===255 && b.at(-1)===217;
  const webp = b.length > 12 && b.toString('ascii',0,4)==='RIFF' && b.toString('ascii',8,12)==='WEBP';
  if (!(png||jpeg||webp)) throw new Error(`실제 PNG/JPEG/WebP 파일 필요: ${name}`);
  return true;
}
export function unique(items, key, errors, label) {
  const ids=items.map(x=>x?.[key]);
  if (ids.some(x=>!nonempty(x)) || new Set(ids).size!==ids.length) errors.push(`${label}: ${key} 누락/중복`);
}
export function validateTokens(t) {
  const e=[];
  if (t?.schemaVersion!==1) e.push('tokens.schemaVersion은 1이어야 함');
  if (!object(t?.primitives) || !Object.keys(t.primitives).length) e.push('primitive 토큰 필요');
  if (!object(t?.semantic) || !Object.keys(t.semantic).length) e.push('semantic 토큰 필요');
  for (const [n,v] of Object.entries(t?.primitives||{})) {
    if (!/^[a-z][\w-]*$/.test(n)) e.push(`토큰 이름 오류: ${n}`);
    if (v.type==='COLOR') {
      if (!/^#[\da-f]{6}([\da-f]{2})?$/i.test(v.value)) e.push(`${n}: #RRGGBB 또는 #RRGGBBAA 필요`);
    } else if (v.type==='FLOAT') {
      if (!Number.isFinite(v.value) || v.value<0) e.push(`${n}: 0 이상의 숫자 필요`);
    } else e.push(`${n}: 지원 타입 COLOR/FLOAT`);
  }
  for (const [n,v] of Object.entries(t?.semantic||{})) {
    if (!/^[a-z][\w-]*$/.test(n)) e.push(`semantic 이름 오류: ${n}`);
    if (!object(v) || Object.keys(v).some(k=>k!=='ref') || !t?.primitives?.[v.ref]) e.push(`${n}: 존재하는 primitive의 ref만 허용`);
  }
  if (!object(t?.textStyles) || !Object.keys(t.textStyles).length) e.push('textStyles 필요');
  for (const [n,s] of Object.entries(t?.textStyles||{})) {
    if (!n.startsWith('Text/') || !nonempty(s.fontFamily) || !nonempty(s.fontStyle) || !(s.fontSize>0) || !(s.lineHeight>=s.fontSize)) e.push(`${n}: 타이포 명세 오류`);
  }
  return e;
}
// Effective tokens = extracted baseline tokens + additive component extensions.
// The extension file may only ADD tokens; it cannot overwrite the extracted system.
export function effectiveTokens(root) {
  const base=read(root,paths.tokens);
  const selected={...base, primitives:{...base.primitives}, semantic:{...base.semantic}, textStyles:{...base.textStyles}};
  const extension=read(root,paths.extensions);
  if(extension.schemaVersion!==1) throw new Error('token extension 버전 오류');
  for(const group of ['primitives','semantic','textStyles']) {
    if(!object(extension[group])) throw new Error(`token extension ${group} 객체 필요`);
    for(const key of Object.keys(extension[group])) if(key in selected[group]) throw new Error(`추출한 시스템 토큰 덮어쓰기 금지: ${group}/${key}. 원본(피그마)에서 수정 후 재추출`);
    selected[group]={...selected[group],...extension[group]};
  }
  const errors=validateTokens(selected); if(errors.length)throw new Error(errors.join(' / '));
  return selected;
}
export function reuseRate(nodes) {
  const byId=new Map(nodes.map(n=>[n.id,n]));
  function insideInstance(n) {
    const seen=new Set();
    for (let p=byId.get(n.parentId);p;p=byId.get(p.parentId)) {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      if (p.type==='INSTANCE') return true;
    }
    return false;
  }
  const targets=nodes.filter(n=>n.reusable===true && !insideInstance(n));
  return targets.length ? targets.filter(n=>n.type==='INSTANCE').length/targets.length : null;
}
