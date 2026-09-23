// rebind 스펙 생성기.
// tokens.json(정형화된 최종 토큰) + 근접변형 통합맵 + 화면 스냅샷의 실제 사용 색을 근거로
// 플러그인 rebind op가 소비할 스펙(ensure/colorMap/spacingTokens/radiusTokens/textStyleMap)을 만든다.
// design/operations/rebind-01/ 에 design·Design System 페이지용 dryrun/apply 4개 파일을 출력.
// tokens.json이나 통합맵이 바뀌면 이 스크립트를 다시 실행해 스펙을 재생성한다.
//   실행: node scripts/gen-rebind-spec.mjs
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
const t = JSON.parse(readFileSync('design/03-design-rules/tokens/tokens.json','utf8'));
const cfg = JSON.parse(readFileSync('harness.config.json','utf8'));

// primitive hex -> primitive name
const primByHex = new Map();
for (const [name,def] of Object.entries(t.primitives)) if (def.type==='COLOR') primByHex.set(def.value.slice(0,7).toUpperCase(), name);
// primitive name -> first semantic that refs it (색 바인딩 대상)
const semByPrim = new Map();
for (const [sname,def] of Object.entries(t.semantic)) if (!semByPrim.has(def.ref)) semByPrim.set(def.ref, sname);

// ── 색 매핑 전략: 공격적 통합(선택 1) ──
// 화면이 쓰는 모든 raw hex를 tokens.json primitive 중 "가장 가까운 색"에 자동 배정한다.
// 소스는 rebind dryRun 리포트의 unmappedColors(= 화면 실제 사용 색 전량).
// 회색끼리·빨강끼리 등 유사색을 하나의 대표 primitive로 흡수 → 색 파편 정리.

// primitive COLOR 목록(계열 힌트 포함). 계열이 다르면 매칭에서 강한 페널티를 줘
// 회색이 빨강 토큰에 붙는 사고를 막는다.
const primColors = [];
for (const [name,def] of Object.entries(t.primitives)) {
  if (def.type!=='COLOR') continue;
  primColors.push({ name, hex: def.value.slice(0,7).toUpperCase() });
}

function hexToRgb(h){ h=h.replace('#',''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]; }
function rgbToHsl(r,g,b){
  r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h=0,s=0,l=(mx+mn)/2;
  const d=mx-mn;
  if(d!==0){ s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    if(mx===r)h=((g-b)/d+(g<b?6:0)); else if(mx===g)h=(b-r)/d+2; else h=(r-g)/d+4; h/=6; }
  return [h*360,s,l];
}
// 색의 "계열": 채도 낮으면 중성(neutral), 아니면 hue 버킷
function family(hex){
  const [h,s,l]=rgbToHsl(...hexToRgb(hex));
  if (s < 0.15) return 'neutral';           // 회색/흑백
  // 채도 낮고 밝은 색(연한 배경/보더)은 색상 무관하게 중성으로 흡수
  if (s < 0.35 && l > 0.82) return 'neutral';
  if (h<20||h>=340) return 'red';
  if (h<45) return 'gold';                  // 주황·앰버·브론즈·골드
  if (h<70) return 'yellow';
  if (h<170) return 'green';
  if (h<260) return 'blue';                 // 파랑·인디고·슬레이트파랑
  return 'purple';
}
// primitive를 대표 계열로 태깅(수동 힌트: award/slate/warm/dark는 계열이 섞여 있어 이름으로 보정)
function primFamily(name, hex){
  if (/^neutral/.test(name)) return 'neutral';
  if (/^slate/.test(name)) return 'neutral';   // 슬레이트는 중성쪽으로 흡수 허용
  if (/^warm/.test(name)) return 'neutral';
  if (/^dark/.test(name)) return 'neutral';    // 다크 배경류는 어두운 중성
  if (name==='primary-main'||name==='primary-light'||name==='primary-lighter') return 'red';
  if (name==='status-low') return 'red';
  if (name==='status-high'||name==='status-success') return 'green';
  if (name==='status-medium'||name==='status-pending') return 'gold';
  if (name==='award-gold'||name==='award-amber'||name==='award-bronze') return 'gold';
  if (name==='award-silver') return 'neutral';
  if (name==='accent-indigo') return 'blue';
  if (name==='accent-yellow') return 'yellow';
  return family(hex);
}
for (const p of primColors) p.fam = primFamily(p.name, p.hex);

