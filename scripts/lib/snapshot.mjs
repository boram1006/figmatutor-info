import {array, object, nonempty, reuseRate} from './core.mjs';
const close=(a,b)=>typeof a===typeof b && (typeof a==='number'?Math.abs(a-b)<0.01:a===b);
const exemptRoles=new Set(['screen','device-chrome','icon','image','divider']);
export function validateSnapshot(snap, {config,tokens,catalog,stage,inputDigest}) {
  const e=[];
  if (snap?.schemaVersion!==1 || snap?.complete!==true) e.push('불완전/지원하지 않는 스냅샷. 제공된 추출기로 재추출 필요');
  if (!nonempty(config.figma?.fileKey) || snap?.fileKey!==config.figma.fileKey) e.push('Figma 파일 키 불일치/미설정');
  if (snap?.inputDigest!==inputDigest) e.push('입력 변경 후 스냅샷 재생성 필요');
  if (!Number.isFinite(Date.parse(snap?.capturedAt))) e.push('capturedAt 누락/오류');
  if (snap?.stage!==stage) e.push(`스냅샷 단계 불일치: ${stage}`);
  for (const [name,t] of Object.entries(tokens.primitives)) {
    const v=snap?.variables?.primitives?.[name];
    if (!v || Object.keys(v.aliasesByMode||{}).length>0 || v.type!==t.type || !object(v.valuesByMode) || !Object.keys(v.valuesByMode).length || !Object.values(v.valuesByMode).every(x=>close(typeof x==='string'?x.toUpperCase():x,typeof t.value==='string'?t.value.toUpperCase():t.value))) e.push(`primitive 실제 값 불일치: ${name}`);
  }
  for (const [name,t] of Object.entries(tokens.semantic)) {
    const v=snap?.variables?.semantic?.[name];
    if (!v || Object.keys(v.valuesByMode||{}).length>0 || !object(v.aliasesByMode) || !Object.keys(v.aliasesByMode).length || !Object.values(v.aliasesByMode).every(a=>a?.collection==='primitives' && a?.name===t.ref)) e.push(`semantic alias 불일치: ${name}`);
  }
  for (const [name,t] of Object.entries(tokens.textStyles)) {
    const s=snap?.textStyles?.[name];
    if (!s || !Object.entries(t).every(([k,v])=>close(s[k],v))) e.push(`텍스트 스타일 실제 값 불일치: ${name}`);
  }
  const frames=array(snap?.frames);
  if (!frames.length) e.push('스냅샷 프레임 없음');
  const frameIds=new Set();
  for (const frame of frames) {
    if (!nonempty(frame.id) || frameIds.has(frame.id)) e.push('프레임 ID 누락/중복');
    frameIds.add(frame.id);
    const nodes=array(frame.nodes), byId=new Map(nodes.map(n=>[n.id,n]));
    if (!nodes.length || frame.truncated) e.push(`${frame.name}: 노드 없음/추출 잘림`);
    if (byId.size!==nodes.length) e.push(`${frame.name}: 중복 노드 ID`);
    for (const n of nodes) {
      const label=`${frame.name}/${n.name}`;
      if (!nonempty(n.id) || !nonempty(n.type) || !object(n.bounds) || !['x','y','width','height'].every(k=>Number.isFinite(n.bounds[k]))) {e.push(`${label}: 노드 필수 필드 누락`);continue;}
      if (n.parentId && !byId.has(n.parentId)) e.push(`${label}: 부모 노드 누락`);
      for (const paint of [...array(n.fills),...array(n.strokes)]) {
        if (paint.type==='SOLID') {
          const b=paint.binding;
          if (b?.collection!=='semantic' || !tokens.semantic[b.name] || tokens.primitives[tokens.semantic[b.name].ref]?.type!=='COLOR') e.push(`${label}: 색상 semantic 바인딩 누락/오류`);
        }
      }
      for (const [prop,value] of Object.entries(n.metrics||{})) {
        if (!Number.isFinite(value)) {e.push(`${label}: ${prop} 수치 누락`);continue;}
        if (value===0) continue;
        const b=n.bindings?.[prop];
        if (b?.collection!=='semantic' || !tokens.semantic[b.name] || tokens.primitives[tokens.semantic[b.name].ref]?.type!=='FLOAT') e.push(`${label}: ${prop} semantic 바인딩 누락`);
        else if (!close(value,tokens.primitives[tokens.semantic[b.name].ref].value)) e.push(`${label}: ${prop} 토큰 값 불일치`);
        if (/padding|Spacing/.test(prop) && value%config.grid!==0) e.push(`${label}: ${prop} 그리드 위반`);
      }
      if (n.type==='TEXT' && !tokens.textStyles[n.textStyle]) e.push(`${label}: 허용되지 않은 텍스트 스타일`);
      if (n.tapTarget===true && (n.bounds.width<config.minimumTapSize || n.bounds.height<config.minimumTapSize)) e.push(`${label}: 탭 영역 부족`);
      if (n.role==='image' && !array(n.fills).some(f=>f.type==='IMAGE' && nonempty(f.imageHash))) e.push(`${label}: 이미지 슬롯 미충전`);
      if (['FRAME','COMPONENT','INSTANCE','COMPONENT_SET'].includes(n.type) && n.layout?.mode && n.layout.mode!=='NONE' && n.layout.vertical==='FIXED' && !exemptRoles.has(n.role)) {
        const c=array(catalog.components).find(c=>c.id===n.componentId);
        if (!object(c?.height) || !tokens.semantic[c.height.token]) e.push(`${label}: HUG 또는 카탈로그의 고정 높이 토큰 필요`);
        else if (!close(n.bounds.height,tokens.primitives[tokens.semantic[c.height.token].ref].value)) e.push(`${label}: 고정 높이 토큰과 실제 높이 불일치`);
      }
      const parent=byId.get(n.parentId);
      if (parent && !(parent.scrollable===true && parent.clipsContent===true)) {
        const b=n.bounds,p=parent.bounds;
        if (p && (b.x<p.x-1 || b.y<p.y-1 || b.x+b.width>p.x+p.width+1 || b.y+b.height>p.y+p.height+1)) e.push(`${label}: 부모 경계 넘침`);
      }
    }
    const rate=reuseRate(nodes);
    if (stage==='screens' && (rate===null || rate<config.minimumReuseRate)) e.push(`${frame.name}: 재사용률 ${rate===null?'측정 대상 없음':Math.round(rate*100)+'%'} (반복 UI에 reusable 메타데이터 필요)`);
  }
  return e;
}