// 최근접 primitive 찾기(같은 계열 우대, 밝기 반영)
function nearestPrim(hex){
  const [tr,tg,tb]=hexToRgb(hex); const fam=family(hex);
  let best=null, bestD=Infinity;
  for (const p of primColors){
    const [pr,pg,pb]=hexToRgb(p.hex);
    let d=(tr-pr)**2+(tg-pg)**2+(tb-pb)**2;
    if (p.fam!==fam) d += 40000; // 계열 불일치 페널티
    if (d<bestD){ bestD=d; best=p; }
  }
  return best;
}

// 화면·시스템 실제 사용 색 = 여러 리포트의 unmappedColors 키를 합집합으로.
// 각 rebind 리포트가 그 페이지에서 실제로 만난 raw 색을 알려주므로,
// 있는 리포트를 모두 읽어 색 커버리지를 넓힌다. (없으면 조용히 skip)
const reportPaths = [
  'design/operations/extract-system-02/report-system-dryrun.json',
  'design/operations/extract-system-02/report-system-apply.json',
  'design/operations/extract-system-02/report-design-apply.json',
  'design/operations/extract-system-02/report-design-batch-1.json',
  'design/operations/extract-system-02/report-design-batch-2.json',
  'design/operations/extract-system-02/report-design-batch-landing.json',
  'design/operations/extract-system-02/report-design-batch-card.json',
];
const usedHex = new Set();
for (const rp of reportPaths) {
  let rep; try { rep = JSON.parse(readFileSync(rp,'utf8')); } catch { continue; }
  for (const h of Object.keys(rep.unmappedColors||{})) {
    const hx = h.toUpperCase().replace(/^#/,'');
    if (hx.length>=6) usedHex.add('#'+hx.slice(0,6));
  }
}
// tokens.json primitive 색 자신도 포함(Design System 페이지 바인딩용)
for (const p of primColors) usedHex.add(p.hex);

const colorMap = {};
const farMatches = [];
for (const h of usedHex) {
  // 정확히 일치하는 primitive가 있으면 그걸 우선
  let prim = primByHex.get(h);
  if (!prim) {
    const np = nearestPrim(h);
    prim = np.name;
    const [tr,tg,tb]=hexToRgb(h); const [pr,pg,pb]=hexToRgb(np.hex);
    const dist=Math.sqrt((tr-pr)**2+(tg-pg)**2+(tb-pb)**2);
    if (dist>60) farMatches.push(`${h}->${prim}(${np.hex}) d=${dist.toFixed(0)}`);
  }
  const sem = semByPrim.get(prim);
  if (!sem) { console.error('primitive에 semantic 없음:', prim, 'for', h); process.exit(1); }
  colorMap[h.slice(1)] = sem;
}
if (farMatches.length) {
  console.log('── 거리 먼 매칭(검토 권장):');
  for (const m of farMatches) console.log('  ', m);
}

// ensure: tokens.json 전체를 primitives/semantic/textStyles로
const ensure = { variables: { primitives:{}, semantic:{} }, textStyles:{} };
for (const [name,def] of Object.entries(t.primitives))
  ensure.variables.primitives[name] = def.type==='COLOR' ? {type:'COLOR',value:def.value} : {type:'FLOAT',value:def.value};
for (const [name,def] of Object.entries(t.semantic))
  ensure.variables.semantic[name] = { ref: def.ref };
for (const [name,def] of Object.entries(t.textStyles))
  ensure.textStyles[name] = def;

// spacingTokens / radiusTokens: 값기준 semantic
const spacingTokens = [];
for (const [sname,def] of Object.entries(t.semantic)) {
  if (!/^space-/.test(sname)) continue;
  spacingTokens.push({ name: sname, value: t.primitives[def.ref].value });
}
const radiusTokens = [];
for (const [sname,def] of Object.entries(t.semantic)) {
  if (!/^radius-\d/.test(sname)) continue;
  radiusTokens.push({ name: sname, value: t.primitives[def.ref].value });
}

// textStyleMap: 구 스타일명 -> 새 Text/* (스냅샷의 기존 텍스트스타일 → 신규)
const textStyleMap = {
  'Typography/Display Bold':'Text/display',
  'Typography/Title SemiBold':'Text/title',
  'Typography/Heading 1 SemiBold':'Text/h1',
  'Typography/Heading 1 Bold':'Text/h1-bold',
  'Typography/Heading 2 Regular':'Text/h2',
  'Typography/Heading 3 Bold':'Text/h3-bold',
  'Typography/Heading 3 Medium':'Text/h3-medium',
  'Typography/Heading 3 Regular':'Text/h3',
  'Typography/Heading 4 SemiBold':'Text/h4',
  'Typography/Heading 4 Medium':'Text/h4-medium',
  'Typography/Body L Bold':'Text/body-lg-bold',
  'Typography/Body L SemiBold':'Text/body-lg-medium',
  'Typography/Body L Regular':'Text/body-lg',
  'Typography/Body Regular':'Text/body',
  'Typography/Body S SemiBold':'Text/body-sm-semibold',
  'Typography/Body S Medium':'Text/body-sm-medium',
  'Typography/Body S Regular':'Text/body-sm',
  'Typography/Caption Medium':'Text/caption-medium',
  'Typography/Caption Regular':'Text/caption',
  'Typography/Micro Medium':'Text/micro',
  'Display/Bold':'Text/display',
  'Title/SemiBold':'Text/title',
  'Heading 1/SemiBold':'Text/h1',
  'Heading 1/Bold':'Text/h1-bold',
  'Heading 2/Regular':'Text/h2',
  'Heading 3/Medium':'Text/h3-medium',
  'Heading 3/Regular':'Text/h3',
  'Heading 4/SemiBold':'Text/h4',
  'Heading 4/Medium':'Text/h4-medium',
  'Body L/Medium':'Text/body-lg-medium',
  'Body L/Regular':'Text/body-lg',
  'Body/Regular':'Text/body',
  'Body S/SemiBold':'Text/body-sm-semibold',
  'Body S/Medium':'Text/body-sm-medium',
  'Body S/Regular':'Text/body-sm',
  'Caption/Medium':'Text/caption-medium',
  'Caption/Regular':'Text/caption',
  'Micro/Medium':'Text/micro',
};

function buildSpec(pageName, { frameIds, frameNames } = {}) {
  const spec = {
    op:'rebind', fileKey: cfg.figma.fileKey, pageName, dryRun:false,
    ensure, colorMap, spacingTokens, radiusTokens,
    radiusFullName:'radius-999', radiusFullThreshold:48, maxSnapError:2,
    textStyleMap,
  };
  if (frameIds && frameIds.length) spec.frameIds = frameIds;
  if (frameNames && frameNames.length) spec.frameNames = frameNames;
  return spec;
}

mkdirSync('design/operations/rebind-01', {recursive:true});

// ── Design System 페이지: 컴포넌트가 많지 않아 한 번에 처리(이미 성공 확인) ──
writeFileSync('design/operations/rebind-01/spec-system-apply.json',
  JSON.stringify(buildSpec('Design System'), null, 2));

// ── design(화면) 페이지: 프레임이 무거워서(총 ~2500 노드) 배치로 분할 ──
// frameIds를 지정하면 플러그인이 해당 프레임만 훑어 한 번에 처리량을 줄인다.
// ensure는 add-only라 매 배치가 안전(변수·스타일 중복 생성 없음).
// ID 근거: extract-screens-explore 스냅샷(노드 수·크기가 실제 화면과 일치).
// 프레임 "이름" 기반 배치(ID는 추출 시점마다 달라서 신뢰 불가).
// 주의: 랜딩 변형 4개는 이름이 모두 "Frame"으로 동일 → 이름 필터로는 한꺼번에 잡힌다.
// 그래서 "Frame" 4개는 batch-landing 하나로 묶는다(무거우면 나중에 ID로 쪼갬).
const designBatches = {
  'batch-1': ['Step 1 — 팀 정보','Input','Field','Label','Bottom Floating Bar - Vertical','1_Notice (Updated)'],
  'batch-2': ['Floating Bar - Expanded + Collapsed','LGE AX Hackathon - 최종 합격팀 발표 v2'],
  'batch-landing': ['Frame'],  // 이름이 "Frame"인 최상위 프레임 전부(랜딩 변형 4개)
  'batch-card': ['AX Hackathon — Card Redesign'],
};
for (const [name, frameNames] of Object.entries(designBatches)) {
  writeFileSync(`design/operations/rebind-01/spec-design-${name}.json`,
    JSON.stringify(buildSpec('design', { frameNames }), null, 2));
}
// 참고용 전체(한 번에 돌릴 수 있는 환경이면 이걸로) — 기본 흐름은 배치 사용
writeFileSync('design/operations/rebind-01/spec-design-apply.json',
  JSON.stringify(buildSpec('design'), null, 2));

console.log('colorMap entries:', Object.keys(colorMap).length);
console.log('spacingTokens:', spacingTokens.map(x=>x.value).join(','));
console.log('radiusTokens:', radiusTokens.map(x=>x.value).join(','));
console.log('ensure primitives:', Object.keys(ensure.variables.primitives).length, 'semantic:', Object.keys(ensure.variables.semantic).length, 'textStyles:', Object.keys(ensure.textStyles).length);
console.log('생성: spec-system-apply.json, spec-design-batch-1..6.json, spec-design-apply.json(전체)');
